import { Router, RequestHandler } from "express";
import * as userController from "../controllers/user";

const router: Router = Router();

// 获取用户列表
router.get("/", userController.getUserList as RequestHandler);

// 获取单个用户信息
router.get("/:id", userController.getUserInfo as RequestHandler);

// 更新用户信息
router.put("/:id", userController.updateUser as RequestHandler);

// 删除用户
router.delete("/:id", userController.deleteUser as RequestHandler);

export default router;
