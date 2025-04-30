import { Router } from "express";

import { getQiniuToken, uploadMaterial } from "../controllers/upload";

const router = Router();

router.post("/", uploadMaterial);

router.get("/qiniu-token", getQiniuToken);

export default router;
