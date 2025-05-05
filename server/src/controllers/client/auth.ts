import { Request, Response } from "express";
import { query } from "../../utils/query";
import bcrypt from "bcryptjs";
import { generateUserToken } from "../../utils/token";
import {
  generateCode,
  saveCode,
  verifyCode,
  deleteCode,
} from "../../utils/verificationCodes";
import { formatDate } from "../../utils/date";
import {
  UserInfo,
  Gender,
  LearningStyle,
  TimePreference,
} from "../../types/user";
import {
  WeChatResponse,
  UserRow,
  LoginRequest,
  SendCodeRequest,
  ResetPasswordRequest,
  WeChatLoginRequest,
  LoginResponse,
} from "../../types/auth";
import { ApiResponse } from "../../types/common";

declare module "express" {
  interface Request {
    user?: {
      id: number;
    };
  }
}

// 查找用户
async function findUserByEmail(email: string): Promise<UserRow | null> {
  const sql = "SELECT * FROM users WHERE email = ?";
  const result = await query<UserRow[]>(sql, [email]);
  return result[0] || null;
}

// 通过ID查找用户
async function findUserById(id: number): Promise<UserRow | null> {
  const sql = "SELECT * FROM users WHERE id = ?";
  const result = await query<UserRow[]>(sql, [id]);
  return result[0] || null;
}

// 生成随机用户名
function generateRandomUsername(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000); // 生成6位随机数
  return `用户${randomNum}`;
}

// 创建用户
async function createUser(
  email: string,
  password: string,
  username?: string
): Promise<UserRow> {
  const hash = await bcrypt.hash(password, 10);
  const now = new Date();
  const defaultExtra = {
    gender: Gender.Unknown,
    location: [],
    school: "",
    createTime: formatDate(now),
    lastLoginTime: formatDate(now),
    birthday: "",
    age: "",
    constellation: "",
  };

  const defaultUsername = username || generateRandomUsername();

  // 默认背景图片和头像
  const defaultBackgroundImage =
    "https://img20.360buyimg.com/openfeedback/jfs/t1/275753/36/25037/149784/68089586Ffe6bf8d7/ae8f30f33cc1694a.png";
  const defaultAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=4";

  const sql = `
    INSERT INTO users (username, email, password, avatar, background_image, description, extra)
    VALUES (?, ?, ?, ?, ?, '', ?)
  `;
  await query(sql, [
    defaultUsername,
    email,
    hash,
    defaultAvatar,
    defaultBackgroundImage,
    JSON.stringify(defaultExtra),
  ]);

  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("Failed to create user");
  }
  return user;
}

// 验证密码
async function verifyPassword(
  user: UserRow,
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, user.password);
}

// 转换用户响应
function toUserResponse(user: UserRow): UserInfo {
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

  if (user.extra) {
    try {
      extraData =
        typeof user.extra === "string" ? JSON.parse(user.extra) : user.extra;
    } catch (error) {
      console.warn(`解析用户 ${user.id} 的extra字段失败:`, error);
    }
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    backgroundImage: user.background_image,
    desc: user.description,
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
}

// 更新用户最后登录时间
async function updateLastLoginTime(userId: number) {
  const now = formatDate(new Date());
  const sql =
    "UPDATE users SET extra = JSON_SET(extra, '$.lastLoginTime', ?) WHERE id = ?";
  await query(sql, [now, userId]);
}

const authController = {
  // 邮箱登录/注册
  async login(
    req: Request<{}, {}, LoginRequest>,
    res: Response<Omit<ApiResponse<LoginResponse>, "code">>
  ) {
    try {
      const { email, password } = req.body;

      // 查找用户
      let user = await findUserByEmail(email);
      if (!user) {
        // 用户不存在，创建新用户（不传 username，使用邮箱前缀）
        user = await createUser(email, password);
      } else {
        // 验证密码
        const isMatch = await verifyPassword(user, password);
        if (!isMatch) {
          return res.status(401).json({
            success: false,
            message: "密码错误",
          });
        }
      }

      // 更新最后登录时间
      await updateLastLoginTime(user.id);

      // 生成token
      const token = generateUserToken(user.id);

      res.json({
        success: true,
        data: {
          token,
          user: toUserResponse(user),
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "服务器错误",
      });
    }
  },

  // 发送验证码
  async sendVerificationCode(
    req: Request<{}, {}, SendCodeRequest>,
    res: Response<Omit<ApiResponse<LoginResponse>, "code">>
  ) {
    try {
      const { email } = req.body;

      // 生成6位验证码
      const code = generateCode();

      // 保存验证码并发送邮件
      await saveCode(email, code);

      res.json({
        success: true,
        message: "验证码已发送",
      });
    } catch (error) {
      console.error("Send verification code error:", error);
      res.status(500).json({
        success: false,
        message: "发送验证码失败",
      });
    }
  },

  // 重置密码
  async resetPassword(
    req: Request<{}, {}, ResetPasswordRequest>,
    res: Response<Omit<ApiResponse<LoginResponse>, "code">>
  ) {
    try {
      const { email, code, newPassword } = req.body;

      // 验证验证码
      if (!verifyCode(email, code)) {
        return res.status(400).json({
          success: false,
          message: "验证码错误或已过期",
        });
      }

      // 查找用户
      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "用户不存在",
        });
      }

      // 更新密码
      const hash = await bcrypt.hash(newPassword, 10);
      const sql = "UPDATE users SET password = ? WHERE email = ?";
      await query(sql, [hash, email]);

      // 删除验证码
      deleteCode(email);

      res.json({
        success: true,
        message: "密码重置成功",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({
        success: false,
        message: "重置密码失败",
      });
    }
  },

  // 微信登录
  async wechatLogin(
    req: Request<{}, {}, WeChatLoginRequest>,
    res: Response<Omit<ApiResponse<LoginResponse>, "code">>
  ) {
    try {
      const { code } = req.body;

      // 查找固定的微信用户
      let user = await findUserById(4); // 使用固定的ID

      if (!user) {
        // 如果用户不存在，创建新用户
        user = await createUser(
          "wechat@example.com",
          "wechat_password",
          "微信用户"
        );
      }

      // 更新最后登录时间
      await updateLastLoginTime(user.id);

      // 生成token
      const token = generateUserToken(user.id);

      res.json({
        success: true,
        data: {
          token,
          user: toUserResponse(user),
        },
      });
    } catch (error) {
      console.error("WeChat login error:", error);
      res.status(500).json({
        success: false,
        message: "微信登录失败",
      });
    }
  },

  // 更新用户信息
  async updateUserInfo(
    req: Request<{}, {}, Partial<UserInfo>>,
    res: Response<Omit<ApiResponse<UserInfo>, "code">>
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "未授权",
        });
      }

      const { username, avatar, backgroundImage, desc, extra } = req.body;

      // 获取当前用户信息
      const currentUser = await findUserById(userId);
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: "用户不存在",
        });
      }

      // 解析当前用户的 extra 数据
      let currentExtra: {
        gender?: Gender;
        location?: string[];
        school?: string;
        birthday?: string;
        age?: string;
        constellation?: string;
      } = {};
      try {
        currentExtra =
          typeof currentUser.extra === "string"
            ? JSON.parse(currentUser.extra)
            : currentUser.extra;
      } catch (error) {
        console.warn("解析用户extra数据失败:", error);
      }

      // 构建更新SQL
      const updateFields = [];
      const updateValues = [];

      // 只更新有值的字段
      if (username !== undefined && username !== "") {
        updateFields.push("username = ?");
        updateValues.push(username);
      }

      if (avatar !== undefined && avatar !== "") {
        updateFields.push("avatar = ?");
        updateValues.push(avatar);
      }

      if (backgroundImage !== undefined && backgroundImage !== "") {
        updateFields.push("background_image = ?");
        updateValues.push(backgroundImage);
      }

      if (desc !== undefined) {
        updateFields.push("description = ?");
        updateValues.push(desc);
      }

      // 处理 extra 字段
      if (extra) {
        const newExtra = { ...currentExtra };

        // 只更新有值的字段
        if (extra.gender !== undefined) {
          newExtra.gender = extra.gender;
        }
        if (extra.location !== undefined && extra.location.length > 0) {
          newExtra.location = extra.location;
        }
        if (extra.school !== undefined && extra.school !== "") {
          newExtra.school = extra.school;
        }
        if (extra.birthday !== undefined && extra.birthday !== "") {
          newExtra.birthday = extra.birthday;
        }
        if (extra.age !== undefined && extra.age !== "") {
          newExtra.age = extra.age;
        }
        if (extra.constellation !== undefined && extra.constellation !== "") {
          newExtra.constellation = extra.constellation;
        }

        updateFields.push("extra = ?");
        updateValues.push(JSON.stringify(newExtra));
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: "没有需要更新的字段",
        });
      }

      // 添加用户ID到更新值中
      updateValues.push(userId);

      const sql = `
        UPDATE users 
        SET ${updateFields.join(", ")}
        WHERE id = ?
      `;

      await query(sql, updateValues);

      // 获取更新后的用户信息
      const updatedUser = await findUserById(userId);
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "用户不存在",
        });
      }

      res.json({
        success: true,
        data: toUserResponse(updatedUser),
      });
    } catch (error) {
      console.error("Update user info error:", error);
      res.status(500).json({
        success: false,
        message: "更新用户信息失败",
      });
    }
  },
};

export default authController;
