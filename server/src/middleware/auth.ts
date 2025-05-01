import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";

// 扩展 Request 类型
declare global {
  namespace Express {
    interface Request {
      auth?: {
        id: number;
        role: "admin" | "user";
      };
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        code: 401,
        data: null,
        success: false,
        message: "未登录",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as JwtPayload;
    
    if (!decoded || typeof decoded === "string") {
      return res.status(401).json({
        code: 401,
        data: null,
        success: false,
        message: "无效的token",
      });
    }

    req.auth = {
      id: decoded.id,
      role: decoded.role as "admin" | "user"
    };

    next();
  } catch (error) {
    console.error("认证失败:", error);
    res.status(401).json({
      code: 401,
      data: null,
      success: false,
      message: "认证失败",
    });
  }
}; 