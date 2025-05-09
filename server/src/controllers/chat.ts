import { Request, Response } from "express";
import { pool } from "../utils/pool";
import { RowDataPacket } from "mysql2";

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
      data: messages.reverse(),
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