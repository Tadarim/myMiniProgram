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
  uploadPostFile,
  togglePostStatus,
} from "../controllers/post";

const router = Router();

// 获取帖子列表
router.get("/list", getPosts);

// 获取帖子详情
router.get("/:postId", getPostDetail);

// 创建帖子
router.post("/create", createPost);

// 点赞/取消点赞
router.post("/:postId/like", toggleLike);

// 收藏/取消收藏
router.post("/:postId/collection", toggleCollection);

// 获取帖子评论
router.get("/:postId/comments", getComments);

// 添加评论
router.post("/:postId/comments", addComment);

// 删除帖子
router.delete("/:postId", deletePost);

// 上传图片/文件接口
router.post("/upload", uploadPostFile);

// 切换帖子状态
router.put("/:postId/status", togglePostStatus);

export default router;
