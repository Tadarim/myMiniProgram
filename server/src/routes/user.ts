import { Router, RequestHandler } from "express";
import * as userController from "../controllers/user";
import {
  verifyTokenMiddleware,
  setUserFromToken,
} from "../middleware/verifyToken";

const router: Router = Router();

// 获取用户列表
router.get("/", userController.getUserList as RequestHandler);

// 获取用户统计数据
router.get(
  "/stats/me",
  verifyTokenMiddleware(),
  setUserFromToken,
  userController.getUserStats as RequestHandler
);

// 获取单个用户信息
router.get("/:id", userController.getUserInfo as RequestHandler);

// 更新用户信息
router.put("/:id", userController.updateUser as RequestHandler);

// 删除用户
router.delete("/:id", userController.deleteUser as RequestHandler);

export default router;
