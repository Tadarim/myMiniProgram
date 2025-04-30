import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import path from "path";
import http from "http";
import { WebSocketServer } from "ws";
import { verifyTokenMiddleware } from "./middleware/verifyToken";

import clientServer from "./routes/client";
import adminServer from "./routes/admin";
import userServer from "./routes/user";
import courseServer from "./routes/course";
import uploadRouter from "./routes/upload";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    createParentPath: true,
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "../temp"),
    debug: true
  })
);
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// 认证中间件
app.use(verifyTokenMiddleware());

// 路由配置
app.use("/api/client", clientServer);
app.use("/api/admin", adminServer);
app.use("/api/user", userServer);
app.use("/api/course", courseServer);

// 注册路由
app.use("/api/upload", uploadRouter);

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
