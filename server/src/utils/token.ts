import jwt from "jsonwebtoken";

export interface JWTPayload {
  id: number;
  username: string;
  role: "user" | "admin";
}

/* 生成用户身份凭证token */
export const generateToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET || "xuxinyu.tadarim";

  const token = jwt.sign(payload, secret, {
    expiresIn: "7d",
    algorithm: "HS256",
  });

  return token;
};

export const generateUserToken = (userId: number): string => {
  return generateToken({
    id: userId,
    username: "",
    role: "user",
  });
};

/* 解密token获取信息 */
export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET || "xuxinyu.tadarim";
  console.log("Verifying token:", token);
  console.log("Using secret:", secret);

  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    }) as JWTPayload;
    console.log("Token verified successfully:", decoded);
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    throw error;
  }
};
