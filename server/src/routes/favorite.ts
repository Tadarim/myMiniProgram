import express from "express";

import * as favoriteController from "../controllers/favorite";

const router = express.Router();

// 获取收藏列表
router.get("/", favoriteController.getFavorites);

// 添加收藏
router.post("/", favoriteController.addFavorite);

// 取消收藏
router.delete("/:targetType/:targetId", favoriteController.removeFavorite);

export default router;
