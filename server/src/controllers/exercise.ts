import { Request, Response } from "express";
import pool from "../config/database";

// 获取习题集列表
export const getExerciseSets = async (req: Request, res: Response) => {
  try {
    const { title } = req.query;

    let query = `
      SELECT es.*, 
      (SELECT COUNT(*) FROM questions WHERE exercise_set_id = es.id) as question_count
      FROM exercise_sets es
      WHERE 1=1
    `;
    const params: any[] = [];

    if (title) {
      query += " AND es.title LIKE ?";
      params.push(`%${title}%`);
    }

    query += " ORDER BY es.created_at DESC";

    const [rows] = await pool.query(query, params);

    res.json({
      code: 0,
      success: true,
      data: rows,
      message: "获取成功",
    });
  } catch (error) {
    console.error("获取习题集列表失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 创建习题集
export const createExerciseSet = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "标题不能为空",
      });
    }

    const [result] = await pool.query(
      "INSERT INTO exercise_sets (title, description) VALUES (?, ?)",
      [title, description]
    );

    const [newExerciseSet] = await pool.query(
      `SELECT es.*, 
       (SELECT COUNT(*) FROM questions WHERE exercise_set_id = es.id) as question_count
       FROM exercise_sets es
       WHERE es.id = ?`,
      [(result as any).insertId]
    );

    res.json({
      code: 0,
      success: true,
      data: (newExerciseSet as any[])[0],
      message: "创建成功",
    });
  } catch (error) {
    console.error("创建习题集失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 更新习题集
export const updateExerciseSet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "标题不能为空",
      });
    }

    await pool.query(
      "UPDATE exercise_sets SET title = ?, description = ? WHERE id = ?",
      [title, description, id]
    );

    const [updatedExerciseSet] = await pool.query(
      `SELECT es.*, 
       (SELECT COUNT(*) FROM questions WHERE exercise_set_id = es.id) as question_count
       FROM exercise_sets es
       WHERE es.id = ?`,
      [id]
    );

    res.json({
      code: 0,
      success: true,
      data: (updatedExerciseSet as any[])[0],
      message: "更新成功",
    });
  } catch (error) {
    console.error("更新习题集失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 删除习题集
export const deleteExerciseSet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM exercise_sets WHERE id = ?", [id]);

    res.json({
      code: 0,
      success: true,
      message: "删除成功",
    });
  } catch (error) {
    console.error("删除习题集失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 获取习题集详情（包含题目）
export const getExerciseSetDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [exerciseSet] = await pool.query(
      `SELECT es.*, 
       (SELECT COUNT(*) FROM questions WHERE exercise_set_id = es.id) as question_count
       FROM exercise_sets es
       WHERE es.id = ?`,
      [id]
    );

    if (!(exerciseSet as any[]).length) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "习题集不存在",
      });
    }

    const [questions] = await pool.query(
      "SELECT * FROM questions WHERE exercise_set_id = ? ORDER BY id ASC",
      [id]
    );

    res.json({
      code: 0,
      success: true,
      data: {
        ...(exerciseSet as any[])[0],
        questions,
      },
      message: "获取成功",
    });
  } catch (error) {
    console.error("获取习题集详情失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 添加题目
export const addQuestion = async (req: Request, res: Response) => {
  try {
    const { exerciseSetId } = req.params;
    const { content, type, options, answer } = req.body;

    if (!content || !type || !options || !answer) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "题目内容、类型、选项和答案不能为空",
      });
    }

    const [result] = await pool.query(
      "INSERT INTO questions (exercise_set_id, content, type, options, answer) VALUES (?, ?, ?, ?, ?)",
      [
        exerciseSetId,
        content,
        type,
        JSON.stringify(options),
        JSON.stringify(answer),
      ]
    );

    const [newQuestion] = await pool.query(
      "SELECT * FROM questions WHERE id = ?",
      [(result as any).insertId]
    );

    // 更新习题集的题目数量
    await pool.query(
      "UPDATE exercise_sets SET question_count = (SELECT COUNT(*) FROM questions WHERE exercise_set_id = ?) WHERE id = ?",
      [exerciseSetId, exerciseSetId]
    );

    res.json({
      code: 0,
      success: true,
      data: (newQuestion as any[])[0],
      message: "添加成功",
    });
  } catch (error) {
    console.error("添加题目失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 删除题目
export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { exerciseSetId, questionId } = req.params;

    await pool.query(
      "DELETE FROM questions WHERE id = ? AND exercise_set_id = ?",
      [questionId, exerciseSetId]
    );

    // 更新习题集的题目数量
    await pool.query(
      "UPDATE exercise_sets SET question_count = (SELECT COUNT(*) FROM questions WHERE exercise_set_id = ?) WHERE id = ?",
      [exerciseSetId, exerciseSetId]
    );

    res.json({
      code: 0,
      success: true,
      message: "删除成功",
    });
  } catch (error) {
    console.error("删除题目失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};
