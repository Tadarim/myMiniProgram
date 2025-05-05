import { Router } from "express";
import clientRoutes from "../controllers/client/index";
import authController from "../controllers/client/auth";
import { verifyTokenMiddleware, setUserFromToken } from "../middleware/verifyToken";

const router = Router();

router.post("/auth/login", authController.login);
router.post("/auth/send-code", authController.sendVerificationCode);
router.post("/auth/reset-password", authController.resetPassword);
router.post("/auth/wechat-login", authController.wechatLogin);


router.post("/auth/update-profile", verifyTokenMiddleware(), setUserFromToken, authController.updateUserInfo);


router.use("/", clientRoutes);

export default router;
