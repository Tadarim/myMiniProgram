import { Router, Request, Response } from "express";

import { query } from "../../utils/query";

import { generateToken } from "../../utils/token";
import { RowDataPacket } from "mysql2";
import { comparePassword } from "../../utils/password";

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  code: number;
  message?: string;
  data?: {
    token: string;
    userInfo: {
      id: number;
      username: string;
      name: string;
      role: string;
      avatar: string | null;
    };
  };
  success: boolean;
}

interface AdminRow extends RowDataPacket {
  id: number;
  username: string;
  name: string;
  role: string;
  avatar: string | null;
}

export const adminLogin = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response<LoginResponse>
) => {
  const { username, password } = req.body;

  try {
    // 查询管理员信息
    const result = await query<AdminRow[]>(
      "SELECT * FROM admins WHERE username = ?",
      [username]
    );

    if (result.length === 0) {
      return res.status(200).json({
        code: 200,
        message: "用户名或密码错误",
        success: false,
      });
    }

    const admin = result[0];

    // 验证密码
    const isPasswordValid = await comparePassword(password, admin.password);
    if (!isPasswordValid) {
      return res.status(200).json({
        code: 200,
        message: "用户名或密码错误",
        success: false,
      });
    }

    // 生成 token
    const token = generateToken({
      id: admin.id,
      username: admin.username,
      role: admin.role as "user" | "admin",
    });

    // 返回成功响应
    return res.json({
      code: 200,
      data: {
        token,
        userInfo: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          role: admin.role,
          avatar: admin.avatar,
        },
      },
      success: true,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(200).json({
      code: 200,
      message: "服务器错误",
      success: false,
    });
  }
};
