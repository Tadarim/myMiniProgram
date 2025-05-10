import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import path from "path";
import http from "http";

import {
  verifyTokenMiddleware,
  setUserFromToken,
} from "./middleware/verifyToken";
import { initWebSocketServer } from "./services/websocket";

import clientServer from "./routes/client";
import adminServer from "./routes/admin";
import userServer from "./routes/user";
import courseServer from "./routes/course";
import uploadRouter from "./routes/upload";
import scheduleRoutes from "./routes/schedule";
import exerciseRoutes from "./routes/exercise";
import postRoutes from "./routes/post";
import chatRouter from "./routes/chat";
import favoriteRouter from "./routes/favorite";
import historyRouter from "./routes/history";
import dashboardRouter from './routes/dashboard';

const app = express();
const server = http.createServer(app);

// 初始化 WebSocket 服务器
initWebSocketServer(server);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 添加全局请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 文件上传中间件配置
const fileUploadConfig = {
  createParentPath: true,
  useTempFiles: true,
  tempFileDir: path.join(__dirname, "../temp"),
  debug: true,
};

// 先配置路由
app.use(verifyTokenMiddleware());
app.use(setUserFromToken);

// 注册所有路由
app.use("/api/admin", adminServer);
app.use("/api/client", clientServer);
app.use("/api/course", courseServer);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/favorites", favoriteRouter);
app.use("/api/history", historyRouter);
app.use('/api/dashboard', dashboardRouter);

// 添加上传路由的特殊日志
app.use("/api/chat", (req, res, next) => {
  console.log(`[Chat Router] Request: ${req.method} ${req.url}`);
  console.log(`[Chat Router] Original URL: ${req.originalUrl}`);
  next();
}, fileUpload(fileUploadConfig), chatRouter);

app.use("/api/posts", fileUpload(fileUploadConfig), postRoutes);
app.use("/api/upload", fileUpload(fileUploadConfig), uploadRouter);
app.use("/api/user", userServer);
app.use("/api/exercise", exerciseRoutes);

// 404处理
app.use((req, res) => {
  console.log(`[404] Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    code: 404,
    success: false,
    message: "接口不存在"
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
