import express, { Request, Response } from "express";
import { query } from "../../utils/query";
import { QUERY_TABLE } from "../../utils/sql";
import { parse } from "../../utils/parse";
import formatTime from "../../utils/formatTime";
import { RowDataPacket } from "mysql2";

const router = express.Router();

interface Contact {
  title: string;
  avatar: string;
  contactsId: string;
  latestMessage: {
    userName: string;
    message: string;
    currentTime: string;
  } | null;
}

interface ChatMessage {
  to: string;
  userName: string;
  userAvatar: string;
  currentTime: string;
  message: string;
  messageId: string;
  openid: string;
}

interface ContactItem extends RowDataPacket {
  title: string;
  avatar: string;
  contacts_id: string;
}

interface ChatLogItem extends RowDataPacket {
  user_name: string;
  message: string;
  current_time: string;
  to: string;
  user_avatar: string;
  message_id: string;
  openid: string;
}

router.get("/contacts", async (req: Request, res: Response) => {
  try {
    const response: Contact[] = [];
    const result = await query<ContactItem[]>(QUERY_TABLE("contacts_list"));

    await Promise.all(
      result.map(async (item) => {
        const { title, avatar, contacts_id } = item;
        const chatlog = await query<ChatLogItem[]>(
          `SELECT * FROM chatlog WHERE room_name = ? ORDER BY current_time DESC`,
          [contacts_id]
        );
        const latestMessage = chatlog[chatlog.length - 1];

        if (latestMessage) {
          const { user_name, message, current_time } = latestMessage;
          response.push({
            title,
            avatar,
            contactsId: contacts_id,
            latestMessage: {
              userName: user_name,
              message,
              currentTime: formatTime(current_time),
            },
          });
        } else {
          response.push({
            title,
            avatar,
            contactsId: contacts_id,
            latestMessage: null,
          });
        }
      })
    );

    res.json({
      code: 200,
      data: response,
    });
  } catch (error) {
    console.error("获取联系人列表错误:", error);
    res.status(500).json({
      code: 500,
      message: "获取联系人列表失败",
    });
  }
});

router.get(
  "/chatlog",
  async (req: Request<{}, {}, {}, { roomName: string }>, res: Response) => {
    try {
      const { roomName } = req.query;
      const result = await query<ChatLogItem[]>(
        `SELECT * FROM chatlog WHERE room_name = ? ORDER BY current_time ASC`,
        [roomName]
      );

      const response: ChatMessage[] = result.map((item) => {
        const {
          to,
          user_name,
          user_avatar,
          current_time,
          message,
          message_id,
          openid,
        } = item;

        return {
          to,
          userName: user_name,
          userAvatar: user_avatar,
          currentTime: formatTime(current_time),
          message,
          messageId: message_id,
          openid,
        };
      });

      res.json({
        code: 200,
        data: response,
      });
    } catch (error) {
      console.error("获取聊天记录错误:", error);
      res.status(500).json({
        code: 500,
        message: "获取聊天记录失败",
      });
    }
  }
);

export default router;
