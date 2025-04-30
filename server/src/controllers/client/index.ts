import { Router } from "express";
import course from "./course";
// import exercise from "./exercise";
// import chatroom from "./chatroom";
// import forum from "./forum";
// import websocket from "./socket";
// import login from "./login";
// import upload from "./upload";

const router = Router();

// 注册路由
// router.use("/login", login);
router.use("/course", course);
// router.use("/exercise", exercise);
// router.use("/chatroom", chatroom);
// router.use("/forum", forum);
// router.use("/websocket", websocket);
// router.use("/upload", upload);

export default router;
