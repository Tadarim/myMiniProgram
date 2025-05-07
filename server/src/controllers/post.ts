import { Request, Response } from "express";
import pool from "../config/database";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { formatTimeAgo } from "../utils/formatTimeAgo";
import qiniu from "qiniu";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import fs from "fs";
import * as fsPromises from "fs/promises";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const accessKey = process.env.QINIU_ACCESS_KEY;
const secretKey = process.env.QINIU_SECRET_KEY;
const bucket = process.env.QINIU_BUCKET;
const domain = process.env.QINIU_DOMAIN;
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const putPolicy = new qiniu.rs.PutPolicy({ scope: bucket, expires: 7200 });
const uploadToken = putPolicy.uploadToken(mac);

function getMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case '.pdf': return 'application/pdf';
    case '.doc': return 'application/msword';
    case '.docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.ppt': return 'application/vnd.ms-powerpoint';
    case '.pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case '.txt': return 'text/plain';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.png': return 'image/png';
    case '.gif': return 'image/gif';
    case '.mp4': return 'video/mp4';
    case '.mp3': return 'audio/mpeg';
    default: return 'application/octet-stream';
  }
}

async function uploadToQiniu(filePath: string, fileName: string): Promise<{ url: string; key: string }> {
  const key = `${uuidv4()}${path.extname(fileName)}`;
  const config = new qiniu.conf.Config();
  config.zone = qiniu.zone.Zone_z1;
  config.useCdnDomain = true;
  const formUploader = new qiniu.form_up.FormUploader(config);
  const putExtra = new qiniu.form_up.PutExtra();
  putExtra.mimeType = getMimeType(fileName);
  return new Promise((resolve, reject) => {
    formUploader.putFile(
      uploadToken,
      key,
      filePath,
      putExtra,
      (err, body, info) => {
        if (err) return reject(err);
        if (info.statusCode !== 200) return reject(new Error("七牛云上传失败"));
        if (!domain) {
          throw new Error("七牛云 domain 未配置");
        }
        const url = domain.replace(/\/$/, '') + '/' + key;
        resolve({ url, key });
      }
    );
  });
}

// 获取帖子列表
export const getPosts = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10, type, keyword } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let sql = `
      SELECT 
        p.*,
        u.username,
        u.avatar,
        TIMESTAMPDIFF(SECOND, p.created_at, NOW()) as time_ago,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
        (SELECT COUNT(*) FROM post_collections WHERE post_id = p.id) as collections_count,
        EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) as is_liked,
        EXISTS(SELECT 1 FROM post_collections WHERE post_id = p.id AND user_id = ?) as is_collected,
        GROUP_CONCAT(t.name) as tags
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE 1=1
    `;
    const params: any[] = [req.user?.id, req.user?.id];

    if (type && type !== 'all') {
      sql += " AND p.type = ?";
      params.push(type);
    }

    if (keyword) {
      sql += " AND (p.content LIKE ? OR u.username LIKE ?)";
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += " GROUP BY p.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
    params.push(Number(pageSize), offset);

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);

    // 格式化时间
    const formattedRows = rows.map(row => ({
      ...row,
      time_ago: formatTimeAgo(row.time_ago)
    }));

    // 获取总数
    let countSql = `
      SELECT COUNT(DISTINCT p.id) as total 
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE 1=1
    `;
    const countParams: any[] = [];

    if (type && type !== 'all') {
      countSql += " AND p.type = ?";
      countParams.push(type);
    }

    if (keyword) {
      countSql += " AND (p.content LIKE ? OR u.username LIKE ?)";
      countParams.push(`%${keyword}%`, `%${keyword}%`);
    }

    const [countRows] = await pool.query<RowDataPacket[]>(countSql, countParams);
    const total = countRows[0].total;

    res.json({
      code: 200,
      success: true,
      data: formattedRows,
      total,
      message: "获取成功",
    });
  } catch (error) {
    console.error("获取帖子列表失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 创建帖子
export const createPost = async (req: Request, res: Response) => {
  try {
    const { content, attachments, type, tags } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    if (!content) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "内容不能为空",
      });
    }

    // 开始事务
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 插入帖子，支持多个附件
      const [result] = await connection.query<ResultSetHeader>(
        "INSERT INTO posts (author_id, content, attachments, type) VALUES (?, ?, ?, ?)",
        [userId, content, JSON.stringify(attachments || []), type]
      );
      const postId = result.insertId;

      // 处理标签
      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          const [tagResult] = await connection.query<ResultSetHeader>(
            "INSERT IGNORE INTO tags (name) VALUES (?)",
            [tagName]
          );
          let tagId = tagResult.insertId;
          if (!tagId) {
            const [existingTag] = await connection.query<RowDataPacket[]>(
              "SELECT id FROM tags WHERE name = ?",
              [tagName]
            );
            tagId = existingTag[0].id;
          }
          await connection.query(
            "INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)",
            [postId, tagId]
          );
        }
      }

      await connection.commit();

      // 获取新创建的帖子信息
      const [newPost] = await pool.query<RowDataPacket[]>(
        `SELECT 
          p.*,
          u.username,
          u.avatar,
          TIMESTAMPDIFF(SECOND, p.created_at, NOW()) as time_ago,
          0 as likes_count,
          0 as comments_count,
          0 as collections_count,
          false as is_liked,
          false as is_collected,
          GROUP_CONCAT(t.name) as tags
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN post_tags pt ON p.id = pt.post_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        WHERE p.id = ?
        GROUP BY p.id`,
        [postId]
      );

      const formattedPost = {
        ...newPost[0],
        attachments: JSON.parse(newPost[0].attachments || '[]'),
        time_ago: formatTimeAgo(newPost[0].time_ago)
      };

      res.json({
        code: 200,
        success: true,
        data: formattedPost,
        message: "发布成功",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("创建帖子失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 点赞/取消点赞
export const toggleLike = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    // 检查是否已点赞
    const [existingLike] = await pool.query<RowDataPacket[]>(
      "SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?",
      [postId, userId]
    );

    const hasLiked = existingLike.length > 0;

    if (hasLiked) {
      // 取消点赞
      await pool.query(
        "DELETE FROM post_likes WHERE post_id = ? AND user_id = ?",
        [postId, userId]
      );
    } else {
      // 添加点赞
      await pool.query(
        "INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)",
        [postId, userId]
      );
    }

    // 获取更新后的点赞数
    const [likesCount] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?",
      [postId]
    );

    res.json({
      code: 200,
      success: true,
      data: {
        likes_count: likesCount[0].count,
        is_liked: !hasLiked,
      },
      message: hasLiked ? "取消点赞成功" : "点赞成功",
    });
  } catch (error) {
    console.error("操作点赞失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 收藏/取消收藏
export const toggleCollection = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    // 检查是否已收藏
    const [existingCollection] = await pool.query<RowDataPacket[]>(
      "SELECT 1 FROM post_collections WHERE post_id = ? AND user_id = ?",
      [postId, userId]
    );

    const hasCollected = existingCollection.length > 0;

    if (hasCollected) {
      // 取消收藏
      await pool.query(
        "DELETE FROM post_collections WHERE post_id = ? AND user_id = ?",
        [postId, userId]
      );
    } else {
      // 添加收藏
      await pool.query(
        "INSERT INTO post_collections (post_id, user_id) VALUES (?, ?)",
        [postId, userId]
      );
    }

    // 获取更新后的收藏数
    const [collectionsCount] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM post_collections WHERE post_id = ?",
      [postId]
    );

    res.json({
      code: 200,
      success: true,
      data: {
        collections_count: collectionsCount[0].count,
        is_collected: !hasCollected,
      },
      message: hasCollected ? "取消收藏成功" : "收藏成功",
    });
  } catch (error) {
    console.error("操作收藏失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 获取帖子详情
export const getPostDetail = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    // 获取帖子基本信息
    const [posts] = await pool.query(
      `SELECT 
        p.*,
        u.username,
        u.avatar,
        TIMESTAMPDIFF(SECOND, p.created_at, NOW()) as time_ago,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
        (SELECT COUNT(*) FROM post_collections WHERE post_id = p.id) as collections_count,
        EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) as is_liked,
        EXISTS(SELECT 1 FROM post_collections WHERE post_id = p.id AND user_id = ?) as is_collected,
        GROUP_CONCAT(t.name) as tags
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.id = ?
      GROUP BY p.id`,
      [userId, userId, postId]
    );

    if (!(posts as any[]).length) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "帖子不存在",
      });
    }

    // 格式化时间
    const formattedPost = {
      ...(posts as any[])[0],
      time_ago: formatTimeAgo((posts as any[])[0].time_ago)
    };

    // 获取评论列表
    const [comments] = await pool.query(
      `SELECT 
        c.id,
        c.user_id as author_id,
        u.username,
        u.avatar,
        c.content as comment_content,
        TIMESTAMPDIFF(SECOND, c.created_at, NOW()) as comment_time
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC`,
      [postId]
    );

    // 格式化评论时间
    const formattedComments = (comments as any[]).map(comment => ({
      ...comment,
      comment_time: formatTimeAgo(comment.comment_time)
    }));

    const postData = {
      ...formattedPost,
      comments: formattedComments || []
    };

    res.json({
      code: 200,
      success: true,
      data: postData,
      message: "获取成功",
    });
  } catch (error) {
    console.error("获取帖子详情失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 获取帖子评论
export const getComments = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    const [comments] = await pool.query(
      `SELECT 
        c.id,
        c.user_id as author_id,
        u.username,
        u.avatar,
        c.content as content,
        TIMESTAMPDIFF(SECOND, c.created_at, NOW()) as time_ago
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?`,
      [postId, Number(pageSize), offset]
    );

    // 获取评论总数
    const [countResult] = await pool.query(
      "SELECT COUNT(*) as total FROM comments WHERE post_id = ?",
      [postId]
    );
    const total = (countResult as any[])[0].total;

    // 格式化评论结构和时间
    const formattedComments = (comments as any[]).map(comment => ({
      id: comment.id,
      content: comment.content,
      author_id: comment.author_id,
      username: comment.username,
      avatar: comment.avatar,
      time_ago: formatTimeAgo(comment.time_ago)
    }));

    res.json({
      code: 200,
      success: true,
      data: formattedComments,
      total,
      message: "获取成功",
    });
  } catch (error) {
    console.error("获取评论失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 添加评论
export const addComment = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    if (!content) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "评论内容不能为空",
      });
    }

    const [result] = await pool.query(
      "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)",
      [postId, userId, content]
    );

    // 获取新创建的评论信息
    const [newComment] = await pool.query(
      `SELECT 
        c.id,
        c.user_id as author_id,
        u.username,
        u.avatar,
        c.content as content,
        TIMESTAMPDIFF(SECOND, c.created_at, NOW()) as time_ago
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`,
      [(result as any).insertId]
    );

    const formattedComment = {
      id: (newComment as any[])[0].id,
      content: (newComment as any[])[0].content,
      author_id: (newComment as any[])[0].author_id,
      username: (newComment as any[])[0].username,
      avatar: (newComment as any[])[0].avatar,
      time_ago: formatTimeAgo((newComment as any[])[0].time_ago)
    };

    res.json({
      code: 200,
      success: true,
      data: formattedComment,
      message: "评论成功",
    });
  } catch (error) {
    console.error("添加评论失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 删除帖子
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    // 检查帖子是否存在且是否为当前用户发布
    const [post] = await pool.query<RowDataPacket[]>(
      "SELECT author_id FROM posts WHERE id = ?",
      [postId]
    );

    if (!post.length) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "帖子不存在",
      });
    }

    if (post[0].author_id !== userId) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "无权删除此帖子",
      });
    }

    // 开始事务
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 删除相关的点赞记录
      await connection.query(
        "DELETE FROM post_likes WHERE post_id = ?",
        [postId]
      );

      // 删除相关的收藏记录
      await connection.query(
        "DELETE FROM post_collections WHERE post_id = ?",
        [postId]
      );

      // 删除相关的评论
      await connection.query(
        "DELETE FROM comments WHERE post_id = ?",
        [postId]
      );

      // 删除帖子-标签关联
      await connection.query(
        "DELETE FROM post_tags WHERE post_id = ?",
        [postId]
      );

      // 删除帖子
      await connection.query(
        "DELETE FROM posts WHERE id = ?",
        [postId]
      );

      await connection.commit();

      res.json({
        code: 200,
        success: true,
        message: "删除成功",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("删除帖子失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 上传图片/文件接口
export const uploadPostFile = async (req: Request, res: Response) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "未找到上传的文件" });
    }
    const file = Array.isArray(req.files.file) ? req.files.file[0] : req.files.file;
    const fileName = req.body.fileName || file.name;
    if (!fs.existsSync(file.tempFilePath)) {
      return res.status(400).json({ error: "临时文件不存在" });
    }
    const qiniuResult = await uploadToQiniu(file.tempFilePath, fileName);
    try { await fsPromises.unlink(file.tempFilePath); } catch {}
    res.json({ success: true, data: { url: qiniuResult.url, key: qiniuResult.key } });
  } catch (error) {
    res.status(500).json({ success: false, error: "上传失败", message: error instanceof Error ? error.message : "未知错误" });
  }
}; 