import { Request, Response } from "express";
import pool from "../config/database";

// 获取日程列表
export const getSchedules = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "未授权" });
    }

    // 获取当前时间
    const now = new Date();
    const currentTime = now.toISOString().slice(0, 19).replace("T", " ");

    // 只查询未过期的日程（结束时间大于当前时间）
    const [rows] = await pool.query(
      `SELECT * FROM schedules 
        WHERE user_id = ? 
        AND STR_TO_DATE(SUBSTRING_INDEX(time, ' - ', -1), '%Y/%m/%d %H:%i:%s') > ?
        ORDER BY STR_TO_DATE(SUBSTRING_INDEX(time, ' - ', 1), '%Y/%m/%d %H:%i:%s') ASC`,
      [userId, currentTime]
    );

    res.json({
      code: 0,
      success: true,
      data: rows,
      message: "获取成功",
    });
  } catch (error) {
    console.error("获取日程列表失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 创建日程
export const createSchedule = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "未授权" });
    }

    const { title, time, description } = req.body;

    if (!title || !time) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "标题和时间不能为空",
      });
    }

    const [result] = await pool.query(
      "INSERT INTO schedules (user_id, title, time, description) VALUES (?, ?, ?, ?)",
      [userId, title, time, description]
    );

    const [newSchedule] = await pool.query(
      "SELECT * FROM schedules WHERE id = ?",
      [(result as any).insertId]
    );

    res.json({
      code: 0,
      success: true,
      data: (newSchedule as any[])[0],
      message: "创建成功",
    });
  } catch (error) {
    console.error("创建日程失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 删除日程
export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "未授权" });
    }

    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM schedules WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (!(rows as any[]).length) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "日程不存在",
      });
    }

    await pool.query("DELETE FROM schedules WHERE id = ? AND user_id = ?", [
      id,
      userId,
    ]);

    res.json({
      code: 0,
      success: true,
      message: "删除成功",
    });
  } catch (error) {
    console.error("删除日程失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};
