import pool from "../config/database";
import { formatTimeAgo } from "../utils/formatTimeAgo";

// 计算零均值兴趣向量
function calculateAverageVector(
  origin: any[]
): { name: string; count: number }[] {
  let tagCountSum = 0;
  const tagCount: { name: string; count: number }[] = [];
  for (let el of origin) {
    tagCountSum += el.count;
    tagCount.push({ name: el.tag_name, count: el.count });
  }
  const tagCountAvg = tagCount.length ? tagCountSum / tagCount.length : 0;
  for (let el of tagCount) {
    el.count -= tagCountAvg;
  }
  return tagCount;
}

// 获取兴趣向量
async function getInterestVectorByUser(userId: number) {
  const [rows] = await pool.query(
    "SELECT tag_name, count FROM tag_count WHERE user_id = ?",
    [userId]
  );
  return calculateAverageVector(rows as any[]);
}

// 计算余弦相似度
function calculateSimilarity(
  a_vector: any[],
  b_vector: any[],
  relateTagList: string[]
): number {
  let vectorInnerProduct = 0,
    vectorProductA = 0,
    vectorProductB = 0;
  for (let tag of relateTagList) {
    const a_select = a_vector.find((el) => el.name === tag);
    const b_select = b_vector.find((el) => el.name === tag);
    if (a_select && b_select) {
      vectorInnerProduct += a_select.count * b_select.count;
      vectorProductA += a_select.count * a_select.count;
      vectorProductB += b_select.count * b_select.count;
    }
  }
  vectorProductA = Math.sqrt(vectorProductA);
  vectorProductB = Math.sqrt(vectorProductB);
  if (vectorProductA === 0 || vectorProductB === 0) return 0;
  return vectorInnerProduct / (vectorProductA * vectorProductB);
}

// 获取推荐标签
function getRecommendTag(relateTagList: string[], userVector: any[]): string[] {
  return userVector
    .filter((el) => !relateTagList.includes(el.name))
    .map((el) => el.name);
}

// 更新用户相似度表
async function updateUserSimilarity(userId: number) {
  // 1. 获取目标用户兴趣向量
  const targetUserVector = await getInterestVectorByUser(userId);
  const relateTagList = targetUserVector.map((el) => el.name);
  // 2. 获取所有其他用户的兴趣向量原始数据
  const [rows] = await pool.query(
    "SELECT user_id, tag_name, count FROM tag_count WHERE user_id != ?",
    [userId]
  );
  const otherUserVectors: Record<string, { name: string; count: number }[]> =
    {};
  for (let el of rows as any[]) {
    if (!otherUserVectors[el.user_id]) otherUserVectors[el.user_id] = [];
    otherUserVectors[el.user_id].push({ name: el.tag_name, count: el.count });
  }
  // 3. 计算相似度和推荐标签
  const userSimilarityList: {
    user: string;
    similarity: number;
    tagList: string[];
  }[] = [];
  for (let user in otherUserVectors) {
    const otherVector = calculateAverageVector(otherUserVectors[user]);
    const similarity = calculateSimilarity(
      targetUserVector,
      otherVector,
      relateTagList
    );
    const tagList = getRecommendTag(relateTagList, otherVector);
    userSimilarityList.push({ user, similarity, tagList });
  }
  // 4. 写入 user_similarity 表
  for (let el of userSimilarityList) {
    if (isNaN(el.similarity) || !el.user) continue;
    const [exist] = await pool.query(
      "SELECT * FROM user_similarity WHERE user_a = ? AND user_b = ?",
      [userId, el.user]
    );
    if ((exist as any[]).length) {
      await pool.query(
        "UPDATE user_similarity SET similarity = ?, taglist = ? WHERE user_a = ? AND user_b = ?",
        [el.similarity, el.tagList.join(","), userId, el.user]
      );
    } else {
      await pool.query(
        "INSERT INTO user_similarity (user_a, user_b, similarity, taglist) VALUES (?, ?, ?, ?)",
        [userId, el.user, el.similarity, el.tagList.join(",")]
      );
    }
  }
}

// 获取推荐用户
async function getRecommendedUsers(userId: number, limit = 5) {
  // 先查出没聊过的相似用户
  const [rows] = await pool.query(
    `SELECT user_b as id, similarity FROM user_similarity 
     WHERE user_a = ? 
     AND user_b NOT IN (
       SELECT CASE 
         WHEN user_id = ? THEN target_id 
         ELSE user_id 
       END as other_id
       FROM chat_sessions 
       WHERE (user_id = ? OR target_id = ?) AND type = 'single'
     )
     ORDER BY similarity DESC LIMIT ?`,
    [userId, userId, userId, userId, limit]
  );

  // 如果没有相似用户，返回活跃用户（同样排除有会话的）
  if (!(rows as any[]).length) {
    const [activeUsers] = await pool.query(
      `SELECT u.id, u.username, u.avatar, GROUP_CONCAT(DISTINCT t.name) as tags FROM users u
       LEFT JOIN tag_count tc ON u.id = tc.user_id
       LEFT JOIN tags t ON tc.tag_name = t.name
       WHERE u.id != ? 
       AND u.id NOT IN (
         SELECT CASE 
           WHEN user_id = ? THEN target_id 
           ELSE user_id 
         END as other_id
         FROM chat_sessions 
         WHERE (user_id = ? OR target_id = ?) AND type = 'single'
       )
       GROUP BY u.id
       ORDER BY RAND() 
       LIMIT ?`,
      [userId, userId, userId, userId, limit]
    );
    return (activeUsers as any[]).map((u) => ({
      ...u,
      similarity: 0,
      tags: u.tags || "",
    }));
  }

  const ids = (rows as any[]).map((r) => r.id);
  if (!ids.length) return [];
  const [users] = await pool.query(
    `SELECT u.id, u.username, u.avatar, GROUP_CONCAT(DISTINCT t.name) as tags FROM users u
     LEFT JOIN tag_count tc ON u.id = tc.user_id
     LEFT JOIN tags t ON tc.tag_name = t.name
     WHERE u.id IN (${ids.map(() => "?").join(",")})
     GROUP BY u.id`,
    ids
  );
  // 合并 similarity
  return (users as any[]).map((u) => ({
    ...u,
    similarity: (rows as any[]).find((r) => r.id == u.id)?.similarity || 0,
    tags: u.tags || "",
  }));
}

// 获取推荐标签
async function getRecommendedTags(userId: number, limit = 10) {
  const [rows] = await pool.query(
    "SELECT taglist FROM user_similarity WHERE user_a = ? ORDER BY similarity DESC LIMIT 5",
    [userId]
  );
  const tagArr = (rows as any[]).flatMap((r) =>
    (r.taglist || "").split(",").filter(Boolean)
  );

  return Array.from(new Set(tagArr)).slice(0, limit);
}

// 获取推荐题目
async function getRecommendedExercises(userId: number, limit = 5) {
  const tags = await getRecommendedTags(userId, 10);

  // 如果没有推荐标签，返回热门题目
  if (!tags.length) {
    const [hotExercises] = await pool.query(
      `SELECT es.*, 
       (SELECT COUNT(*) FROM questions WHERE exercise_set_id = es.id) as question_count,
       (SELECT COUNT(*) FROM exercise_completions WHERE exercise_set_id = es.id) as complete_count
       FROM exercise_sets es 
       ORDER BY complete_count DESC 
       LIMIT ?`,
      [limit]
    );
    return hotExercises;
  }

  const [rows] = await pool.query(
    `SELECT es.*, 
     (SELECT COUNT(*) FROM questions WHERE exercise_set_id = es.id) as question_count,
     (SELECT COUNT(*) FROM exercise_completions WHERE exercise_set_id = es.id) as complete_count
     FROM exercise_sets es 
     LEFT JOIN exercise_tags et ON es.id = et.exercise_set_id 
     LEFT JOIN tags t ON et.tag_id = t.id 
     WHERE t.name IN (${tags.map(() => "?").join(",")}) 
     GROUP BY es.id 
     ORDER BY complete_count DESC 
     LIMIT ?`,
    [...tags, limit]
  );
  return rows;
}

// 获取推荐小组
async function getRecommendedGroups(userId: number, limit = 5) {
  const tags = await getRecommendedTags(userId, 10);

  // 如果没有推荐标签，返回活跃小组
  if (!tags.length) {
    const [activeGroups] = await pool.query(
      `SELECT g.*, 
        (SELECT COUNT(*) FROM chat_group_members WHERE group_id = g.id) as member_count,
        (SELECT id FROM chat_sessions WHERE group_id = g.id AND type = 'group' LIMIT 1) as session_id,
        EXISTS(SELECT 1 FROM chat_group_members WHERE group_id = g.id AND user_id = ?) as is_member
       FROM chat_groups g 
       LEFT JOIN chat_group_members m ON g.id = m.group_id 
       WHERE NOT EXISTS(SELECT 1 FROM chat_group_members WHERE group_id = g.id AND user_id = ?)
       GROUP BY g.id 
       ORDER BY member_count DESC 
       LIMIT ?`,
      [userId, userId, limit]
    );
    return activeGroups;
  }

  const [rows] = await pool.query(
    `SELECT g.*, 
      (SELECT COUNT(*) FROM chat_group_members WHERE group_id = g.id) as member_count,
      (SELECT id FROM chat_sessions WHERE group_id = g.id AND type = 'group' LIMIT 1) as session_id,
      EXISTS(SELECT 1 FROM chat_group_members WHERE group_id = g.id AND user_id = ?) as is_member
     FROM chat_groups g 
     LEFT JOIN chat_group_members m ON g.id = m.group_id 
     LEFT JOIN group_tags gt ON g.id = gt.group_id 
     LEFT JOIN tags t ON gt.tag_id = t.id 
     WHERE t.name IN (${tags.map(() => "?").join(",")}) 
     AND NOT EXISTS(SELECT 1 FROM chat_group_members WHERE group_id = g.id AND user_id = ?)
     GROUP BY g.id 
     ORDER BY member_count DESC 
     LIMIT ?`,
    [userId, ...tags, userId, limit]
  );
  return rows;
}

// 获取推荐帖子
async function getRecommendedPosts(userId: number, limit = 5) {
  const tags = await getRecommendedTags(userId, 10);

  // 如果没有推荐标签，返回热门帖子
  if (!tags.length) {
    const [hotPosts]: any[] = await pool.query(
      `SELECT p.*, u.username, u.avatar, 
        TIMESTAMPDIFF(SECOND, p.created_at, NOW()) as time_ago,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
        (SELECT COUNT(*) FROM favorites WHERE target_id = p.id AND target_type = 'post') as collections_count,
        EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) as is_liked,
        EXISTS(SELECT 1 FROM favorites WHERE target_id = p.id AND target_type = 'post' AND user_id = ?) as is_collected,
        GROUP_CONCAT(t.name) as tags
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.type = 'help' AND p.status = 'public' AND p.author_id != ?
      GROUP BY p.id
      ORDER BY (likes_count + comments_count * 2 + collections_count * 3) DESC
      LIMIT ?`,
      [userId, userId, userId, limit]
    );
    // 格式化 time_ago 字段
    return (hotPosts as any[]).map((row: any) => ({
      ...row,
      time_ago: formatTimeAgo(row.time_ago),
    }));
  }

  const [rows] = await pool.query(
    `SELECT p.*, u.username, u.avatar, 
      TIMESTAMPDIFF(SECOND, p.created_at, NOW()) as time_ago,
      (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
      (SELECT COUNT(*) FROM favorites WHERE target_id = p.id AND target_type = 'post') as collections_count,
      EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) as is_liked,
      EXISTS(SELECT 1 FROM favorites WHERE target_id = p.id AND target_type = 'post' AND user_id = ?) as is_collected,
      GROUP_CONCAT(t.name) as tags
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.type = 'help' AND p.status = 'public' AND p.author_id != ?
    GROUP BY p.id
    ORDER BY (likes_count + comments_count * 2 + collections_count * 3) DESC
    LIMIT ?`,
    [userId, userId, userId, limit]
  );
  // 格式化 time_ago 字段
  return (rows as any[]).map((row: any) => ({
    ...row,
    time_ago: formatTimeAgo(row.time_ago),
  }));
}

// 获取推荐课程
async function getRecommendedCourses(userId: number, limit = 5) {
  const tags = await getRecommendedTags(userId, 10);
  // 没有标签，推荐热门课程
  if (!tags.length) {
    const [hotCourses] = await pool.query(
      `SELECT c.* FROM courses c WHERE c.status = 'published' ORDER BY c.rating DESC, c.created_at DESC LIMIT ?`,
      [limit]
    );
    return hotCourses;
  }
  // 有标签，推荐相关课程
  const [rows] = await pool.query(
    `SELECT c.* FROM courses c
     LEFT JOIN course_tags ct ON c.id = ct.course_id
     LEFT JOIN tags t ON ct.tag_id = t.id
     WHERE c.status = 'published' AND t.name IN (${tags
       .map(() => "?")
       .join(",")})
     GROUP BY c.id
     ORDER BY c.rating DESC, c.created_at DESC
     LIMIT ?`,
    [...tags, limit]
  );
  return rows;
}

export {
  updateUserSimilarity,
  getRecommendedUsers,
  getRecommendedTags,
  getRecommendedExercises,
  getRecommendedGroups,
  getRecommendedPosts,
  getRecommendedCourses,
};
