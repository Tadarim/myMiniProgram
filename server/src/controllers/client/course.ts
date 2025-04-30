import express, { Request, Response } from "express";
import { query } from "../../utils/query";
import { QUERY_TABLE, INSERT_TABLE } from "../../utils/sql";
import { parse } from "../../utils/parse";
import { RowDataPacket } from "mysql2";

const router = express.Router();

interface CourseResponse {
  id: number;
  courseName: string;
  isRecommend: number;
}

interface CourseDetailResponse {
  id: number;
  courseAuthor: string;
  publishDate: string;
  courseViews: number;
  courseDescription: string;
  courseSteps: any[];
  courseRate: number;
}

interface DBCourse extends RowDataPacket {
  id: number;
  course_name: string;
  is_recommend: number;
  course_author: string;
  publish_date: string;
  course_views: number;
  course_description: string;
  course_steps: string;
  course_rate: number;
}

router.get("/courses", async (req: Request, res: Response) => {
  try {
    const response: CourseResponse[] = [];
    const result = await query<DBCourse[]>(QUERY_TABLE("course_list"));

    result.forEach((item: RowDataPacket) => {
      const { id, course_name, is_recommend } = item;
      response.push({
        id,
        courseName: course_name,
        isRecommend: is_recommend,
      });
    });

    res.json(parse(response));
  } catch (error) {
    console.error("获取课程列表错误:", error);
    res.status(500).json({
      code: 500,
      message: "获取课程列表失败",
    });
  }
});

router.get(
  "/courses/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { id } = req.params;
      const result = await query<DBCourse[]>(
        `SELECT * FROM course_list WHERE id = ?`,
        [id]
      );

      if (result.length === 0) {
        return res.status(404).json({
          code: 404,
          message: "课程不存在",
        });
      }

      const course = result[0];
      const {
        course_author,
        publish_date,
        course_views,
        course_description,
        course_steps,
        course_rate,
      } = course;
      const date = new Date(Number(publish_date));
      const year = date.getFullYear();
      const month = date.getUTCMonth() + 1;
      const day = date.getDate();

      const response: CourseDetailResponse = {
        id: Number(id),
        courseAuthor: course_author,
        publishDate: `${year}.${month}.${day}`,
        courseViews: course_views,
        courseDescription: course_description,
        courseSteps: JSON.parse(course_steps),
        courseRate: course_rate,
      };

      res.json({
        code: 200,
        data: response,
      });
    } catch (error) {
      console.error("获取课程详情错误:", error);
      res.status(500).json({
        code: 500,
        message: "获取课程详情失败",
      });
    }
  }
);

router.put(
  "/courses",
  async (req: Request<{}, {}, { value: string[] }>, res: Response) => {
    try {
      const [course_cid, course_name, is_recommend] = req.body.value;
      const data = {
        course_cid,
        course_name,
        is_recommend,
      };
      await query(INSERT_TABLE("course_list"), [data]);
      const result = await query(QUERY_TABLE("course_list"));
      res.json({
        code: 200,
        data: result,
      });
    } catch (error) {
      console.error("添加课程错误:", error);
      res.status(500).json({
        code: 500,
        message: "添加课程失败",
      });
    }
  }
);

export default router;
