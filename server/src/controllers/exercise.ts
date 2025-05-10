import { Request, RequestHandler, Response } from "express";
import pool from "../config/database";
import { RowDataPacket } from "mysql2";

// 获取习题集列表
export const getExerciseSets: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { page = 1, pageSize = 10, keyword = "" } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);
    const userId = req.user?.id;

    let sql = `
      SELECT 
        es.id,
        es.title,
        es.description,
        es.created_at,
        es.updated_at,
        (SELECT COUNT(*) FROM questions WHERE exercise_set_id = es.id) as question_count,
        ${userId ? `EXISTS(SELECT 1 FROM favorites WHERE target_id = es.id AND target_type = 'exercise' AND user_id = ${userId}) as is_collected` : 'FALSE as is_collected'}
      FROM exercise_sets es
      WHERE 1=1
    `;
    const params: any[] = [];

    if (keyword) {
      sql += " AND (es.title LIKE ? OR es.description LIKE ?)";
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += " ORDER BY es.created_at DESC LIMIT ? OFFSET ?";
    params.push(Number(pageSize), offset);

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);

    // 获取总数
    let countSql = `SELECT COUNT(*) as total FROM exercise_sets es WHERE 1=1`;
    const countParams: any[] = [];
    if (keyword) {
      countSql += " AND (es.title LIKE ? OR es.description LIKE ?)";
      countParams.push(`%${keyword}%`, `%${keyword}%`);
    }
    const [countRows] = await pool.query<RowDataPacket[]>(countSql, countParams);
    let total = 0;
    if (Array.isArray(countRows) && countRows.length > 0) {
      total = countRows[0].total || 0;
    }

    res.json({
      code: 200,
      success: true,
      data: rows,
      total,
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
      code: 200,
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
      code: 200,
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
      code: 200,
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
    const userId = req.user?.id;

    const [exerciseSet] = await pool.query<RowDataPacket[]>(
      `SELECT es.*, 
       (SELECT COUNT(*) FROM questions WHERE exercise_set_id = es.id) as question_count,
       ${userId ? `EXISTS(SELECT 1 FROM favorites WHERE target_id = es.id AND target_type = 'exercise' AND user_id = ${userId}) as is_collected` : 'FALSE as is_collected'}
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

    const [questions] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM questions WHERE exercise_set_id = ? ORDER BY id ASC",
      [id]
    );

    res.json({
      code: 200,
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

// 更新习题集完成数量
export const updateCompleteCount = async (req: Request, res: Response) => {
  try {
    const { exerciseSetId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "用户ID不能为空",
      });
    }

    if (!exerciseSetId) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "习题集ID不能为空",
      });
    }

    // 添加完成记录
    await pool.query(
      "INSERT INTO exercise_completions (exercise_set_id, user_id, completed_at) VALUES (?, ?, NOW())",
      [exerciseSetId, userId]
    );

    // 更新习题集的完成数量
    await pool.query(
      "UPDATE exercise_sets SET complete_count = (SELECT COUNT(*) FROM exercise_completions WHERE exercise_set_id = ?) WHERE id = ?",
      [exerciseSetId, exerciseSetId]
    );

    // 获取更新后的习题集信息
    const [updatedExerciseSet] = await pool.query(
      `SELECT es.*, 
       (SELECT COUNT(*) FROM questions WHERE exercise_set_id = es.id) as question_count,
       (SELECT COUNT(*) FROM exercise_completions WHERE exercise_set_id = es.id) as complete_count
       FROM exercise_sets es
       WHERE es.id = ?`,
      [exerciseSetId]
    );

    res.json({
      code: 200,
      success: true,
      data: (updatedExerciseSet as any[])[0],
      message: "更新成功",
    });
  } catch (error) {
    console.error("更新完成数量失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 收藏/取消收藏习题
export const toggleExerciseCollection = async (req: Request, res: Response) => {
  try {
    const { exerciseId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    // 将 exerciseId 转换为数字
    const targetId = Number(exerciseId);

    // 检查是否已收藏
    const [existingCollection] = await pool.query<RowDataPacket[]>(
      "SELECT 1 FROM favorites WHERE user_id = ? AND target_id = ? AND target_type = ?",
      [userId, targetId, 'exercise']
    );

    const hasCollected = existingCollection.length > 0;

    if (hasCollected) {
      // 取消收藏
      await pool.query(
        "DELETE FROM favorites WHERE user_id = ? AND target_id = ? AND target_type = ?",
        [userId, targetId, 'exercise']
      );
    } else {
      // 添加收藏
      await pool.query(
        "INSERT INTO favorites (user_id, target_id, target_type) VALUES (?, ?, ?)",
        [userId, targetId, 'exercise']
      );
    }

    // 获取更新后的收藏数
    const [collectionsCount] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM favorites WHERE target_id = ? AND target_type = ?",
      [targetId, 'exercise']
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
