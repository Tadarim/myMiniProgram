import { Router } from "express";
import {
  getPosts,
  createPost,
  toggleLike,
  toggleCollection,
  getComments,
  addComment,
  getPostDetail,
  deletePost,
  uploadPostFile
} from "../controllers/post";
import {
  verifyTokenMiddleware,
  setUserFromToken,
} from "../middleware/verifyToken";

const router = Router();

// 获取帖子列表
router.get("/list", getPosts);

// 获取帖子详情
router.get("/:postId", getPostDetail);

// 创建帖子
router.post("/create", verifyTokenMiddleware(), setUserFromToken, createPost);

// 点赞/取消点赞
router.post(
  "/:postId/like",
  verifyTokenMiddleware(),
  setUserFromToken,
  toggleLike
);

// 收藏/取消收藏
router.post(
  "/:postId/collection",
  verifyTokenMiddleware(),
  setUserFromToken,
  toggleCollection
);

// 获取帖子评论
router.get("/:postId/comments", getComments);

// 添加评论
router.post(
  "/:postId/comments",
  verifyTokenMiddleware(),
  setUserFromToken,
  addComment
);

// 删除帖子
router.delete(
  "/:postId",
  verifyTokenMiddleware(),
  setUserFromToken,
  deletePost
);

// 上传图片/文件接口
router.post("/upload", verifyTokenMiddleware(), setUserFromToken, uploadPostFile);

export default router;
