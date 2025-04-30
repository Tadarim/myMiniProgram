import express from "express";
import { setUserFromToken } from "../middleware/verifyToken";
import {
  getCourseList,
  getCourseDetail,
  createCourse,
  updateCourse,
  deleteCourse,
  rateCourse,
  getCourseRatings,
  createChapter,
  updateChapter,
  deleteChapter,
  getChapterDetail,
  reviewMaterial,
  deleteMaterial,
} from "../controllers/course";

const router = express.Router();

// 公开接口
router.get("/list", getCourseList);
router.get("/:id", getCourseDetail);
router.get("/chapters/:id", getChapterDetail);

// 需要认证的接口
router.use(setUserFromToken);
router.post("/", createCourse);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);
router.post("/:courseId/rate", rateCourse);
router.get("/:courseId/ratings", getCourseRatings);

// 章节相关
router.post("/chapters", createChapter);
router.put("/chapters/:id", updateChapter);
router.delete("/chapters/:id", deleteChapter);

// 资料相关
router.post("/materials/:id/review", reviewMaterial);
router.delete("/materials/:id", deleteMaterial);

export default router;
