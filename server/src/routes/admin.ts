import { Router } from "express";

import { adminLogin } from "../controllers/admin/login";

const router = Router();

// 注册路由
router.use("/login", adminLogin);

export default router;
