import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import path from "path";
import http from "http";
import { WebSocketServer } from "ws";
import {
  verifyTokenMiddleware,
  setUserFromToken,
} from "./middleware/verifyToken";

import clientServer from "./routes/client";
import adminServer from "./routes/admin";
import userServer from "./routes/user";
import courseServer from "./routes/course";
import uploadRouter from "./routes/upload";
import scheduleRoutes from "./routes/schedule";
import exerciseRoutes from "./routes/exercise";
const app = express();

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

app.use(verifyTokenMiddleware());
app.use(setUserFromToken);

app.use("/api/admin", adminServer);
app.use("/api/client", clientServer);
app.use("/api/course", courseServer);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/upload", uploadRouter);
app.use("/api/user", userServer);
app.use("/api/exercise", exerciseRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
