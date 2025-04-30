import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../types/common";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "未提供认证令牌",
      } as ApiResponse<null>);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      success: false,
      message: "无效的认证令牌",
    } as ApiResponse<null>);
  }
}; 