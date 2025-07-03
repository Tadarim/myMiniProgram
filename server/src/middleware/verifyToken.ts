import { expressjwt as jwt } from "express-jwt";
import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        id: number;
        role: "admin" | "user";
      };
      user?: {
        id: number;
      };
    }
  }
}

const verifyTokenMiddleware = () => {
  return jwt({
    secret: process.env.JWT_SECRET ?? '',
    algorithms: ["HS256"],
    credentialsRequired: true,
    getToken: function fromHeaderOrQuerystring(req: Request) {
      if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
      ) {
        return req.headers.authorization.split(" ")[1];
      }
      return undefined;
    },
    requestProperty: "auth",
  }).unless({
    path: [/login/, /admin/, /wechat-login/],
  });
};

// 添加一个中间件来设置 req.user
const setUserFromToken = (req: Request, res: Response, next: NextFunction) => {
  if (req.auth) {
    req.user = {
      id: req.auth.id,
    };
  }
  next();
};

export { verifyTokenMiddleware, setUserFromToken }; 