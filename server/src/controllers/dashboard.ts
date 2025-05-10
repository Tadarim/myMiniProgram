import { Request, Response } from "express";
import pool from "../config/database";
import { RowDataPacket } from "mysql2";

export const getDashboardOverview = async (req: Request, res: Response) => {
  console.log("收到 dashboard overview 请求");
  try {
    // 1. 总数
    const [courseCountResult] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as courseCount FROM courses"
    );
    const [exerciseCountResult] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as exerciseCount FROM exercise_sets"
    );
    const [postCountResult] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as postCount FROM posts"
    );
    const [userCountResult] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as userCount FROM users"
    );

    const courseCount = courseCountResult[0].courseCount;
    const exerciseCount = exerciseCountResult[0].exerciseCount;
    const postCount = postCountResult[0].postCount;
    const userCount = userCountResult[0].userCount;

    // 2. 增长趋势（近30天）
    const [courseTrend] = await pool.query<RowDataPacket[]>(
      `SELECT DATE(created_at) as date, COUNT(*) as count FROM courses WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY date ORDER BY date`
    );
    const [exerciseTrend] = await pool.query<RowDataPacket[]>(
      `SELECT DATE(created_at) as date, COUNT(*) as count FROM exercise_sets WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY date ORDER BY date`
    );
    const [postTrend] = await pool.query<RowDataPacket[]>(
      `SELECT DATE(created_at) as date, COUNT(*) as count FROM posts WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY date ORDER BY date`
    );

    // 3. 热门排行（Top 5）
    const [courseHot] = await pool.query<RowDataPacket[]>(
      `SELECT title, view_count as count FROM courses ORDER BY view_count DESC LIMIT 5`
    );
    const [exerciseHot] = await pool.query<RowDataPacket[]>(
      `SELECT title, complete_count as count FROM exercise_sets ORDER BY complete_count DESC LIMIT 5`
    );
    const [postHot] = await pool.query<RowDataPacket[]>(
      `SELECT id, content, (SELECT COUNT(*) FROM post_likes WHERE post_id=posts.id) + (SELECT COUNT(*) FROM comments WHERE post_id=posts.id) as count FROM posts ORDER BY count DESC LIMIT 5`
    );

    // 4. 完成/收藏/互动分布
    const [courseCollect] = await pool.query<RowDataPacket[]>(
      `SELECT c.title, COUNT(f.id) as count FROM favorites f JOIN courses c ON f.target_id = c.id WHERE f.target_type='course' GROUP BY f.target_id ORDER BY count DESC LIMIT 5`
    );
    const [exerciseComplete] = await pool.query<RowDataPacket[]>(
      `SELECT e.title, COUNT(ec.id) as count FROM exercise_completions ec JOIN exercise_sets e ON ec.exercise_set_id = e.id GROUP BY ec.exercise_set_id ORDER BY count DESC LIMIT 5`
    );
    const [postInteract] = await pool.query<RowDataPacket[]>(
      `SELECT p.id, p.content, (SELECT COUNT(*) FROM post_likes WHERE post_id=p.id) + (SELECT COUNT(*) FROM comments WHERE post_id=p.id) as count FROM posts p ORDER BY count DESC LIMIT 5`
    );

    // 5. 用户活跃度趋势（近30天，按历史记录活跃）
    const [userActiveTrend] = await pool.query<RowDataPacket[]>(
      `SELECT DATE(created_at) as date, COUNT(DISTINCT user_id) as count FROM history_records WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY date ORDER BY date`
    );

    // 6. 收藏/历史类型分布
    const [favoriteTypeDist] = await pool.query<RowDataPacket[]>(
      `SELECT target_type as type, COUNT(*) as count FROM favorites GROUP BY target_type`
    );
    const [historyTypeDist] = await pool.query<RowDataPacket[]>(
      `SELECT target_type as type, COUNT(*) as count FROM history_records GROUP BY target_type`
    );

    res.json({
      code: 200,
      data: {
        courseCount,
        exerciseCount,
        postCount,
        userCount,
        courseTrend,
        exerciseTrend,
        postTrend,
        courseHot,
        exerciseHot,
        postHot,
        courseCollect,
        exerciseComplete,
        postInteract,
        userActiveTrend,
        favoriteTypeDist,
        historyTypeDist,
      },
    });
  } catch (e) {
    console.error("获取dashboard数据失败:", e);
    res
      .status(500)
      .json({ code: 500, message: "获取dashboard数据失败", error: e });
  }
};
