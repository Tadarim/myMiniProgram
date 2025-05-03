import { Request, Response } from "express";
import {
  Course,
  CourseQuery,
  CourseCreate,
  CourseUpdate,
  MaterialType,
  CourseRow,
  ChapterRow,
  MaterialRow,
  Chapter,
} from "../types/course";
import { ApiResponse } from "../types/common";
import { query, getConnection } from "../utils/query";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../utils/pool";
import { RequestHandler } from "express";

// 获取课程列表
export const getCourseList: RequestHandler = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = "" } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);
    const auth = req.auth as { id: number; role: "admin" | "user" } | undefined;
    const userId = auth?.id;
    const isAdmin = auth?.role === "admin";

    let sql = `
      SELECT 
        c.id,
        c.title,
        c.description,
        c.cover,
        c.rating,
        c.status,
        c.created_at,
        c.updated_at,
        CASE WHEN f.id IS NOT NULL THEN true ELSE false END as is_collected
      FROM courses c
      LEFT JOIN favorites f ON c.id = f.target_id 
        AND f.user_id = ? 
        AND f.target_type = 'course'
    `;

    const params: any[] = [userId];
    
    // 如果不是管理员，只返回已发布的课程
    if (!isAdmin) {
      sql += " WHERE c.status = 'published'";
    }
    
    if (keyword) {
      sql += isAdmin ? " WHERE " : " AND ";
      sql += "c.title LIKE ? OR c.description LIKE ?";
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    
    sql += " ORDER BY c.created_at DESC LIMIT ? OFFSET ?";
    params.push(Number(pageSize), offset);

    const courses = await query<CourseRow[]>(sql, params);

    // 获取总数
    const countSql = `
      SELECT COUNT(*) as total 
      FROM courses c
      ${!isAdmin ? "WHERE c.status = 'published'" : ""}
      ${keyword ? (isAdmin ? "WHERE" : "AND") + " c.title LIKE ? OR c.description LIKE ?" : ""}
    `;
    const countParams = keyword ? [`%${keyword}%`, `%${keyword}%`] : [];
    const [{ total }] = await query<RowDataPacket[]>(countSql, countParams);

    // 列表不返回chapters
    const data: Course[] = courses.map((c) => ({ ...c, chapters: [] }));

    const response: ApiResponse<Course[]> = {
      code: 200,
      data,
      success: true,
      total,
    };
    res.json(response);
  } catch (error) {
    console.error("获取课程列表失败:", error);
    res.status(500).json({
      code: 500,
      data: [],
      success: false,
      message: "获取课程列表失败",
    });
  }
};

// 获取课程详情
export const getCourseDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        code: 400,
        data: null,
        success: false,
        message: "课程ID不能为空",
      });
    }

    // 查询课程基本信息
    const courseSql = `
      SELECT 
        id,
        title,
        description,
        cover,
        rating,
        status,
        created_at,
        updated_at
      FROM courses
      WHERE id = ?
    `;
    const [course] = await query<CourseRow[]>(courseSql, [id]);

    if (!course) {
      return res.status(404).json({
        code: 404,
        data: null,
        success: false,
        message: "课程不存在",
      });
    }

    // 查询课程章节
    const chaptersSql = `
      SELECT 
        id,
        title,
        order_num
      FROM chapters
      WHERE course_id = ?
      ORDER BY order_num ASC
    `;
    const chapters = await query<ChapterRow[]>(chaptersSql, [id]);

    // 查询每个章节的素材
    const chaptersWithMaterials = await Promise.all(
      (chapters || []).map(async (chapter: ChapterRow) => {
        const materialsSql = `
          SELECT 
            id,
            title,
            type,
            url,
            created_at,
            status
          FROM materials
          WHERE chapter_id = ?
          ORDER BY order_num ASC
        `;
        const materials = await query<MaterialRow[]>(materialsSql, [
          chapter.id,
        ]);

        return {
          id: chapter.id.toString(),
          title: chapter.title,
          order: chapter.order_num,
          materials: (materials || []).map((m: MaterialRow) => ({
            id: m.id.toString(),
            title: m.title,
            type: m.type as MaterialType,
            url: m.url,
            upload_time: m.created_at,
            status: m.status || "pending",
            is_system: false,
          })),
        };
      })
    );

    const response: ApiResponse<Course> = {
      code: 200,
      data: {
        ...course,
        is_collected: false, // 默认未收藏
        chapters: chaptersWithMaterials,
      },
      success: true,
    };
    res.json(response);
  } catch (error) {
    console.error("获取课程详情失败:", error);
    res.status(500).json({
      code: 500,
      data: null,
      success: false,
      message: "获取课程详情失败",
    });
  }
};

// 创建课程
export const createCourse = async (req: Request, res: Response) => {
  try {
    const courseData = req.body as CourseCreate;

    // 检查课程名是否已存在
    const checkSql = "SELECT id FROM courses WHERE title = ?";
    const existingCourse = await query<RowDataPacket[]>(checkSql, [
      courseData.title,
    ]);

    if (existingCourse.length > 0) {
      return res.status(400).json({
        code: 400,
        data: null,
        success: false,
        message: "课程名已存在",
      });
    }

    const sql = `
      INSERT INTO courses (
        title,
        description,
        cover,
        rating,
        status
      ) VALUES (?, ?, ?, ?, ?)
    `;
    await query(sql, [
      courseData.title,
      courseData.description,
      courseData.cover,
      0, // 新建课程默认rating为0
      "draft", // 新建课程默认为草稿状态
    ]);
    const response: ApiResponse<null> = {
      code: 200,
      data: null,
      success: true,
    };
    res.json(response);
  } catch (error) {
    console.error("创建课程失败:", error);
    res.status(500).json({
      code: 500,
      data: null,
      success: false,
      message: "创建课程失败",
    });
  }
};

// 更新课程
export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const courseData = req.body as CourseUpdate;
    const updateFields: string[] = [];
    const params: any[] = [];
    if (courseData.title) {
      updateFields.push("title = ?");
      params.push(courseData.title);
    }
    if (courseData.description) {
      updateFields.push("description = ?");
      params.push(courseData.description);
    }
    if (courseData.cover) {
      updateFields.push("cover = ?");
      params.push(courseData.cover);
    }
    if (typeof courseData.rating === "number") {
      updateFields.push("rating = ?");
      params.push(courseData.rating);
    }
    if (courseData.status) {
      updateFields.push("status = ?");
      params.push(courseData.status);
    }
    if (updateFields.length === 0) {
      return res.status(400).json({
        code: 400,
        data: null,
        success: false,
        message: "没有要更新的字段",
      });
    }
    params.push(id);
    const sql = `
      UPDATE courses 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;
    const result = await query<any>(sql, params);
    // 兼容affectedRows
    let affectedRows = 0;
    if (
      Array.isArray(result) &&
      result[0] &&
      typeof result[0].affectedRows === "number"
    ) {
      affectedRows = result[0].affectedRows;
    } else if (result && typeof result.affectedRows === "number") {
      affectedRows = result.affectedRows;
    } else {
      affectedRows = 1; // 默认1
    }
    if (affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        data: null,
        success: false,
        message: "课程不存在",
      });
    }
    const response: ApiResponse<null> = {
      code: 200,
      data: null,
      success: true,
    };
    res.json(response);
  } catch (error) {
    console.error("更新课程失败:", error);
    res.status(500).json({
      code: 500,
      data: null,
      success: false,
      message: "更新课程失败",
    });
  }
};

// 删除课程
export const deleteCourse = async (req: Request, res: Response) => {
  const { id } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await query(
      `DELETE FROM materials WHERE chapter_id IN (SELECT id FROM chapters WHERE course_id = ?)`,
      [id]
    );

    await query(`DELETE FROM chapters WHERE course_id = ?`, [id]);

    await query(`DELETE FROM courses WHERE id = ?`, [id]);

    await connection.commit();
    res.json({ success: true, message: "课程删除成功" });
  } catch (error) {
    await connection.rollback();
    console.error("删除课程失败:", error);
    res.status(500).json({
      success: false,
      message: "删除课程失败",
      error: error instanceof Error ? error.message : "未知错误",
    });
  } finally {
    connection.release();
  }
};

// 评分课程
export const rateCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { rating } = req.body;
    const userId = req.auth?.id; // 从认证中间件获取用户ID

    if (!userId) {
      return res.status(401).json({
        code: 401,
        data: null,
        success: false,
        message: "未登录",
      });
    }

    // 检查评分是否在有效范围内
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        code: 400,
        data: null,
        success: false,
        message: "评分必须在1-5之间",
      });
    }

    // 检查课程是否存在
    const checkSql = "SELECT id FROM courses WHERE id = ?";
    const [course] = await query<RowDataPacket[]>(checkSql, [courseId]);

    if (!course) {
      return res.status(404).json({
        code: 404,
        data: null,
        success: false,
        message: "课程不存在",
      });
    }

    // 更新课程评分
    const sql = `
      UPDATE courses 
      SET rating = ?
      WHERE id = ?
    `;
    await query(sql, [rating, courseId]);

    const response: ApiResponse<null> = {
      code: 200,
      data: null,
      success: true,
      message: "评分成功",
    };
    res.json(response);
  } catch (error) {
    console.error("评分失败:", error);
    res.status(500).json({
      code: 500,
      data: null,
      success: false,
      message: "评分失败",
    });
  }
};

// 创建章节
export const createChapter = async (req: Request, res: Response) => {
  try {
    const { courseId, title } = req.body;

    // 检查章节名是否已存在
    const checkSql =
      "SELECT id FROM chapters WHERE course_id = ? AND title = ?";
    const existingChapter = await query<RowDataPacket[]>(checkSql, [
      courseId,
      title,
    ]);

    if (existingChapter.length > 0) {
      return res.status(400).json({
        success: false,
        message: "该课程下已存在同名章节",
      });
    }

    // 获取当前课程的最大 order_num
    const maxOrderResult = await query<RowDataPacket[]>(
      "SELECT MAX(order_num) as maxOrder FROM chapters WHERE course_id = ?",
      [courseId]
    );
    const maxOrder = maxOrderResult[0]?.maxOrder || 0;

    // 插入新章节
    const result = await query<ResultSetHeader>(
      "INSERT INTO chapters (course_id, title, order_num) VALUES (?, ?, ?)",
      [courseId, title, maxOrder + 1]
    );

    res.json({
      success: true,
      message: "创建章节成功",
      data: {
        id: result.insertId,
        title,
        order_num: maxOrder + 1,
      },
    });
  } catch (error: any) {
    console.error("创建章节失败:", error);
    res.status(500).json({
      success: false,
      message: "创建章节失败",
      error: error.message,
    });
  }
};

// 更新章节
export const updateChapter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!id) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "章节ID不能为空",
      });
    }

    // 检查章节是否存在
    const checkSql = "SELECT id FROM chapters WHERE id = ?";
    const [chapter] = await query<ChapterRow[]>(checkSql, [id]);

    if (!chapter) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "章节不存在",
      });
    }

    // 更新章节
    const updateSql = `
      UPDATE chapters
      SET title = ?
      WHERE id = ?
    `;
    await query(updateSql, [title, id]);

    res.json({
      code: 200,
      success: true,
      message: "更新成功",
    });
  } catch (error) {
    console.error("更新章节失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "更新章节失败",
    });
  }
};

// 删除章节
export const deleteChapter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "章节ID不能为空",
      });
    }

    // 检查章节是否存在
    const checkSql = "SELECT id FROM chapters WHERE id = ?";
    const [chapter] = await query<ChapterRow[]>(checkSql, [id]);

    if (!chapter) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "章节不存在",
      });
    }

    // 开始事务
    const connection = await getConnection();
    await connection.beginTransaction();

    try {
      // 删除章节下的所有资料
      const deleteMaterialsSql = "DELETE FROM materials WHERE chapter_id = ?";
      await query(deleteMaterialsSql, [id]);

      // 删除章节
      const deleteChapterSql = "DELETE FROM chapters WHERE id = ?";
      await query(deleteChapterSql, [id]);

      // 提交事务
      await connection.commit();

      res.json({
        code: 200,
        success: true,
        message: "删除成功",
      });
    } catch (error) {
      // 回滚事务
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error("删除章节失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "删除章节失败",
    });
  }
};

// 获取章节详情
export const getChapterDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "章节ID不能为空",
      });
    }

    // 获取章节基本信息
    const chapterSql = `
      SELECT 
        id,
        title,
        order_num
      FROM chapters
      WHERE id = ?
    `;
    const [chapter] = await query<ChapterRow[]>(chapterSql, [id]);

    if (!chapter) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "章节不存在",
      });
    }

    // 获取章节下的资料
    const materialsSql = `
      SELECT 
        id,
        title,
        type,
        url,
        created_at,
        status,
        is_system
      FROM materials
      WHERE chapter_id = ?
      ORDER BY order_num ASC
    `;
    const materials = await query<MaterialRow[]>(materialsSql, [id]);

    const response: ApiResponse<Chapter> = {
      code: 200,
      success: true,
      data: {
        id: chapter.id.toString(),
        title: chapter.title,
        order: chapter.order_num,
        materials: (materials || []).map((m: MaterialRow) => ({
          id: m.id.toString(),
          title: m.title,
          type: m.type as MaterialType,
          url: m.url,
          upload_time: m.created_at,
          status: m.status,
          is_system: m.is_system,
        })),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("获取章节详情失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "获取章节详情失败",
    });
  }
};

// 审核资料
export const reviewMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    if (!id) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "资料ID不能为空",
      });
    }

    // 检查资料是否存在
    const checkSql = "SELECT id FROM materials WHERE id = ?";
    const [material] = await query<MaterialRow[]>(checkSql, [id]);

    if (!material) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "资料不存在",
      });
    }

    // 更新资料状态
    const updateSql = `
      UPDATE materials
      SET status = ?
      WHERE id = ?
    `;
    await query(updateSql, [approved ? "approved" : "rejected", id]);

    res.json({
      code: 200,
      success: true,
      message: "审核成功",
    });
  } catch (error) {
    console.error("审核资料失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "审核资料失败",
    });
  }
};

// 删除资料
export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "资料ID不能为空",
      });
    }

    // 检查资料是否存在
    const checkSql = "SELECT id FROM materials WHERE id = ?";
    const [material] = await query<MaterialRow[]>(checkSql, [id]);

    if (!material) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "资料不存在",
      });
    }

    // 删除资料
    const deleteSql = "DELETE FROM materials WHERE id = ?";
    await query(deleteSql, [id]);

    res.json({
      code: 200,
      success: true,
      message: "删除成功",
    });
  } catch (error) {
    console.error("删除资料失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "删除资料失败",
    });
  }
};
