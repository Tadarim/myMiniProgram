import { Request, Response, NextFunction } from 'express';

interface ErrorWithStatus extends Error {
  status?: number;
}

const interceptToken = (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(next()).catch((err: ErrorWithStatus) => {
    const { status } = err;
    if (status === 401) {
      res.status(401).json({
        code: 401,
        data: {
          msg: '请登录后重试'
        }
      });
    } else {
      next(err); // 将其他错误传递给 Express 的错误处理中间件
    }
  });
};

export default () => interceptToken; 