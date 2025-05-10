import express from "express";
import { addHistory, getHistory } from "../controllers/history";

const router = express.Router();

// 添加历史记录
router.post("/add", addHistory);
// 获取历史记录
router.get("/list", getHistory);

export default router;
