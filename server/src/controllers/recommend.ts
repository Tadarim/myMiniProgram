import { Request, Response } from "express";
import {
  updateUserSimilarity,
  getRecommendedUsers as getRecommendedUsersService,
  getRecommendedTags,
  getRecommendedExercises as getRecommendedExercisesService,
  getRecommendedGroups as getRecommendedGroupsService,
  getRecommendedPosts as getRecommendedPostsService,
  getRecommendedCourses as getRecommendedCoursesService,
} from "../services/recommend";

// 获取推荐用户
export const getRecommendedUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ code: 401, success: false, message: "请先登录" });
    }
    const users = await getRecommendedUsersService(userId);
    res.json({ code: 200, success: true, data: users });
  } catch (error) {
    console.error("获取推荐用户失败:", error);
    res.status(500).json({ code: 500, success: false, message: "获取推荐用户失败" });
  }
};

// 获取推荐题目
export const getRecommendedExercises = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ code: 401, success: false, message: "请先登录" });
    }
    const exercises = await getRecommendedExercisesService(userId);
    res.json({ code: 200, success: true, data: exercises });
  } catch (error) {
    console.error("获取推荐题目失败:", error);
    res.status(500).json({ code: 500, success: false, message: "获取推荐题目失败" });
  }
};

// 获取推荐小组
export const getRecommendedGroups = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ code: 401, success: false, message: "请先登录" });
    }
    const groups = await getRecommendedGroupsService(userId);
    res.json({ code: 200, success: true, data: groups });
  } catch (error) {
    console.error("获取推荐小组失败:", error);
    res.status(500).json({ code: 500, success: false, message: "获取推荐小组失败" });
  }
};

// 获取综合推荐内容
export const recommendForUser = async (req: Request, res: Response) => {
  try {
    console.log("命中推荐接口", req.user?.id, req.auth?.id);
    const userId = req.user?.id || req.auth?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ code: 401, success: false, message: "请先登录" });
    }
    // 更新用户相似度
    await updateUserSimilarity(userId);
    // 获取综合推荐内容
    const [users, exercises, groups, posts, courses] = await Promise.all([
      getRecommendedUsersService(userId, 5),
      getRecommendedExercisesService(userId, 5),
      getRecommendedGroupsService(userId, 5),
      getRecommendedPostsService(userId, 5),
      getRecommendedCoursesService(userId, 4),
    ]);

    res.json({
      code: 200,
      success: true,
      data: {
        users,
        exercises,
        groups,
        posts,
        courses,
      },
    });
  } catch (e) {
    res
      .status(500)
      .json({ code: 500, success: false, message: "获取推荐失败", error: e });
  }
};

// 获取推荐帖子
export const getRecommendedPosts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: '请先登录'
      });
    }

    const posts = await getRecommendedPostsService(userId);
    res.json({
      code: 200,
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('获取推荐帖子失败:', error);
    res.status(500).json({
      code: 500,
      success: false,
      message: '服务器错误'
    });
  }
};
