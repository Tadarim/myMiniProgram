import express, { Request, Response } from "express";
import { query } from "../../utils/query";
import { INSERT_TABLE } from "../../utils/sql";
import wxConfig from "../../config/wx_config";
import axios from "axios";

const router = express.Router();

router.post(
  "/login",
  async (req: Request<{}, {}, { code: string }>, res: Response) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({
          code: 400,
          message: "缺少code参数",
        });
      }

      const { data: wxResponse } = await axios.get(
        `https://api.weixin.qq.com/sns/jscode2session?appid=${process.env.WECHAT_APP_ID}&secret=${process.env.WECHAT_APP_SECRET}&js_code=${code}&grant_type=authorization_code`
      );

      if (wxResponse.errcode) {
        return res.status(400).json({
          code: 400,
          message: "登录失败",
          error: wxResponse,
        });
      }

      const { openid, session_key } = wxResponse;
      const studentId = await query(INSERT_TABLE("student"), [
        {
          openid,
          session_key,
        },
      ]);

      res.json({
        code: 200,
        data: {
          openid,
          studentId:
            Array.isArray(studentId) && studentId[0]
              ? studentId[0].insertId
              : null,
        },
      });
    } catch (error) {
      console.error("登录错误:", error);
      res.status(500).json({
        code: 500,
        message: "登录失败",
        error,
      });
    }
  }
);

export default router;
