import express from "express";
import {
  verifyTokenMiddleware,
  setUserFromToken,
} from "../middleware/verifyToken";
import * as chatController from "../controllers/chat";

const router = express.Router();

// 获取聊天会话列表
router.get(
  "/sessions",
  verifyTokenMiddleware(),
  setUserFromToken,
  chatController.getChatSessions
);

// 获取聊天消息历史（建议用 sessionId 作为参数）
router.get(
  "/messages/:sessionId",
  verifyTokenMiddleware(),
  setUserFromToken,
  chatController.getChatMessages
);

// 发送消息
router.post(
  "/messages",
  verifyTokenMiddleware(),
  setUserFromToken,
  chatController.sendMessage
);

// 创建或获取会话
router.get(
  "/session/:targetId",
  verifyTokenMiddleware(),
  setUserFromToken,
  chatController.getOrCreateSession
);

export default router;
