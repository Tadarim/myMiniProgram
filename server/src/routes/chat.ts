import express from "express";
import {
  verifyTokenMiddleware,
  setUserFromToken,
} from "../middleware/verifyToken";
import * as chatController from "../controllers/chat";

const router = express.Router();

// 添加路由级别的日志中间件
router.use((req, res, next) => {
  console.log(`[Chat Router Internal] ${req.method} ${req.path}`);
  console.log('Available controllers:', Object.keys(chatController));
  next();
});

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

// 上传聊天图片/文件
router.post(
  "/upload",
  (req, res, next) => {
    console.log('[Upload Route] Entered upload route handler');
    console.log('[Upload Route] req.files:', req.files);
    next();
  },
  verifyTokenMiddleware(),
  setUserFromToken,
  (req, res, next) => {
    console.log('[Upload Route] After token verification');
    console.log('[Upload Route] User:', req.user);
    next();
  },
  chatController.uploadChatMedia
);

export default router;
