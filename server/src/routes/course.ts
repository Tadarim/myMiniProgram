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
  updateCourseViewCount,
  toggleCourseCollection
} from "../controllers/course";
import {
  verifyTokenMiddleware,
  setUserFromToken,
} from "../middleware/verifyToken";

const router = express.Router();

router.get("/list", getCourseList);
router.get("/:id", getCourseDetail);
router.post("/", createCourse);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

router.post(
  "/:courseId/rate",
  verifyTokenMiddleware(),
  setUserFromToken,
  rateCourse
);
router.post(
  "/view",
  verifyTokenMiddleware(),
  setUserFromToken,
  updateCourseViewCount
);

router.post("/chapter", createChapter);
router.put("/chapter/:id", updateChapter);
router.delete("/chapter/:id", deleteChapter);
router.get("/chapter/:id", getChapterDetail);

router.put("/material/:id/review", reviewMaterial);
router.delete("/material/:id", deleteMaterial);

router.post("/:courseId/collection", verifyTokenMiddleware(), setUserFromToken, toggleCourseCollection);

export default router;
