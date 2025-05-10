import { Request, Response } from "express";
import { pool } from "../utils/pool";
import { RowDataPacket } from "mysql2";
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
  const key = `chat-${uuidv4()}${path.extname(fileName)}`;
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

        // 生成私有下载链接
        const deadline = Math.floor(Date.now() / 1000) + 86400; // 24小时有效期
        const bucketManager = new qiniu.rs.BucketManager(mac, config);

        // 确保域名格式正确
        const baseUrl = domain.startsWith("http") ? domain : `http://${domain}`;

        // 生成私有下载链接
        const encodedFileName = encodeURIComponent(fileName);
        const privateDownloadUrl =
          bucketManager.privateDownloadUrl(baseUrl, key, deadline) +
          `&attname=${encodedFileName}`;

        resolve({
          url: privateDownloadUrl,
          fileName: fileName,
          fileType: getFileType(fileName),
        });
      }
    );
  });
}

// 获取聊天会话列表
export const getChatSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    const [sessions] = await pool.query<RowDataPacket[]>(
      `SELECT 
        cs.id,
        cs.type,
        cs.last_message,
        cs.last_time,
        cs.unread_count,
        u.id as target_id,
        u.username as target_name,
        u.avatar as target_avatar
      FROM chat_sessions cs
      JOIN users u ON cs.target_id = u.id
      WHERE cs.user_id = ?
      ORDER BY cs.last_time DESC`,
      [userId]
    );

    res.json({
      code: 200,
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error("获取聊天会话列表失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 获取聊天消息历史
export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { sessionId } = req.params;
    const { page = 1, pageSize = 20 } = req.query;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    // 验证会话是否存在且属于当前用户
    const [sessions] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM chat_sessions WHERE id = ? AND (user_id = ? OR target_id = ?)",
      [sessionId, userId, userId]
    );

    if (!sessions.length) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "会话不存在",
      });
    }

    // 获取消息历史
    const offset = (Number(page) - 1) * Number(pageSize);
    const [messages] = await pool.query<RowDataPacket[]>(
      `SELECT 
        m.*,
        u.username as sender_name,
        u.avatar as sender_avatar
      FROM chat_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.session_id = ?
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?`,
      [sessionId, Number(pageSize), offset]
    );

    // 为文件和图片类型的消息自动生成新的带token的URL
    const messagesWithUpdatedUrls = messages.map(msg => {
      if ((msg.type === 'file' || msg.type === 'image') && domain) {
        try {
          // 从URL中提取文件key
          const urlParts = msg.content.split('/');
          const key = urlParts[urlParts.length - 1];
          
          // 确保域名格式正确
          const baseUrl = domain.startsWith("http") ? domain : `http://${domain}`;
          
          // 生成新的24小时有效期的token URL（更长的有效期）
          const deadline = Math.floor(Date.now() / 1000) + 86400; // 24小时
          const config = new qiniu.conf.Config();
          config.zone = qiniu.zone.Zone_z1;
          config.useCdnDomain = true;
          const bucketManager = new qiniu.rs.BucketManager(mac, config);
          
          // 添加原始文件名参数
          const encodedFileName = encodeURIComponent(msg.file_name || 'file');
          const privateDownloadUrl = 
            bucketManager.privateDownloadUrl(baseUrl, key, deadline) +
            `&attname=${encodedFileName}`;
          
          // 自动更新消息内容中的URL
          msg.content = privateDownloadUrl;
          if (msg.file_url) {
            msg.file_url = privateDownloadUrl;
          }
        } catch (err) {
          console.error("为文件生成URL失败:", err);
        }
      }
      return msg;
    });

    // 标记消息为已读
    await pool.query(
      "UPDATE chat_messages SET is_read = TRUE WHERE session_id = ? AND receiver_id = ? AND is_read = FALSE",
      [sessionId, userId]
    );

    // 更新会话的未读消息数
    await pool.query(
      "UPDATE chat_sessions SET unread_count = 0 WHERE id = ? AND user_id = ?",
      [sessionId, userId]
    );

    res.json({
      code: 200,
      success: true,
      data: messagesWithUpdatedUrls.reverse(),
    });
  } catch (error) {
    console.error("获取聊天消息历史失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 发送消息
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { sessionId, content, type = "text", fileUrl, fileName, fileSize } = req.body;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    // 验证会话是否存在且属于当前用户
    const [sessions] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM chat_sessions WHERE id = ? AND (user_id = ? OR target_id = ?)",
      [sessionId, userId, userId]
    );

    if (!sessions.length) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "会话不存在",
      });
    }

    const session = sessions[0];
    const receiverId = session.user_id === userId ? session.target_id : session.user_id;

    // 开始事务
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 插入消息
      const [result] = await connection.query(
        `INSERT INTO chat_messages 
        (session_id, sender_id, receiver_id, content, type, file_url, file_name, file_size)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [sessionId, userId, receiverId, content, type, fileUrl, fileName, fileSize]
      );

      // 更新会话的最后消息和时间
      await connection.query(
        `UPDATE chat_sessions 
        SET last_message = ?, last_time = NOW(), unread_count = unread_count + 1
        WHERE id = ?`,
        [content, sessionId]
      );

      await connection.commit();

      res.json({
        code: 200,
        success: true,
        message: "发送成功",
        data: {
          id: (result as any).insertId,
          created_at: new Date(),
        },
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("发送消息失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 创建或获取会话
export const getOrCreateSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { targetId } = req.params;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    // 查找是否已存在会话
    const [existingSessions] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM chat_sessions 
      WHERE (user_id = ? AND target_id = ?) 
      OR (user_id = ? AND target_id = ?)`,
      [userId, targetId, targetId, userId]
    );

    if (existingSessions.length > 0) {
      return res.json({
        code: 200,
        success: true,
        data: existingSessions[0],
      });
    }

    // 创建新会话
    const [result] = await pool.query(
      `INSERT INTO chat_sessions (user_id, target_id)
      VALUES (?, ?)`,
      [userId, targetId]
    );

    res.json({
      code: 200,
      success: true,
      data: {
        id: (result as any).insertId,
        user_id: userId,
        target_id: targetId,
        last_message: null,
        last_time: new Date(),
        unread_count: 0,
      },
    });
  } catch (error) {
    console.error("创建会话失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 上传聊天图片或文件
export const uploadChatMedia = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { sessionId, type } = req.body;

    console.log("请求体:", req.body);
    console.log("请求文件:", req.files);
    console.log("请求头:", req.headers);

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    if (!req.files || !req.files.file) {
      console.error("未找到上传的文件，请求体:", req.body);
      return res.status(400).json({
        code: 400,
        success: false,
        message: "未上传文件",
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "会话ID不能为空",
      });
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
      sessionId,
      type
    });

    // 验证会话是否存在且属于当前用户
    const [sessions] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM chat_sessions WHERE id = ? AND (user_id = ? OR target_id = ?)",
      [sessionId, userId, userId]
    );

    if (!sessions.length) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "会话不存在",
      });
    }

    // 检查文件是否存在
    if (!fs.existsSync(file.tempFilePath)) {
      console.error("临时文件不存在:", file.tempFilePath);
      return res.status(400).json({
        code: 400,
        success: false,
        message: "临时文件不存在",
      });
    }

    // 检查文件大小
    const stats = fs.statSync(file.tempFilePath);
    console.log("文件实际大小:", stats.size, "bytes");
    if (stats.size === 0) {
      console.error("文件大小为0:", file.tempFilePath);
      return res.status(400).json({
        code: 400,
        success: false,
        message: "文件大小为0",
      });
    }

    const session = sessions[0];
    const receiverId = session.user_id === userId ? session.target_id : session.user_id;

    // 上传到七牛云
    console.log("开始上传到七牛云...");
    const qiniuResult = await uploadToQiniu(file.tempFilePath, fileName);
    console.log("七牛云上传结果:", qiniuResult);
    
    // 文件信息
    const fileUrl = qiniuResult.url;
    const fileSize = file.size;
    const mediaType = type === 'chat_image' ? 'image' : 'file';

    // 删除临时文件
    try {
      await fsPromises.unlink(file.tempFilePath);
      console.log("临时文件已删除:", file.tempFilePath);
    } catch (unlinkError) {
      console.error("删除临时文件失败:", unlinkError);
    }
    
    // 开始事务
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 插入消息，存储完整URL
      const [result] = await connection.query(
        `INSERT INTO chat_messages 
        (session_id, sender_id, receiver_id, content, type, file_url, file_name, file_size)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [sessionId, userId, receiverId, fileUrl, mediaType, fileUrl, fileName, fileSize]
      );

      const messagePreview = mediaType === 'image' ? '[图片]' : `[文件] ${fileName}`;

      // 更新会话的最后消息和时间
      await connection.query(
        `UPDATE chat_sessions 
        SET last_message = ?, last_time = NOW(), unread_count = unread_count + 1
        WHERE id = ?`,
        [messagePreview, sessionId]
      );

      await connection.commit();

      res.json({
        code: 200,
        success: true,
        message: "上传成功",
        data: {
          id: (result as any).insertId,
          url: fileUrl, // 返回完整URL给客户端
          fileName,
          fileSize,
          created_at: new Date(),
        },
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("上传聊天媒体失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 刷新文件URL
export const refreshFileUrl = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { messageId } = req.params;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    // 查询消息
    const [messages] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM chat_messages WHERE id = ?`,
      [messageId]
    );

    if (!messages.length) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "消息不存在",
      });
    }

    const message = messages[0];

    // 仅允许文件和图片类型的消息刷新URL
    if (message.type !== 'file' && message.type !== 'image') {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "该消息类型不支持刷新URL",
      });
    }

    // 仅允许消息的发送者或接收者刷新URL
    if (message.sender_id !== userId && message.receiver_id !== userId) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "无权刷新此消息URL",
      });
    }

    // 从content中提取文件key
    const urlParts = message.content.split('/');
    const key = urlParts[urlParts.length - 1];

    // 确保域名格式正确
    if (!domain) {
      return res.status(500).json({
        code: 500,
        success: false,
        message: "七牛云域名未配置",
      });
    }

    const baseUrl = domain.startsWith("http") ? domain : `http://${domain}`;

    // 生成新的24小时有效期的token URL
    const deadline = Math.floor(Date.now() / 1000) + 86400; // 24小时有效期
    const config = new qiniu.conf.Config();
    config.zone = qiniu.zone.Zone_z1;
    config.useCdnDomain = true;
    const bucketManager = new qiniu.rs.BucketManager(mac, config);

    // 添加原始文件名参数
    const encodedFileName = encodeURIComponent(message.file_name || 'file');
    const privateDownloadUrl =
      bucketManager.privateDownloadUrl(baseUrl, key, deadline) +
      `&attname=${encodedFileName}`;

    res.json({
      code: 200,
      success: true,
      data: {
        url: privateDownloadUrl,
        fileName: message.file_name,
        fileSize: message.file_size,
      },
    });
  } catch (error) {
    console.error("刷新文件URL失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};