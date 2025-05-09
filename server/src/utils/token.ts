import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "xuxinyu.tadarim";

export interface TokenPayload {
  id: number;
  username: string;
  role: string;
}

/* 生成用户身份凭证token */
export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const generateUserToken = (userId: number): string => {
  return generateToken({
    id: userId,
    username: "",
    role: "user",
  });
};

/* 解密token获取信息 */
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};
