import express, { Request, Response } from "express";
import { query } from "../../utils/query";
import { QUERY_TABLE } from "../../utils/sql";
import { parse } from "../../utils/parse";
import { RowDataPacket } from "mysql2";

const router = express.Router();

interface ExerciseResponse {
  id: number;
  exerciseName: string;
  exerciseContent: string;
  isHot: number;
  finsihCount: number;
  totalCount: number;
  exerciseDifficulty: string;
  exerciseType: string;
}

interface ExerciseDetailResponse {
  exerciseName: string;
  topicList: Array<{
    topicType: number;
    isUpload: boolean;
    [key: string]: any;
  }>;
}

interface ScoreRequest {
  openid: string;
  score: number;
  exerciseId: number;
}

interface RankItem {
  count: number;
  total: number;
  studentId: number;
  studentName: string;
  studentAvatar: string;
  nickName: string;
  correctRate: string;
}

interface DBExercise extends RowDataPacket {
  id: number;
  exercise_name: string;
  exercise_content: string;
  is_hot: number;
  finish_count: number;
  total_count: number;
  exercise_difficulty: string;
  exercise_type: string;
  topic_list: string;
}

interface StudentInfo extends RowDataPacket {
  id: number;
  student_name: string;
  nick_name: string;
}

interface ExerciseScore extends RowDataPacket {
  id: number;
}

interface RankResult extends RowDataPacket {
  count: number;
  total: number;
  student_id: number;
  student_name: string;
  nick_name: string;
  student_avatar: string;
}

router.get("/exercises", async (req: Request, res: Response) => {
  try {
    const response: ExerciseResponse[] = [];
    const result = await query<DBExercise[]>(QUERY_TABLE("exercise_list"));

    result.forEach((item: DBExercise) => {
      const {
        id,
        exercise_name,
        exercise_content,
        is_hot,
        finish_count,
        total_count,
        exercise_difficulty,
        exercise_type,
      } = item;

      response.push({
        id,
        exerciseName: exercise_name,
        exerciseContent: exercise_content,
        isHot: is_hot,
        finsihCount: finish_count,
        totalCount: total_count,
        exerciseDifficulty: exercise_difficulty,
        exerciseType: exercise_type,
      });
    });

    res.json(parse(response));
  } catch (error) {
    console.error("获取练习列表错误:", error);
    res.status(500).json({
      code: 500,
      message: "获取练习列表失败",
    });
  }
});

router.get(
  "/exercises/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { id } = req.params;
      const result = await query<DBExercise[]>(
        `SELECT exercise_name, topic_list FROM exercise_list WHERE id = ?`,
        [id]
      );

      if (result.length === 0) {
        return res.status(404).json({
          code: 404,
          message: "练习不存在",
        });
      }

      const exercise = result[0];
      const { exercise_name, topic_list } = exercise;
      const topicList = JSON.parse(topic_list);

      const response: ExerciseDetailResponse = {
        exerciseName: exercise_name,
        topicList: topicList.map((item: any) => ({
          ...item,
          isUpload: item.topicType === 3,
        })),
      };

      res.json({
        code: 200,
        data: response,
      });
    } catch (error) {
      console.error("获取练习详情错误:", error);
      res.status(500).json({
        code: 500,
        message: "获取练习详情失败",
      });
    }
  }
);

router.put(
  "/exercises/score",
  async (req: Request<{}, {}, ScoreRequest>, res: Response) => {
    try {
      const { openid, score, exerciseId } = req.body;

      const studentInfo = await query<StudentInfo[]>(
        `SELECT id, student_name, nick_name FROM student_list WHERE open_id = ?`,
        [openid]
      );
      const { id = 0 } = studentInfo[0] || {};

      const record = await query<ExerciseScore[]>(
        `SELECT id FROM exercise_score WHERE exercise_id = ? AND student_id = ?`,
        [exerciseId, id]
      );
      const isRecordExist = record.length !== 0;

      if (isRecordExist) {
        await query(
          `UPDATE exercise_score SET student_score = ? WHERE exercise_id = ? AND student_id = ?`,
          [score, exerciseId, id]
        );
      } else {
        await query(
          `INSERT INTO exercise_score(exercise_id, student_id, student_score) VALUES(?, ?, ?)`,
          [exerciseId, id, score]
        );
      }

      res.json({
        code: 200,
        status: true,
      });
    } catch (error) {
      console.error("提交分数错误:", error);
      res.status(500).json({
        code: 500,
        message: "提交分数失败",
      });
    }
  }
);

router.get("/exercises-rank", async (req: Request, res: Response) => {
  try {
    const result = await query<RankResult[]>(
      `SELECT count(exercise_id) as count, 
       sum(student_score) as total, 
       student_id, 
       student_name, 
       nick_name, 
       student_avatar 
       FROM exercise_score 
       left join student_list on exercise_score.student_id = student_list.id 
       GROUP BY student_id 
       ORDER BY count DESC`
    );

    const rankList: RankItem[] = result.map((item: RankResult) => {
      const {
        count,
        total,
        student_id,
        student_name,
        nick_name,
        student_avatar,
      } = item;
      return {
        count,
        total,
        studentId: student_id,
        studentName: student_name,
        studentAvatar: student_avatar,
        nickName: nick_name,
        correctRate: parseFloat((total / (count * 100)).toFixed(4)) * 100 + "%",
      };
    });

    res.json({
      code: 200,
      data: { rankList },
    });
  } catch (error) {
    console.error("获取练习排名错误:", error);
    res.status(500).json({
      code: 500,
      message: "获取练习排名失败",
    });
  }
});

export default router;
