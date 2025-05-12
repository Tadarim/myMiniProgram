import { Router } from "express";
import {
  getRecommendedUsers,
  getRecommendedExercises,
  getRecommendedGroups,
  recommendForUser,
  getRecommendedPosts,
} from "../controllers/recommend";
import { getRecommendedPosts as getRecommendedPostsService } from "../services/recommend";
import {
  verifyTokenMiddleware,
  setUserFromToken,
} from "../middleware/verifyToken";
import { Request, Response } from "express";

const router = Router();

// 获取综合推荐内容
router.get("/", verifyTokenMiddleware(), setUserFromToken, recommendForUser);

// 获取推荐用户
router.get("/users", getRecommendedUsers);

// 获取推荐题目
router.get("/exercises", getRecommendedExercises);

// 获取推荐小组
router.get("/groups", getRecommendedGroups);

// 获取推荐帖子
router.get(
  "/posts",
  verifyTokenMiddleware(),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          code: 401,
          success: false,
          message: "请先登录",
        });
      }

      const posts = await getRecommendedPostsService(userId);
      res.json({
        code: 200,
        success: true,
        data: posts,
      });
    } catch (error) {
      console.error("获取推荐帖子失败:", error);
      res.status(500).json({
        code: 500,
        success: false,
        message: "服务器错误",
      });
    }
  }
);

export default router;
