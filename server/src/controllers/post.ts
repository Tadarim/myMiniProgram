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
    case ".pdf":
      return "application/pdf";
    case ".doc":
      return "application/msword";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case ".ppt":
      return "application/vnd.ms-powerpoint";
    case ".pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case ".txt":
      return "text/plain";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".mp4":
      return "video/mp4";
    case ".mp3":
      return "audio/mpeg";
    default:
      return "application/octet-stream";
  }
}

function getFileType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case ".pdf":
      return "pdf";
    case ".doc":
    case ".docx":
      return "doc";
    case ".ppt":
    case ".pptx":
      return "ppt";
    case ".txt":
      return "txt";
    case ".jpg":
    case ".jpeg":
    case ".png":
    case ".gif":
      return "image";
    case ".mp4":
    case ".avi":
    case ".mov":
      return "video";
    case ".mp3":
    case ".wav":
      return "audio";
    default:
      return "other";
  }
}

async function uploadToQiniu(
  filePath: string,
  fileName: string
): Promise<{ url: string; fileName: string; fileType: string }> {
  const key = `${uuidv4()}${path.extname(fileName)}`;
  console.log("准备上传到七牛云:", key);

  if (!domain) {
    throw new Error("七牛云域名未配置");
  }

  if (!accessKey || !secretKey) {
    throw new Error("七牛云密钥未配置");
  }

  // 检查文件是否存在
  if (!fs.existsSync(filePath)) {
    throw new Error("文件不存在");
  }

  // 检查文件大小
  const stats = fs.statSync(filePath);
  console.log("上传文件大小:", stats.size, "bytes");
  if (stats.size === 0) {
    throw new Error("文件大小为0");
  }

  const config = new qiniu.conf.Config();
  config.zone = qiniu.zone.Zone_z1; // 华北区域
  config.useCdnDomain = true;
  const formUploader = new qiniu.form_up.FormUploader(config);
  const putExtra = new qiniu.form_up.PutExtra();

  // 设置文件类型
  const mimeType = getMimeType(fileName);
  putExtra.mimeType = mimeType;

  return new Promise((resolve, reject) => {
    formUploader.putFile(
      uploadToken,
      key,
      filePath,
      putExtra,
      (err, body, info) => {
        if (err) {
          console.error("七牛云上传错误:", err);
          reject(err);
          return;
        }
        if (info.statusCode !== 200) {
          console.error("七牛云上传失败:", info);
          reject(new Error("七牛云上传失败"));
          return;
        }

        console.log("七牛云上传成功:", body);
        console.log("上传响应信息:", info);

        // 生成私有下载链接
        const deadline = Math.floor(Date.now() / 1000) + 86400; // 24小时有效期
        const bucketManager = new qiniu.rs.BucketManager(mac, config);

        // 确保域名格式正确s
        const baseUrl = domain.startsWith("http") ? domain : `http://${domain}`;

        // 生成私有下载链接
        const encodedFileName = encodeURIComponent(fileName);
        const privateDownloadUrl =
          bucketManager.privateDownloadUrl(baseUrl, key, deadline) +
          `&attname=${encodedFileName}`;

        console.log("生成的下载链接:", privateDownloadUrl);
        console.log("使用的域名:", baseUrl);
        console.log("文件key:", key);
        console.log("MIME类型:", mimeType);
        console.log("原始文件名:", fileName);
        console.log("编码后的文件名:", encodedFileName);

        resolve({
          url: privateDownloadUrl,
          fileName: fileName,
          fileType: getFileType(fileName),
        });
      }
    );
  });
}

// 生成新的带token的文件URL
function refreshFileUrl(fileUrl: string, fileName: string): string {
  try {
    if (!domain || !fileUrl) return fileUrl;
    
    // 从URL中提取文件key
    const urlParts = fileUrl.split('/');
    const key = urlParts[urlParts.length - 1];
    
    // 确保域名格式正确
    const baseUrl = domain.startsWith("http") ? domain : `http://${domain}`;
    
    // 生成新的24小时有效期的token URL
    const deadline = Math.floor(Date.now() / 1000) + 86400; // 24小时
    const config = new qiniu.conf.Config();
    config.zone = qiniu.zone.Zone_z1;
    const bucketManager = new qiniu.rs.BucketManager(mac, config);
    
    // 添加原始文件名参数
    const encodedFileName = encodeURIComponent(fileName || 'file');
    const privateDownloadUrl = 
      bucketManager.privateDownloadUrl(baseUrl, key, deadline) +
      `&attname=${encodedFileName}`;
    
    return privateDownloadUrl;
  } catch (err) {
    console.error("刷新文件URL失败:", err);
    return fileUrl; // 如果出错，返回原始URL
  }
}

// 处理帖子中的附件URL
function processPostAttachments(post: any): any {
  if (!post.attachments) return post;
  
  try {
    // 解析attachments字段
    let attachments = typeof post.attachments === 'string' 
      ? JSON.parse(post.attachments) 
      : post.attachments;
    
    if (Array.isArray(attachments)) {
      // 刷新每个附件的URL
      attachments = attachments.map(att => {
        if (att.url) {
          att.url = refreshFileUrl(att.url, att.name || '');
        }
        return att;
      });
      
      // 重新赋值
      post.attachments = attachments;
    }
  } catch (err) {
    console.error("处理帖子附件URL失败:", err);
  }
  
  return post;
}

// 获取帖子列表
export const getPosts = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10, type, keyword } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);
    const auth = req.auth as { id: number; role: "admin" | "user" } | undefined;
    const userId = auth?.id;
    const isAdmin = auth?.role === "admin";

    let sql = `
      SELECT 
        p.*,
        u.username,
        u.avatar,
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
    `;
    const params: any[] = [userId, userId];

    // 如果不是管理员，只返回公开的帖子
    if (!isAdmin) {
      sql += " WHERE p.status = 'public'";
    }

    if (type && type !== "all") {
      sql += isAdmin ? " WHERE " : " AND ";
      sql += "p.type = ?";
      params.push(type);
    }

    if (keyword) {
      sql += isAdmin && !type ? " WHERE " : " AND ";
      sql += "(p.content LIKE ? OR u.username LIKE ?)";
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += " GROUP BY p.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
    params.push(Number(pageSize), offset);

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);

    // 处理帖子中的附件URL并格式化时间
    const formattedRows = rows.map((row) => {
      const processedRow = processPostAttachments(row);
      return {
        ...processedRow,
        time_ago: formatTimeAgo(processedRow.time_ago),
      };
    });

    // 获取总数
    let countSql = `
      SELECT COUNT(DISTINCT p.id) as total 
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
    `;
    const countParams: any[] = [];

    // 如果不是管理员，只统计公开的帖子
    if (!isAdmin) {
      countSql += " WHERE p.status = 'public'";
    }

    if (type && type !== "all") {
      countSql += isAdmin ? " WHERE " : " AND ";
      countSql += "p.type = ?";
      countParams.push(type);
    }

    if (keyword) {
      countSql += isAdmin && !type ? " WHERE " : " AND ";
      countSql += "(p.content LIKE ? OR u.username LIKE ?)";
      countParams.push(`%${keyword}%`, `%${keyword}%`);
    }

    const [countRows] = await pool.query<RowDataPacket[]>(
      countSql,
      countParams
    );
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
    const {
      content,
      type,
      tags: manualTags,
      attachments,
      status = "public",
    } = req.body;
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

    // 自动提取标签
    const autoTags = extractTagsFromContent(content);
    // 合并手动添加的标签和自动提取的标签
    const tags = [...new Set([...(manualTags || []), ...autoTags])];

    // 开始事务
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 插入帖子，支持多个附件
      const [result] = await connection.query<ResultSetHeader>(
        "INSERT INTO posts (author_id, content, attachments, type, status) VALUES (?, ?, ?, ?, ?)",
        [userId, content, JSON.stringify(attachments || []), type, status]
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

          // 更新 tag_count
          await connection.query(
            `INSERT INTO tag_count (user_id, tag_name, count) VALUES (?, ?, 1)
             ON DUPLICATE KEY UPDATE count = count + 1`,
            [userId, tagName]
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

      // 解析 attachments
      let parsedAttachments = [];
      try {
        // MySQL 的 JSON 类型会自动解析
        parsedAttachments = newPost[0].attachments || [];
      } catch (error) {
        console.error("解析 attachments 失败:", error);
        parsedAttachments = attachments || []; // 如果解析失败，使用传入的 attachments
      }

      const formattedPost = {
        ...newPost[0],
        attachments: parsedAttachments,
        time_ago: formatTimeAgo(newPost[0].time_ago),
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
      "SELECT 1 FROM favorites WHERE target_id = ? AND target_type = 'post' AND user_id = ?",
      [postId, userId]
    );

    const hasCollected = existingCollection.length > 0;

    if (hasCollected) {
      // 取消收藏
      await pool.query(
        "DELETE FROM favorites WHERE target_id = ? AND target_type = 'post' AND user_id = ?",
        [postId, userId]
      );
    } else {
      // 添加收藏
      await pool.query(
        "INSERT INTO favorites (user_id, target_id, target_type) VALUES (?, ?, 'post')",
        [userId, postId]
      );
    }

    // 获取更新后的收藏数
    const [collectionsCount] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM favorites WHERE target_id = ? AND target_type = 'post'",
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
        (SELECT COUNT(*) FROM favorites WHERE target_id = p.id AND target_type = 'post') as collections_count,
        EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) as is_liked,
        EXISTS(SELECT 1 FROM favorites WHERE target_id = p.id AND target_type = 'post' AND user_id = ?) as is_collected,
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

    // 处理附件URL并格式化时间
    let post = (posts as any[])[0];
    post = processPostAttachments(post);
    const formattedPost = {
      ...post,
      time_ago: formatTimeAgo(post.time_ago),
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
    const formattedComments = (comments as any[]).map((comment) => ({
      ...comment,
      comment_time: formatTimeAgo(comment.comment_time),
    }));

    const postData = {
      ...formattedPost,
      comments: formattedComments || [],
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
    const formattedComments = (comments as any[]).map((comment) => ({
      id: comment.id,
      content: comment.content,
      author_id: comment.author_id,
      username: comment.username,
      avatar: comment.avatar,
      time_ago: formatTimeAgo(comment.time_ago),
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
      time_ago: formatTimeAgo((newComment as any[])[0].time_ago),
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
    const auth = req.auth as { id: number; role: "admin" | "user" } | undefined;
    const userId = auth?.id;
    const isAdmin = auth?.role === "admin";

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    // 检查帖子是否存在
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

    // 只有管理员或帖子作者可以删除
    if (!isAdmin && post[0].author_id !== userId) {
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
      await connection.query("DELETE FROM post_likes WHERE post_id = ?", [
        postId,
      ]);

      // 删除相关的收藏记录
      await connection.query("DELETE FROM favorites WHERE target_id = ? AND target_type = 'post'", [
        postId,
      ]);

      // 删除相关的评论
      await connection.query("DELETE FROM comments WHERE post_id = ?", [
        postId,
      ]);

      // 删除帖子-标签关联
      await connection.query("DELETE FROM post_tags WHERE post_id = ?", [
        postId,
      ]);

      // 删除帖子
      await connection.query("DELETE FROM posts WHERE id = ?", [postId]);

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
    console.log("请求体:", req.body);
    console.log("请求文件:", req.files);
    console.log("请求头:", req.headers);

    if (!req.files || !req.files.file) {
      console.error("未找到上传的文件，请求体:", req.body);
      return res.status(400).json({ error: "未找到上传的文件" });
    }

    const file = Array.isArray(req.files.file)
      ? req.files.file[0]
      : req.files.file;
    const fileName = req.body.fileName || file.name;

    console.log("收到上传请求:", {
      fileName,
      fileSize: file.size,
      mimeType: file.mimetype,
      path: file.tempFilePath,
    });

    // 检查文件是否存在
    if (!fs.existsSync(file.tempFilePath)) {
      console.error("临时文件不存在:", file.tempFilePath);
      return res.status(400).json({ error: "临时文件不存在" });
    }

    // 检查文件大小
    const stats = fs.statSync(file.tempFilePath);
    console.log("文件实际大小:", stats.size, "bytes");
    if (stats.size === 0) {
      console.error("文件大小为0:", file.tempFilePath);
      return res.status(400).json({ error: "文件大小为0" });
    }

    // 上传到七牛云，使用 uploadToQiniu 函数获取带有访问 token 的 URL
    console.log("开始上传到七牛云...");
    const qiniuResult = await uploadToQiniu(file.tempFilePath, fileName);
    console.log("七牛云上传结果:", qiniuResult);

    // 删除临时文件
    try {
      await fsPromises.unlink(file.tempFilePath);
      console.log("临时文件已删除:", file.tempFilePath);
    } catch (unlinkError) {
      console.error("删除临时文件失败:", unlinkError);
    }

    // 返回完整的信息，包括带有访问 token 的 URL
    res.json({
      success: true,
      data: {
        url: qiniuResult.url,
        fileName: fileName,
        fileType: getMimeType(fileName),
      },
    });
  } catch (error) {
    console.error("上传文件失败:", error);
    res.status(500).json({
      success: false,
      error: "上传文件失败",
      message: error instanceof Error ? error.message : "未知错误",
    });
  }
};

// 改进的标签提取函数
function extractTagsFromContent(content: string): string[] {
  const tags: string[] = [];

  // 定义标签映射规则
  const tagRules: Record<string, string[]> = {
    学习问题: [
      // 问题相关
      "问题",
      "不会",
      "不懂",
      "请教",
      "求助",
      "疑问",
      "困惑",
      "难题",
      "困难",
      // 学习相关
      "学习",
      "课程",
      "作业",
      "考试",
      "题目",
      "答案",
      "解析",
      "讲解",
      "复习",
      "预习",
      // 具体学科
      "数学",
      "物理",
      "化学",
      "生物",
      "英语",
      "语文",
      "历史",
      "地理",
      "政治",
      // 学习状态
      "笔记",
      "重点",
      "难点",
      "考点",
      "知识点",
      "概念",
      "公式",
      "定理",
      "原理",
      // 学习方式
      "自学",
      "补课",
      "辅导",
      "培训",
      "讲座",
      "课程",
      "教材",
      "课本",
    ],
    组队邀请: [
      // 组队相关
      "组队",
      "队友",
      "一起",
      "合作",
      "项目",
      "团队",
      "招募",
      "组员",
      // 角色相关
      "伙伴",
      "搭档",
      "协作",
      "分工",
      "配合",
      "成员",
      "队员",
      "同学",
      // 活动相关
      "比赛",
      "竞赛",
      "活动",
      "项目",
      "课题",
      "实验",
      "研究",
      "开发",
      // 技能相关
      "编程",
      "设计",
      "写作",
      "翻译",
      "策划",
      "运营",
      "管理",
      "组织",
      // 时间相关
      "长期",
      "短期",
      "临时",
      "兼职",
      "全职",
      "课余",
      "假期",
    ],
    资源共享: [
      // 资源类型
      "资源",
      "分享",
      "资料",
      "下载",
      "链接",
      "文件",
      "文档",
      "课件",
      // 学习资源
      "讲义",
      "笔记",
      "题库",
      "真题",
      "答案",
      "解析",
      "教材",
      "课本",
      // 工具资源
      "软件",
      "工具",
      "插件",
      "模板",
      "素材",
      "代码",
      "脚本",
      // 媒体资源
      "视频",
      "音频",
      "图片",
      "照片",
      "录音",
      "录像",
      "直播",
      // 其他资源
      "电子书",
      "论文",
      "报告",
      "数据",
      "统计",
      "分析",
    ],
    其他: [
      "其他",
      "其他问题",
      "其他话题",
      "闲聊",
      "讨论",
      "交流",
      "分享",
      "建议",
      "意见",
      "反馈",
      "咨询",
      "求助",
      "帮助",
    ],
  };

  // 根据规则匹配标签
  for (const [tag, keywords] of Object.entries(tagRules)) {
    // 检查内容中是否包含关键词
    const hasKeyword = keywords.some((keyword) => content.includes(keyword));
    if (hasKeyword) {
      tags.push(tag);
    }
  }

  // 如果没有匹配到任何标签，添加"其他"标签
  if (tags.length === 0) {
    tags.push("其他");
  }

  return tags;
}

// 切换帖子状态
export const togglePostStatus = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const auth = req.auth as { id: number; role: "admin" | "user" } | undefined;
    const userId = auth?.id;
    const isAdmin = auth?.role === "admin";

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    // 检查帖子是否存在
    const [post] = await pool.query<RowDataPacket[]>(
      "SELECT author_id, status FROM posts WHERE id = ?",
      [postId]
    );

    if (!post.length) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "帖子不存在",
      });
    }

    if (!isAdmin) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "无权修改此帖子",
      });
    }

    const newStatus = post[0].status === "public" ? "private" : "public";
    await pool.query("UPDATE posts SET status = ? WHERE id = ?", [
      newStatus,
      postId,
    ]);

    res.json({
      code: 200,
      success: true,
      data: {
        status: newStatus,
      },
      message: `状态已切换为${newStatus === "public" ? "公开" : "私密"}`,
    });
  } catch (error) {
    console.error("切换帖子状态失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};
