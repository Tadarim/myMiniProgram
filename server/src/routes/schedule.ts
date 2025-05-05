import { Router } from "express";
import {
  getSchedules,
  createSchedule,
  deleteSchedule,
} from "../controllers/schedule";
import {
  verifyTokenMiddleware,
  setUserFromToken,
} from "../middleware/verifyToken";

const router = Router();

// 获取日程列表
router.get("/list", verifyTokenMiddleware(), setUserFromToken, getSchedules);

// 创建日程
router.post(
  "/create",
  verifyTokenMiddleware(),
  setUserFromToken,
  createSchedule
);

// 删除日程
router.delete(
  "/delete/:id",
  verifyTokenMiddleware(),
  setUserFromToken,
  deleteSchedule
);

export default router;
