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

// 上传聊天图片/文件
router.post(
  "/upload",
  (req, res, next) => {
    console.log("[Upload Route] Entered upload route handler");
    console.log("[Upload Route] req.files:", req.files);
    next();
  },
  verifyTokenMiddleware(),
  setUserFromToken,
  (req, res, next) => {
    console.log("[Upload Route] After token verification");
    console.log("[Upload Route] User:", req.user);
    next();
  },
  chatController.uploadChatMedia
);

// 创建群组
router.post(
  "/group",
  verifyTokenMiddleware(),
  setUserFromToken,
  chatController.createGroup
);

// 获取群组信息
router.get(
  "/group/:groupId",
  verifyTokenMiddleware(),
  setUserFromToken,
  chatController.getGroupInfo
);

// 加入群组
router.post(
  "/group/:groupId/join",
  verifyTokenMiddleware(),
  setUserFromToken,
  chatController.joinGroup
);

// 退出群组
router.post(
  "/group/:groupId/leave",
  verifyTokenMiddleware(),
  setUserFromToken,
  chatController.leaveGroup
);

// 解散群组（仅群主可操作）
router.post(
  "/group/:groupId/dissolve",
  verifyTokenMiddleware(),
  setUserFromToken,
  chatController.dissolveGroup
);

// 获取我的群组列表
router.get(
  "/my-groups",
  verifyTokenMiddleware(),
  setUserFromToken,
  chatController.getMyGroups
);

// 搜索群组
router.get(
  "/search-groups",
  verifyTokenMiddleware(),
  setUserFromToken,
  chatController.searchGroups
);

// 搜索群组 (新路径)
router.get(
  "/groups/search",
  verifyTokenMiddleware(),
  setUserFromToken,
  chatController.searchGroups
);

export default router;
