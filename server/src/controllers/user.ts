import { Request, Response } from "express";
import {
  UserInfo,
  ApiResponse,
  Gender,
  LearningLevel,
  LearningStyle,
  TimePreference,
  LearningProfile,
  UserRow,
} from "../types/user";
import { query } from "../utils/query";
import { RowDataPacket } from "mysql2";
import { pool } from "../utils/pool";

export const getUserList = async (req: Request, res: Response) => {
  try {
    const sql = `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.avatar,
        u.background_image as backgroundImage,
        u.description,
        u.extra
      FROM users u
      ORDER BY u.id
    `;
    const result = await query<UserRow[]>(sql);

    const users: UserInfo[] = result.map((row) => {
      let extraData = {
        gender: Gender.Unknown,
        location: [],
        school: "",
        createTime: "",
        lastLoginTime: "",
        birthday: "",
        age: "",
        constellation: "",
      };

      if (row.extra) {
        try {
          // 检查是否已经是对象
          if (typeof row.extra === "object") {
            extraData = {
              ...extraData,
              ...(row.extra as Record<string, unknown>),
            };
          } else {
            // 尝试解析JSON字符串
            const parsed = JSON.parse(row.extra);
            extraData = {
              ...extraData,
              ...(parsed as Record<string, unknown>),
            };
          }
        } catch (error) {
          console.warn(`解析用户 ${row.id} 的extra字段失败:`, error);
        }
      }

      return {
        id: row.id,
        username: row.username,
        email: row.email,
        avatar: row.avatar,
        backgroundImage: row.backgroundImage,
        desc: row.description,
        extra: extraData,
        learningProfile: {
          goals: [],
          style: {
            preference: LearningStyle.Visual,
            schedule: TimePreference.Morning,
            interaction: "balanced",
          },
          skills: [],
          history: {
            completedCourses: [],
            averageScore: 0,
            studyHours: 0,
          },
          social: {
            preferredGroupSize: 4,
            leadership: 5,
            cooperation: 5,
          },
          motivation: {
            type: "intrinsic",
            intensity: 5,
            persistence: 5,
          },
        },
      };
    });

    const response: ApiResponse<UserInfo[]> = {
      code: 200,
      data: users,
      success: true,
      total: users.length,
    };
    res.json(response);
  } catch (error) {
    console.error("获取用户列表失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "获取用户列表失败",
    });
  }
};

export const getUserInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const sql = `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.avatar,
        u.background_image as backgroundImage,
        u.description,
        u.extra
      FROM users u
      WHERE u.id = ?
    `;
    const result = await query<UserRow[]>(sql, [userId]);

    if (result.length === 0) {
      const response: ApiResponse<null> = {
        code: 404,
        data: null,
        success: false,
        message: "用户不存在",
      };
      return res.status(404).json(response);
    }

    let extraData = {
      gender: Gender.Unknown,
      location: [],
      school: "",
      createTime: "",
      lastLoginTime: "",
      birthday: "",
      age: "",
      constellation: "",
    };

    if (result[0].extra) {
      try {
        // 检查是否已经是对象
        if (typeof result[0].extra === "object") {
          extraData = {
            ...extraData,
            ...(result[0].extra as Record<string, unknown>),
          };
        } else {
          // 尝试解析JSON字符串
          const parsed = JSON.parse(result[0].extra);
          extraData = {
            ...extraData,
            ...(parsed as Record<string, unknown>),
          };
        }
      } catch (error) {
        console.warn(`解析用户 ${result[0].id} 的extra字段失败:`, error);
      }
    }

    const user: UserInfo = {
      id: result[0].id,
      username: result[0].username,
      email: result[0].email,
      avatar: result[0].avatar,
      backgroundImage: result[0].backgroundImage,
      desc: result[0].description,
      extra: extraData,
      learningProfile: {
        goals: [],
        style: {
          preference: LearningStyle.Visual,
          schedule: TimePreference.Morning,
          interaction: "balanced",
        },
        skills: [],
        history: {
          completedCourses: [],
          averageScore: 0,
          studyHours: 0,
        },
        social: {
          preferredGroupSize: 4,
          leadership: 5,
          cooperation: 5,
        },
        motivation: {
          type: "intrinsic",
          intensity: 5,
          persistence: 5,
        },
      },
    };

    const response: ApiResponse<UserInfo> = {
      code: 200,
      data: user,
      success: true,
    };
    res.json(response);
  } catch (error) {
    console.error("获取用户信息失败:", error);
    const response: ApiResponse<null> = {
      code: 500,
      data: null,
      success: false,
      message: "服务器错误",
    };
    res.status(500).json(response);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const updateData = req.body as Partial<UserInfo>;

    const sql = `
      UPDATE users 
      SET 
        username = ?,
        email = ?,
        avatar = ?,
        background_image = ?,
        description = ?,
        extra = ?
      WHERE id = ?
    `;

    const extra = {
      ...(updateData.extra || {}),
      gender: updateData.extra?.gender || Gender.Unknown,
      location: updateData.extra?.location || [],
      school: updateData.extra?.school || "",
      createTime: updateData.extra?.createTime || "",
      lastLoginTime: updateData.extra?.lastLoginTime || "",
      birthday: updateData.extra?.birthday || "",
      age: updateData.extra?.age || "",
      constellation: updateData.extra?.constellation || "",
    };

    await query(sql, [
      updateData.username || "",
      updateData.email || "",
      updateData.avatar || "",
      updateData.backgroundImage || "",
      updateData.desc || "",
      JSON.stringify(extra),
      userId,
    ]);

    const response: ApiResponse<UserInfo> = {
      code: 200,
      data: {
        id: parseInt(userId),
        username: updateData.username || "",
        email: updateData.email || "",
        avatar: updateData.avatar || "",
        backgroundImage: updateData.backgroundImage || "",
        desc: updateData.desc || "",
        extra,
        learningProfile: updateData.learningProfile || {
          goals: [],
          style: {
            preference: LearningStyle.Visual,
            schedule: TimePreference.Morning,
            interaction: "balanced",
          },
          skills: [],
          history: {
            completedCourses: [],
            averageScore: 0,
            studyHours: 0,
          },
          social: {
            preferredGroupSize: 4,
            leadership: 5,
            cooperation: 5,
          },
          motivation: {
            type: "intrinsic",
            intensity: 5,
            persistence: 5,
          },
        },
      },
      success: true,
    };
    res.json(response);
  } catch (error) {
    console.error("更新用户信息失败:", error);
    const response: ApiResponse<null> = {
      code: 500,
      data: null,
      success: false,
      message: "服务器错误",
    };
    res.status(500).json(response);
  }
};

// 删除用户
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const sql = "DELETE FROM users WHERE id = ?";
    await query(sql, [userId]);

    const response: ApiResponse<null> = {
      code: 200,
      data: null,
      success: true,
    };
    res.json(response);
  } catch (error) {
    console.error("删除用户失败:", error);
    const response: ApiResponse<null> = {
      code: 500,
      data: null,
      success: false,
      message: "服务器错误",
    };
    res.status(500).json(response);
  }
};

// 获取用户统计数据
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    // 1. 获取用户学习的课程数量（通过历史记录中的course类型计算）
    const [courseResult] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT target_id) as courseCount 
       FROM history_records 
       WHERE user_id = ? AND target_type = 'course'`,
      [userId]
    );
    const courseCount = courseResult[0]?.courseCount || 0;

    // 2. 获取用户完成的题库数量（通过exercise_completions表计算）
    const [exerciseResult] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT exercise_set_id) as exerciseCount 
       FROM exercise_completions 
       WHERE user_id = ?`,
      [userId]
    );
    const exerciseCount = exerciseResult[0]?.exerciseCount || 0;

    // 3. 获取用户最近学习的5个课程
    const [recentCourses] = await pool.query<RowDataPacket[]>(
      `SELECT c.id, c.title, c.cover, h.created_at
       FROM history_records h
       JOIN courses c ON h.target_id = c.id
       WHERE h.user_id = ? AND h.target_type = 'course'
       ORDER BY h.created_at DESC
       LIMIT 5`,
      [userId]
    );

    // 4. 获取用户最近完成的5个题库
    const [recentExercises] = await pool.query<RowDataPacket[]>(
      `SELECT e.id, e.title, ec.completed_at
       FROM exercise_completions ec
       JOIN exercise_sets e ON ec.exercise_set_id = e.id
       WHERE ec.user_id = ?
       ORDER BY ec.completed_at DESC
       LIMIT 5`,
      [userId]
    );

    res.json({
      code: 200,
      success: true,
      data: {
        courseCount,
        exerciseCount,
        recentCourses,
        recentExercises,
      },
    });
  } catch (error) {
    console.error("获取用户统计数据失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};
