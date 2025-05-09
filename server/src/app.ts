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

const app = express();
const server = http.createServer(app);

// 初始化 WebSocket 服务器
initWebSocketServer(server);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/api/upload",
  fileUpload({
    createParentPath: true,
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "../temp"),
    debug: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(verifyTokenMiddleware());
app.use(setUserFromToken);

app.use("/api/admin", adminServer);
app.use("/api/client", clientServer);
app.use("/api/course", courseServer);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/upload", uploadRouter);
app.use("/api/user", userServer);
app.use("/api/exercise", exerciseRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/chat", chatRouter);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
