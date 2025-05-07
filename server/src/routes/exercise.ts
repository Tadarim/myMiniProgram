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
} from "../controllers/exercise";

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
router.post("/:exerciseSetId/questions/add", addQuestion);

// 删除题目
router.delete("/:exerciseSetId/questions/:questionId", deleteQuestion);

// 更新完成数
router.post("/:exerciseSetId/complete", updateCompleteCount);

export default router;
