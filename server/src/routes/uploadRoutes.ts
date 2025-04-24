import express from 'express';
import { uploadImage } from '../controllers/uploadController';

const router = express.Router();

// 上传图片路由
router.post('/image', uploadImage);

export default router; 