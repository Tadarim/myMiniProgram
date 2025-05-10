import { Router } from "express";
import {
  getExerciseSets,
  createExerciseSet,
  updateExerciseSet,
  deleteExerciseSet,
  getExerciseSetDetail,
  addQuestion,
  deleteQuestion,
  updateCompleteCount,
  toggleExerciseCollection,
} from "../controllers/exercise";
import {
  verifyTokenMiddleware,
  setUserFromToken,
} from "../middleware/verifyToken";

const router = Router();

// 获取习题集列表
router.get("/list", getExerciseSets);

// 创建习题集
router.post("/create", createExerciseSet);

// 更新习题集
router.put("/update/:id", updateExerciseSet);

// 删除习题集
router.delete("/delete/:id", deleteExerciseSet);

// 获取习题集详情
router.get("/detail/:id", getExerciseSetDetail);

// 添加题目
router.post("/:exerciseSetId/questions", addQuestion);

// 删除题目
router.delete("/:exerciseSetId/questions/:questionId", deleteQuestion);

// 增加完成数量
router.post("/:exerciseSetId/complete", updateCompleteCount);

// 收藏/取消收藏
router.post(
  "/:exerciseId/collection",
  verifyTokenMiddleware(),
  setUserFromToken,
  toggleExerciseCollection
);

export default router;
