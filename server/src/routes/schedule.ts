import { Router } from "express";
import {
  getSchedules,
  createSchedule,
  deleteSchedule,
} from "../controllers/schedule";

const router = Router();

// 获取日程列表
router.get("/list", getSchedules);

// 创建日程
router.post("/create", createSchedule);

// 删除日程
router.delete("/delete/:id", deleteSchedule);

export default router;
