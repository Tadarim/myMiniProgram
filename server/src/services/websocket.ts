import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { verifyToken } from "../utils/token";

// 存储在线用户
const onlineUsers = new Map<number, WebSocket>();

export const initWebSocketServer = (server: Server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    const token = new URL(
      req.url!,
      `http://${req.headers.host}`
    ).searchParams.get("token");

    if (!token) {
      ws.close();
      return;
    }

    const payload = verifyToken(token);
    if (!payload) {
      ws.close();
      return;
    }

    const userId = payload.id;

    onlineUsers.set(userId, ws);

    ws.send(
      JSON.stringify({
        type: "status",
        data: { online: true },
      })
    );

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.type) {
          case "chat":
            const receiverWs = onlineUsers.get(data.receiverId);
            if (receiverWs) {
              receiverWs.send(
                JSON.stringify({
                  type: "chat",
                  data: {
                    senderId: userId,
                    content: data.content,
                    timestamp: new Date().toISOString(),
                  },
                })
              );
            }
            break;
        }
      } catch (error) {
        console.error("处理 WebSocket 消息失败:", error);
      }
    });

    // 处理连接关闭
    ws.on("close", () => {
      onlineUsers.delete(userId);
    });
  });

  return wss;
};

// 发送消息给指定用户
export const sendMessage = (userId: number, message: any) => {
  const ws = onlineUsers.get(userId);
  if (ws) {
    ws.send(JSON.stringify(message));
  }
};

// 广播消息给所有在线用户
export const broadcastMessage = (message: any) => {
  onlineUsers.forEach((ws) => {
    ws.send(JSON.stringify(message));
  });
};

// 获取在线用户列表
export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};
