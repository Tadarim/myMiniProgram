import { Request, Response } from "express";
import { pool } from "../utils/pool";
import { RowDataPacket } from "mysql2";
import qiniu from "qiniu";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import fs from "fs";
import * as fsPromises from "fs/promises";
import { sendMessage as wsSendMessage } from '../services/websocket';

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
    const { type = "single" } = req.query; // 获取会话类型，默认为私聊

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    if (type === "single") {
      // 获取私聊会话列表 - 修改后的查询，同时查询用户作为user_id或target_id的会话
      const [sessions] = await pool.query<RowDataPacket[]>(
        `SELECT 
          cs.id,
          cs.type,
          cs.last_message,
          cs.last_time,
          (
            SELECT COUNT(*) 
            FROM chat_messages 
            WHERE session_id = cs.id 
            AND sender_id != ? 
            AND is_read = FALSE
          ) as unread_count,
          CASE 
            WHEN cs.user_id = ? THEN u.id
            ELSE cs.user_id
          END as target_id,
          CASE 
            WHEN cs.user_id = ? THEN u.username
            ELSE u_alt.username
          END as target_name,
          CASE 
            WHEN cs.user_id = ? THEN u.avatar
            ELSE u_alt.avatar
          END as target_avatar
        FROM chat_sessions cs
        JOIN users u ON cs.target_id = u.id
        JOIN users u_alt ON cs.user_id = u_alt.id
        WHERE (cs.user_id = ? OR cs.target_id = ?) AND cs.type = 'single'
        ORDER BY cs.last_time DESC`,
        [userId, userId, userId, userId, userId, userId]
      );

      res.json({
        code: 200,
        success: true,
        data: sessions,
      });
    } else if (type === "group") {
      // 获取群聊会话列表
      const [sessions] = await pool.query<RowDataPacket[]>(
        `SELECT 
          cs.id,
          cs.type,
          cs.last_message,
          cs.last_time,
          cs.unread_count,
          cg.id as group_id,
          cg.name as target_name,
          cg.avatar as target_avatar,
          cg.description
        FROM chat_sessions cs
        JOIN chat_groups cg ON cs.group_id = cg.id
        JOIN chat_group_members cgm ON cg.id = cgm.group_id AND cgm.user_id = ?
        WHERE cs.type = 'group'
        ORDER BY cs.last_time DESC`,
        [userId]
      );

      res.json({
        code: 200,
        success: true,
        data: sessions,
      });
    } else {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "无效的会话类型",
      });
    }
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
      "SELECT * FROM chat_sessions WHERE id = ? AND ((user_id = ? OR target_id = ?) OR type = 'group')",
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

    // 如果是群聊，验证用户是否为群成员
    if (session.type === "group") {
      const [members] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM chat_group_members WHERE group_id = ? AND user_id = ?",
        [session.group_id, userId]
      );

      if (!members.length) {
        return res.status(403).json({
          code: 403,
          success: false,
          message: "您不是该群组成员",
        });
      }
    }

    // 获取消息历史
    const offset = (Number(page) - 1) * Number(pageSize);

    // 获取消息时先不使用system_messages表，避免表结构问题
    try {
      // 获取普通消息
      const [messages] = await pool.query<RowDataPacket[]>(
        `SELECT 
          m.*,
          u.username as sender_name,
          u.avatar as sender_avatar,
          'chat' as message_type
        FROM chat_messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.session_id = ?
        ORDER BY m.created_at DESC
        LIMIT ? OFFSET ?`,
        [sessionId, Number(pageSize), offset]
      );

      // 获取系统消息
      const [systemMessages] = await pool.query<RowDataPacket[]>(
        `SELECT 
          id,
          session_id,
          content,
          created_at,
          'system' as message_type
        FROM system_messages
        WHERE session_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?`,
        [sessionId, Number(pageSize), offset]
      );

      // 合并消息并按时间排序
      const allMessages = [...messages, ...systemMessages].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      // 为文件和图片类型的消息自动生成新的带token的URL，并统一时间格式
      const messagesWithUpdatedUrls = allMessages.map((msg) => {
        if (
          msg.message_type === "chat" &&
          (msg.type === "file" || msg.type === "image") &&
          domain
        ) {
          try {
            // 从URL中提取文件key
            const urlParts = msg.content.split("/");
            const key = urlParts[urlParts.length - 1];

            // 确保域名格式正确
            const baseUrl = domain.startsWith("http")
              ? domain
              : `http://${domain}`;

            // 生成新的24小时有效期的token URL（更长的有效期）
            const deadline = Math.floor(Date.now() / 1000) + 86400; // 24小时
            const config = new qiniu.conf.Config();
            config.zone = qiniu.zone.Zone_z1;
            config.useCdnDomain = true;
            const bucketManager = new qiniu.rs.BucketManager(mac, config);

            // 添加原始文件名参数
            const encodedFileName = encodeURIComponent(msg.file_name || "file");
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
        // 统一时间格式
        if (msg.created_at) {
          msg.created_at = new Date(msg.created_at).toISOString();
        }
        return msg;
      });

      // 标记消息为已读并更新未读计数
      await updateMessageReadStatus(session, sessionId, userId);

      return res.json({
        code: 200,
        success: true,
        data: messagesWithUpdatedUrls, // 不再reverse，顺序已升序
      });
    } catch (error) {
      console.error(`[getChatMessages] 查询消息失败:`, error);
      return res.status(500).json({
        code: 500,
        success: false,
        message: "获取消息失败",
      });
    }
  } catch (error) {
    console.error("[getChatMessages] 获取聊天消息历史失败:", error);
    return res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 辅助函数：更新消息已读状态和未读计数
async function updateMessageReadStatus(
  session: any,
  sessionId: string,
  userId: number
) {
  try {
    // 标记消息为已读（对于私聊）
    if (session.type === "single") {
      console.log(
        `[updateMessageReadStatus] 更新私聊消息为已读状态，sessionId: ${sessionId}, userId: ${userId}`
      );
      await pool.query(
        "UPDATE chat_messages SET is_read = TRUE WHERE session_id = ? AND receiver_id = ? AND is_read = FALSE",
        [sessionId, userId]
      );

      // 更新会话的未读消息数
      if (session.user_id === Number(userId)) {
        console.log(
          `[updateMessageReadStatus] 用户是会话的user_id，更新其未读计数`
        );
        await pool.query(
          "UPDATE chat_sessions SET unread_count = 0 WHERE id = ? AND user_id = ?",
          [sessionId, userId]
        );
      } else {
        console.log(
          `[updateMessageReadStatus] 用户是会话的target_id，查找对应的会话记录`
        );
        // 查找当前用户作为user_id的会话记录
        const [existingSessions] = await pool.query<RowDataPacket[]>(
          `SELECT * FROM chat_sessions 
          WHERE user_id = ? AND target_id = ? AND type = 'single'`,
          [userId, session.user_id]
        );

        console.log(
          `[updateMessageReadStatus] 找到 ${existingSessions.length} 个会话记录`
        );

        if (existingSessions.length > 0) {
          console.log(
            `[updateMessageReadStatus] 更新会话ID为 ${existingSessions[0].id} 的未读计数`
          );
          await pool.query(
            "UPDATE chat_sessions SET unread_count = 0 WHERE id = ?",
            [existingSessions[0].id]
          );
        } else {
          // 直接更新当前会话的未读计数
          console.log(
            `[updateMessageReadStatus] 未找到对应会话记录，直接更新当前会话未读计数`
          );
          await pool.query(
            "UPDATE chat_sessions SET unread_count = 0 WHERE id = ?",
            [sessionId]
          );
        }
      }
    } else if (session.type === "group") {
      // 群聊消息标记为已读
      console.log(
        `[updateMessageReadStatus] 更新群聊会话未读计数，sessionId: ${sessionId}`
      );
      await pool.query(
        "UPDATE chat_sessions SET unread_count = 0 WHERE id = ?",
        [sessionId]
      );
    }
  } catch (error) {
    console.error(`[updateMessageReadStatus] 更新消息已读状态失败:`, error);
  }
}

// 发送消息
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      sessionId,
      content,
      type = "text",
      fileUrl,
      fileName,
      fileSize,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    // 验证会话是否存在且属于当前用户
    const [sessions] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM chat_sessions WHERE id = ? AND ((user_id = ? OR target_id = ?) OR type = 'group')",
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

    // 如果是群聊，验证用户是否为群成员
    if (session.type === "group") {
      const [members] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM chat_group_members WHERE group_id = ? AND user_id = ?",
        [session.group_id, userId]
      );

      if (!members.length) {
        return res.status(403).json({
          code: 403,
          success: false,
          message: "您不是该群组成员",
        });
      }
    }

    const receiverId =
      session.type === "single"
        ? session.user_id === userId
          ? session.target_id
          : session.user_id
        : 0; // 群聊消息接收者设为0

    // 开始事务
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 插入消息
      const [result] = await connection.query(
        `INSERT INTO chat_messages 
        (session_id, sender_id, receiver_id, content, type, file_url, file_name, file_size)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sessionId,
          userId,
          receiverId,
          content,
          type,
          fileUrl,
          fileName,
          fileSize,
        ]
      );

      if (session.type === "single") {
        // 更新私聊会话的最后消息和时间
        await connection.query(
          `UPDATE chat_sessions 
          SET last_message = ?, last_time = NOW()
          WHERE id = ?`,
          [content, sessionId]
        );

        // 更新接收者的未读消息计数 - 查找接收者作为user_id的会话记录
        const [receiverSessions] = await connection.query<RowDataPacket[]>(
          `SELECT * FROM chat_sessions 
          WHERE user_id = ? AND target_id = ? AND type = 'single'`,
          [
            receiverId,
            receiverId === session.user_id ? userId : session.user_id,
          ]
        );

        if (receiverSessions.length > 0) {
          // 更新接收者会话的未读消息计数
          await connection.query(
            `UPDATE chat_sessions 
            SET unread_count = unread_count + 1
            WHERE id = ?`,
            [receiverSessions[0].id]
          );
        } else if (receiverId !== userId) {
          // 确保接收者不是自己
          // 接收者作为user_id的会话不存在，则更新他作为target_id的会话
          // 此处要特别注意，只有当接收者和发送者不是同一人时才增加未读计数
          await connection.query(
            `UPDATE chat_sessions 
            SET unread_count = unread_count + 1
            WHERE id = ? AND target_id = ?`,
            [sessionId, receiverId]
          );
        }

        // 新增：WebSocket推送
        if (receiverId !== userId) {
          wsSendMessage(receiverId, {
            type: 'chat',
            data: {
              sessionId,
              senderId: userId,
              content,
              type,
              fileUrl,
              fileName,
              fileSize,
              created_at: new Date(),
            }
          });
        }
      } else if (session.type === "group") {
        // 更新群聊会话的最后消息和时间
        await connection.query(
          `UPDATE chat_sessions 
          SET last_message = ?, last_time = NOW()
          WHERE id = ?`,
          [content, sessionId]
        );

        // 更新所有群成员的未读消息计数（除了发送者）
        await connection.query(
          `UPDATE chat_sessions cs
           JOIN chat_group_members cgm ON cs.group_id = cgm.group_id
           SET cs.unread_count = cs.unread_count + 1
           WHERE cs.group_id = ? AND cgm.user_id != ?`,
          [session.group_id, userId]
        );

        // 新增：WebSocket推送给所有群成员（排除自己）
        const [groupMembers] = await connection.query(
          'SELECT user_id FROM chat_group_members WHERE group_id = ?',
          [session.group_id]
        );
        for (const member of groupMembers as any[]) {
          if (member.user_id !== userId) {
            wsSendMessage(member.user_id, {
              type: 'chat',
              data: {
                sessionId,
                senderId: userId,
                content,
                type,
                fileUrl,
                fileName,
                fileSize,
                created_at: new Date(),
              }
            });
          }
        }
      }

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

    // 确保userId和targetId不相同
    if (Number(userId) === Number(targetId)) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "不能和自己聊天",
      });
    }

    // 标准化用户ID，确保较小的ID总是在较大的ID之前
    const smallerId = Math.min(Number(userId), Number(targetId));
    const largerId = Math.max(Number(userId), Number(targetId));

    // 查找是否已存在会话 - 使用标准化的ID查询
    const [existingSessions] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM chat_sessions 
      WHERE user_id = ? AND target_id = ? AND type = 'single'`,
      [smallerId, largerId]
    );

    // 如果找到多个会话，只保留第一个，删除其他的
    if (existingSessions.length > 1) {
      console.log(
        `发现用户 ${userId} 和 ${targetId} 之间有 ${existingSessions.length} 个重复会话，将保留ID最小的一个`
      );

      const sessionToKeep = existingSessions[0];

      // 删除其他重复会话
      for (let i = 1; i < existingSessions.length; i++) {
        const sessionToDelete = existingSessions[i];

        // 获取要删除的会话中的消息
        const [messages] = await pool.query<RowDataPacket[]>(
          "SELECT * FROM chat_messages WHERE session_id = ?",
          [sessionToDelete.id]
        );

        // 将消息转移到要保留的会话
        for (const message of messages) {
          await pool.query(
            `UPDATE chat_messages SET session_id = ? WHERE id = ?`,
            [sessionToKeep.id, message.id]
          );
        }

        // 删除重复的会话
        await pool.query("DELETE FROM chat_sessions WHERE id = ?", [
          sessionToDelete.id,
        ]);
      }

      // 更新保留的会话的最后消息和时间
      const [lastMessage] = await pool.query<RowDataPacket[]>(
        `SELECT content, created_at FROM chat_messages 
         WHERE session_id = ? 
         ORDER BY created_at DESC LIMIT 1`,
        [sessionToKeep.id]
      );

      if (lastMessage.length > 0) {
        await pool.query(
          `UPDATE chat_sessions SET last_message = ?, last_time = ? WHERE id = ?`,
          [lastMessage[0].content, lastMessage[0].created_at, sessionToKeep.id]
        );
      }

      return res.json({
        code: 200,
        success: true,
        message: "已合并重复会话",
        data: sessionToKeep,
      });
    }

    if (existingSessions.length === 1) {
      return res.json({
        code: 200,
        success: true,
        data: existingSessions[0],
      });
    }

    // 创建新会话 - 较小ID作为user_id，较大ID作为target_id
    const [result] = await pool.query(
      `INSERT INTO chat_sessions (user_id, target_id, type)
      VALUES (?, ?, 'single')`,
      [smallerId, largerId]
    );

    res.json({
      code: 200,
      success: true,
      data: {
        id: (result as any).insertId,
        user_id: smallerId,
        target_id: largerId,
        type: "single",
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
      type,
    });

    // 验证会话是否存在
    const [sessions] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM chat_sessions WHERE id = ?",
      [sessionId]
    );
    if (!sessions.length) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "会话不存在",
      });
    }
    const session = sessions[0];

    if (session.type === "group") {
      // 群聊，检查是否为群成员
      const [members] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM chat_group_members WHERE group_id = ? AND user_id = ?",
        [session.group_id, userId]
      );
      if (!members.length) {
        return res.status(403).json({
          code: 403,
          success: false,
          message: "您不是该群组成员",
        });
      }
    } else {
      // 单聊，检查是否为会话双方
      if (session.user_id !== userId && session.target_id !== userId) {
        return res.status(403).json({
          code: 403,
          success: false,
          message: "无权上传",
        });
      }
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

    const receiverId =
      session.user_id === userId ? session.target_id : session.user_id;

    // 上传到七牛云
    console.log("开始上传到七牛云...");
    const qiniuResult = await uploadToQiniu(file.tempFilePath, fileName);
    console.log("七牛云上传结果:", qiniuResult);

    // 文件信息
    const fileUrl = qiniuResult.url;
    const fileSize = file.size;
    const mediaType = type === "chat_image" ? "image" : "file";

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
        [
          sessionId,
          userId,
          receiverId,
          fileUrl,
          mediaType,
          fileUrl,
          fileName,
          fileSize,
        ]
      );

      const messagePreview =
        mediaType === "image" ? "[图片]" : `[文件] ${fileName}`;

      // 更新会话的最后消息和时间
      await connection.query(
        `UPDATE chat_sessions 
        SET last_message = ?, last_time = NOW()
        WHERE id = ?`,
        [messagePreview, sessionId]
      );

      // 更新接收者的未读消息计数
      if (session.type === "single") {
        // 确保接收者不是自己（避免计入自己发送的消息）
        if (receiverId !== userId) {
          // 查找接收者作为user_id的会话记录
          const [receiverSessions] = await connection.query<RowDataPacket[]>(
            `SELECT * FROM chat_sessions 
            WHERE user_id = ? AND target_id = ? AND type = 'single'`,
            [
              receiverId,
              receiverId === session.user_id ? userId : session.user_id,
            ]
          );

          if (receiverSessions.length > 0) {
            // 更新接收者会话的未读消息计数
            await connection.query(
              `UPDATE chat_sessions 
              SET unread_count = unread_count + 1
              WHERE id = ?`,
              [receiverSessions[0].id]
            );
          } else {
            // 接收者作为user_id的会话不存在，则更新他作为target_id的会话
            await connection.query(
              `UPDATE chat_sessions 
              SET unread_count = unread_count + 1
              WHERE id = ? AND target_id = ?`,
              [sessionId, receiverId]
            );
          }
        }
      } else if (session.type === "group") {
        // 对于群聊，更新所有除发送者外的成员未读计数
        await connection.query(
          `UPDATE chat_sessions cs
           JOIN chat_group_members cgm ON cs.group_id = cgm.group_id
           SET cs.unread_count = cs.unread_count + 1
           WHERE cs.group_id = ? AND cgm.user_id != ?`,
          [session.group_id, userId]
        );
      }

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
    if (message.type !== "file" && message.type !== "image") {
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
    const urlParts = message.content.split("/");
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
    const encodedFileName = encodeURIComponent(message.file_name || "file");
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

// 创建群组
export const createGroup = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, description, avatar, members, target_id } = req.body;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    if (!name) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "群组名称不能为空",
      });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 创建群组
      const [groupResult] = await connection.query(
        `INSERT INTO chat_groups (name, description, avatar, creator_id)
        VALUES (?, ?, ?, ?)`,
        [name, description || "", avatar || "", userId]
      );

      const groupId = (groupResult as any).insertId;

      // 添加创建者为管理员
      await connection.query(
        `INSERT INTO chat_group_members (group_id, user_id, role)
        VALUES (?, ?, 'admin')`,
        [groupId, userId]
      );

      // 使用有效的target_id创建群聊会话（使用前端传入的target_id或者默认使用创建者自己）
      const validTargetId = target_id || userId;

      // 创建群聊会话
      const [sessionResult] = await connection.query(
        `INSERT INTO chat_sessions (user_id, target_id, type, group_id)
        VALUES (?, ?, 'group', ?)`,
        [userId, validTargetId, groupId]
      );

      const sessionId = (sessionResult as any).insertId;

      // 添加其他成员
      if (members && Array.isArray(members) && members.length > 0) {
        for (const memberId of members) {
          if (memberId !== userId) {
            await connection.query(
              `INSERT INTO chat_group_members (group_id, user_id)
              VALUES (?, ?)`,
              [groupId, memberId]
            );
          }
        }
      }

      // 添加系统消息（只插入 system_messages，不插入 chat_messages）
      await connection.query(
        `INSERT INTO system_messages (session_id, content)
        VALUES (?, ?)`,
        [sessionId, `${name}群聊已创建`]
      );

      // 更新会话的最后消息和时间
      await connection.query(
        `UPDATE chat_sessions 
        SET last_message = ?, last_time = NOW()
        WHERE id = ?`,
        [`${name}群聊已创建`, sessionId]
      );

      await connection.commit();

      res.json({
        code: 200,
        success: true,
        message: "群组创建成功",
        data: {
          id: groupId,
          sessionId: sessionId,
          name,
          description,
          avatar,
          creator_id: userId,
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
    console.error("创建群组失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 获取群组信息
export const getGroupInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { groupId } = req.params;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    // 获取群组基本信息
    const [groups] = await pool.query<RowDataPacket[]>(
      `SELECT 
        cg.*,
        (SELECT COUNT(*) FROM chat_group_members WHERE group_id = cg.id) as member_count
      FROM chat_groups cg
      WHERE cg.id = ?`,
      [groupId]
    );

    if (!groups.length) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "群组不存在",
      });
    }

    // 检查用户是否为群成员
    const [members] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM chat_group_members WHERE group_id = ? AND user_id = ?",
      [groupId, userId]
    );

    const isGroupMember = members.length > 0;
    const group = groups[0];

    // 获取群组成员信息
    const [groupMembers] = await pool.query<RowDataPacket[]>(
      `SELECT 
        cgm.user_id, 
        cgm.role, 
        cgm.joined_at,
        u.username,
        u.avatar
      FROM chat_group_members cgm
      JOIN users u ON cgm.user_id = u.id
      WHERE cgm.group_id = ?
      ORDER BY cgm.role ASC, cgm.joined_at ASC`,
      [groupId]
    );

    res.json({
      code: 200,
      success: true,
      data: {
        ...group,
        is_member: isGroupMember,
        members: groupMembers,
      },
    });
  } catch (error) {
    console.error("获取群组信息失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 加入群组
export const joinGroup = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { groupId } = req.params;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    // 检查群组是否存在
    const [groups] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM chat_groups WHERE id = ?",
      [groupId]
    );

    if (!groups.length) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "群组不存在",
      });
    }

    // 检查用户是否已经是群成员
    const [members] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM chat_group_members WHERE group_id = ? AND user_id = ?",
      [groupId, userId]
    );

    if (members.length > 0) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "您已经是该群组成员",
      });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 添加用户为群成员
      await connection.query(
        `INSERT INTO chat_group_members (group_id, user_id)
        VALUES (?, ?)`,
        [groupId, userId]
      );

      // 获取群组创建者信息作为有效的target_id
      const [creatorResult] = await connection.query<RowDataPacket[]>(
        `SELECT creator_id, avatar FROM chat_groups WHERE id = ?`,
        [groupId]
      );

      const creatorId = creatorResult[0].creator_id;
      const groupAvatar = creatorResult[0].avatar;

      // 创建或获取群聊会话
      const [sessions] = await connection.query<RowDataPacket[]>(
        `SELECT * FROM chat_sessions 
        WHERE group_id = ? AND type = 'group'`,
        [groupId]
      );

      let sessionId;

      if (sessions.length > 0) {
        sessionId = sessions[0].id;
      } else {
        const [sessionResult] = await connection.query(
          `INSERT INTO chat_sessions (user_id, target_id, type, group_id)
          VALUES (?, ?, 'group', ?)`,
          [userId, creatorId, groupId]
        );
        sessionId = (sessionResult as any).insertId;
      }

      const groupName = groups[0].name;
      const userName = (
        await connection.query<RowDataPacket[]>(
          "SELECT username FROM users WHERE id = ?",
          [userId]
        )
      )[0][0].username;

      // 添加系统消息
      await connection.query(
        `INSERT INTO system_messages (session_id, content)
        VALUES (?, ?)`,
        [sessionId, `${userName}加入了群聊`]
      );

      // 更新会话的最后消息和时间
      await connection.query(
        `UPDATE chat_sessions 
        SET last_message = ?, last_time = NOW()
        WHERE id = ?`,
        [`${userName}加入了群聊`, sessionId]
      );

      await connection.commit();

      res.json({
        code: 200,
        success: true,
        message: "加入群组成功",
        data: {
          sessionId,
          groupId: Number(groupId),
          groupName,
        },
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("加入群组失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 退出群组
export const leaveGroup = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { groupId } = req.params;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    // 检查群组是否存在
    const [groups] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM chat_groups WHERE id = ?",
      [groupId]
    );

    if (!groups.length) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "群组不存在",
      });
    }

    // 检查用户是否是群成员
    const [members] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM chat_group_members WHERE group_id = ? AND user_id = ?",
      [groupId, userId]
    );

    if (!members.length) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "您不是该群组成员",
      });
    }

    // 检查是否为群主（群主不能退出，需要转让群主权限）
    if (groups[0].creator_id === userId) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "群主不能直接退出群组，请先转让群主权限",
      });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 从群组成员中删除用户
      await connection.query(
        "DELETE FROM chat_group_members WHERE group_id = ? AND user_id = ?",
        [groupId, userId]
      );

      // 获取群聊会话ID
      const [sessions] = await connection.query<RowDataPacket[]>(
        `SELECT * FROM chat_sessions 
        WHERE group_id = ? AND type = 'group'`,
        [groupId]
      );

      if (sessions.length > 0) {
        const sessionId = sessions[0].id;
        const userName = (
          await connection.query<RowDataPacket[]>(
            "SELECT username FROM users WHERE id = ?",
            [userId]
          )
        )[0][0].username;

        // 添加系统消息
        await connection.query(
          `INSERT INTO system_messages (session_id, content)
          VALUES (?, ?)`,
          [sessionId, `${userName}退出了群聊`]
        );

        // 更新会话的最后消息和时间
        await connection.query(
          `UPDATE chat_sessions 
          SET last_message = ?, last_time = NOW()
          WHERE id = ?`,
          [`${userName}退出了群聊`, sessionId]
        );
      }

      await connection.commit();

      res.json({
        code: 200,
        success: true,
        message: "退出群组成功",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("退出群组失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 解散群组（仅群主可操作）
export const dissolveGroup = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { groupId } = req.params;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    // 检查群组是否存在
    const [groups] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM chat_groups WHERE id = ?",
      [groupId]
    );

    if (!groups.length) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "群组不存在",
      });
    }

    const group = groups[0];

    // 检查用户是否是群主
    if (group.creator_id !== userId) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "只有群主可以解散群组",
      });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 获取群聊会话ID
      const [sessions] = await connection.query<RowDataPacket[]>(
        `SELECT * FROM chat_sessions 
        WHERE group_id = ? AND type = 'group'`,
        [groupId]
      );

      // 删除群组相关数据
      // 1. 删除群组成员
      await connection.query(
        "DELETE FROM chat_group_members WHERE group_id = ?",
        [groupId]
      );

      // 2. 如果有会话，删除会话消息
      if (sessions.length > 0) {
        for (const session of sessions) {
          const sessionId = session.id;

          // 删除系统消息记录
          await connection.query(
            `DELETE FROM system_messages WHERE session_id = ?`,
            [sessionId]
          );

          // 删除消息
          await connection.query(
            "DELETE FROM chat_messages WHERE session_id = ?",
            [sessionId]
          );

          // 删除会话
          await connection.query("DELETE FROM chat_sessions WHERE id = ?", [
            sessionId,
          ]);
        }
      }

      // 3. 最后删除群组本身
      await connection.query("DELETE FROM chat_groups WHERE id = ?", [groupId]);

      await connection.commit();

      res.json({
        code: 200,
        success: true,
        message: "群组已解散",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("解散群组失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 获取我的群组列表
export const getMyGroups = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    // 获取用户加入的所有群组
    const [groups] = await pool.query<RowDataPacket[]>(
      `SELECT 
        cg.*,
        (SELECT COUNT(*) FROM chat_group_members WHERE group_id = cg.id) as member_count,
        cgm.role as my_role,
        cgm.joined_at,
        (SELECT id FROM chat_sessions WHERE group_id = cg.id AND type = 'group' LIMIT 1) as session_id
      FROM chat_groups cg
      JOIN chat_group_members cgm ON cg.id = cgm.group_id
      WHERE cgm.user_id = ?
      ORDER BY cgm.joined_at DESC`,
      [userId]
    );

    res.json({
      code: 200,
      success: true,
      data: groups,
    });
  } catch (error) {
    console.error("获取我的群组列表失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 搜索群组
export const searchGroups = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { keyword, recommended } = req.query;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    // 如果是获取推荐群组，返回成员最多的前3个群组
    if (recommended) {
      const [groups] = await pool.query<RowDataPacket[]>(
        `SELECT 
          cg.*,
          (SELECT COUNT(*) FROM chat_group_members WHERE group_id = cg.id) as member_count,
          EXISTS(SELECT 1 FROM chat_group_members WHERE group_id = cg.id AND user_id = ?) as is_member,
          (SELECT id FROM chat_sessions WHERE group_id = cg.id AND type = 'group' LIMIT 1) as session_id
        FROM chat_groups cg
        ORDER BY member_count DESC
        LIMIT 3`,
        [userId]
      );

      return res.json({
        code: 200,
        success: true,
        data: groups,
      });
    }

    // 如果没有关键词，返回全部群组（限制数量）
    if (!keyword) {
      const [groups] = await pool.query<RowDataPacket[]>(
        `SELECT 
          cg.*,
          (SELECT COUNT(*) FROM chat_group_members WHERE group_id = cg.id) as member_count,
          EXISTS(SELECT 1 FROM chat_group_members WHERE group_id = cg.id AND user_id = ?) as is_member,
          (SELECT id FROM chat_sessions WHERE group_id = cg.id AND type = 'group' LIMIT 1) as session_id
        FROM chat_groups cg
        ORDER BY cg.created_at DESC
        LIMIT 20`,
        [userId]
      );

      return res.json({
        code: 200,
        success: true,
        data: groups,
      });
    }

    // 搜索群组，支持模糊匹配名称和描述
    const [groups] = await pool.query<RowDataPacket[]>(
      `SELECT 
        cg.*,
        (SELECT COUNT(*) FROM chat_group_members WHERE group_id = cg.id) as member_count,
        EXISTS(SELECT 1 FROM chat_group_members WHERE group_id = cg.id AND user_id = ?) as is_member,
        (SELECT id FROM chat_sessions WHERE group_id = cg.id AND type = 'group' LIMIT 1) as session_id
      FROM chat_groups cg
      WHERE cg.name LIKE ? OR cg.description LIKE ?
      ORDER BY 
        CASE 
          WHEN cg.name LIKE ? THEN 0  
          WHEN cg.name LIKE ? THEN 1    
          ELSE 2                     
        END,
        member_count DESC              
      LIMIT 20`,
      [userId, `%${keyword}%`, `%${keyword}%`, keyword, `${keyword}%`]
    );

    res.json({
      code: 200,
      success: true,
      data: groups,
    });
  } catch (error) {
    console.error("搜索群组失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};
