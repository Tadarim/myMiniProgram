import express from "express";
import {
  getCourseList,
  getCourseDetail,
  createCourse,
  updateCourse,
  deleteCourse,
  rateCourse,
  createChapter,
  updateChapter,
  deleteChapter,
  getChapterDetail,
  reviewMaterial,
  deleteMaterial,
} from "../controllers/course";
import { auth } from "../middleware/auth";

const router = express.Router();

// 课程相关路由
router.get("/list", getCourseList);
router.get("/:id", getCourseDetail);
router.post("/", auth, createCourse);
router.put("/:id", auth, updateCourse);
router.delete("/:id", auth, deleteCourse);
router.post("/:courseId/rate", auth, rateCourse);

// 章节相关路由
router.post("/chapter", auth, createChapter);
router.put("/chapter/:id", auth, updateChapter);
router.delete("/chapter/:id", auth, deleteChapter);
router.get("/chapter/:id", getChapterDetail);

// 资料相关路由
router.put("/material/:id/review", auth, reviewMaterial);
router.delete("/material/:id", auth, deleteMaterial);

export default router;
