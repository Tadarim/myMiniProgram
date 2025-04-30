import express, { Request, Response } from "express";
import { query } from "../../utils/query";
import {
  QUERY_TABLE,
  INSERT_TABLE,
  UPDATE_TABLE,
  DELETE_TABLE,
} from "../../utils/sql";
import { parse } from "../../utils/parse";
import computeTimeAgo from "../../utils/computeTimeAgo";
import { RowDataPacket } from "mysql2";

const router = express.Router();

interface ForumPost {
  forumId: number;
  forumAvatar: string;
  forumAuthor: string;
  publishTime: string;
  timeAgo: string;
  forumImage: string;
  forumTitle: string;
  forumContent: string;
  forumLike: number;
  forumComment: number;
}

interface CreateForumRequest {
  forumAuthor: string;
  forumAvatar: string;
  forumTitle: string;
  forumContent: string;
}

interface UpdateForumRequest {
  forumTitle: string;
  forumContent: string;
}

interface DBForum extends RowDataPacket {
  forum_id: number;
  forum_avatar: string;
  forum_author: string;
  publish_time: string;
  forum_image: string;
  forum_title: string;
  forum_content: string;
  forum_like: number;
  forum_comment: number;
}

const formatTimeAgo = (days: number): string => {
  if (days < 1) return "今天";
  if (days < 30) return `${days}天前`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months}个月前`;
  }
  const years = Math.floor(days / 365);
  return `${years}年前`;
};

router.get("/forums", async (req: Request, res: Response) => {
  try {
    const response: ForumPost[] = [];
    const result = await query<DBForum[]>(QUERY_TABLE("forum_list"));
    result.forEach((item) => {
      const {
        forum_id,
        forum_avatar,
        forum_author,
        publish_time,
        forum_image,
        forum_title,
        forum_content,
        forum_like,
        forum_comment,
      } = item;
      const timeAgo = formatTimeAgo(computeTimeAgo(publish_time));
      const date = new Date(Number(publish_time));
      const publishTimeString = `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`;

      response.push({
        forumId: forum_id,
        forumAvatar: forum_avatar,
        forumAuthor: forum_author,
        publishTime: publishTimeString,
        timeAgo,
        forumImage: forum_image,
        forumTitle: forum_title,
        forumContent: forum_content,
        forumLike: forum_like,
        forumComment: forum_comment,
      });
    });
    res.json(parse(response));
  } catch (error) {
    console.error("获取论坛列表错误:", error);
    res.status(500).json({
      code: 500,
      message: "获取论坛列表失败",
    });
  }
});

router.get(
  "/forums/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { id } = req.params;
      const result = await query<DBForum[]>(
        `SELECT * FROM forum_list WHERE forum_id = ?`,
        [id]
      );

      if (result.length === 0) {
        return res.status(404).json({
          code: 404,
          message: "论坛帖子不存在",
        });
      }

      const {
        forum_id,
        forum_avatar,
        forum_author,
        publish_time,
        forum_image,
        forum_title,
        forum_content,
        forum_like,
        forum_comment,
      } = result[0];
      const timeAgo = formatTimeAgo(computeTimeAgo(publish_time));
      const date = new Date(Number(publish_time));
      const publishTimeString = `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`;

      const response: ForumPost = {
        forumId: forum_id,
        forumAvatar: forum_avatar,
        forumAuthor: forum_author,
        publishTime: publishTimeString,
        timeAgo,
        forumImage: forum_image,
        forumTitle: forum_title,
        forumContent: forum_content,
        forumLike: forum_like,
        forumComment: forum_comment,
      };

      res.json(response);
    } catch (error) {
      console.error("获取论坛详情错误:", error);
      res.status(500).json({
        code: 500,
        message: "获取论坛详情失败",
      });
    }
  }
);

router.post(
  "/forums",
  async (req: Request<{}, {}, { forumAuthor: string }>, res: Response) => {
    try {
      const { forumAuthor } = req.body;
      const result = await query<DBForum[]>(
        "SELECT * FROM forum_list WHERE BINARY `forum_author` LIKE ?",
        [`%${forumAuthor}%`]
      );

      if (result.length === 0) {
        return res.status(404).json({
          code: 404,
          message: "未找到相关论坛帖子",
        });
      }

      const response: ForumPost[] = [];
      result.forEach((item) => {
        const {
          forum_id,
          forum_avatar,
          forum_author,
          publish_time,
          forum_image,
          forum_title,
          forum_content,
          forum_like,
          forum_comment,
        } = item;
        const timeAgo = formatTimeAgo(computeTimeAgo(publish_time));
        const date = new Date(Number(publish_time));
        const publishTimeString = `${date.getFullYear()}-${
          date.getMonth() + 1
        }-${date.getDate()}`;

        response.push({
          forumId: forum_id,
          forumAvatar: forum_avatar,
          forumAuthor: forum_author,
          publishTime: publishTimeString,
          timeAgo,
          forumImage: forum_image,
          forumTitle: forum_title,
          forumContent: forum_content,
          forumLike: forum_like,
          forumComment: forum_comment,
        });
      });
      res.json(parse(response));
    } catch (error) {
      console.error("搜索论坛帖子错误:", error);
      res.status(500).json({
        code: 500,
        message: "搜索论坛帖子失败",
      });
    }
  }
);

router.post(
  "/post",
  async (req: Request<{}, {}, { forumData: any }>, res: Response) => {
    try {
      const { forumData } = req.body;
      const forumRecord = {
        forum_avatar: forumData.forum_avatar,
        forum_author: forumData.forum_author,
        publish_time: Date.now(),
        forum_image: forumData.forum_image,
        forum_title: forumData.forum_title,
        forum_content: forumData.forum_content,
        forum_like: 0,
        forum_comment: 0,
      };

      const sql = INSERT_TABLE("forum");
      const result = await query(sql, [forumRecord]);

      res.json({
        code: 200,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: "发布失败",
        error,
      });
    }
  }
);

router.put(
  "/forums/:id",
  async (
    req: Request<{ id: string }, {}, UpdateForumRequest>,
    res: Response
  ) => {
    try {
      const { id } = req.params;
      const { forumTitle, forumContent } = req.body;
      await query(
        UPDATE_TABLE(
          "forum_list",
          { primaryKey: "forum_id", primaryValue: id },
          { key: "forum_title", value: forumTitle }
        )
      );
      await query(
        UPDATE_TABLE(
          "forum_list",
          { primaryKey: "forum_id", primaryValue: id },
          { key: "forum_content", value: forumContent }
        )
      );
      res.json({
        code: 200,
        message: "修改成功",
      });
    } catch (error) {
      console.error("修改论坛帖子错误:", error);
      res.status(500).json({
        code: 500,
        message: "修改论坛帖子失败",
      });
    }
  }
);

router.delete(
  "/forums/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { id } = req.params;
      await query(
        DELETE_TABLE("forum_list", { primaryKey: "forum_id", primaryValue: id })
      );
      res.json({
        code: 200,
        message: "删除成功",
      });
    } catch (error) {
      console.error("删除论坛帖子错误:", error);
      res.status(500).json({
        code: 500,
        message: "删除论坛帖子失败",
      });
    }
  }
);

export default router;
