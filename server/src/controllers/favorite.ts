import { Request, Response } from "express";
import { pool } from "../utils/pool";
import { RowDataPacket } from "mysql2";

// 获取用户的收藏列表
export const getFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { type } = req.query;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    let query = `
      SELECT f.*
      FROM favorites f
      WHERE f.user_id = ?
    `;
    const params: any[] = [userId];

    if (type) {
      query += " AND f.target_type = ?";
      params.push(type);
    }

    query += " ORDER BY f.created_at DESC";

    const [favorites] = await pool.query<RowDataPacket[]>(query, params);

    // 获取收藏项的详细信息
    const detailedFavorites = await Promise.all(
      favorites.map(async (favorite) => {
        let detailQuery = "";
        switch (favorite.target_type) {
          case "course":
            detailQuery = `SELECT * FROM courses WHERE id = ?`;
            break;
          case "exercise":
            detailQuery = `SELECT * FROM exercise_sets WHERE id = ?`;
            break;
          case "post":
            detailQuery = `SELECT * FROM posts WHERE id = ?`;
            break;
        }

        const [details] = await pool.query<RowDataPacket[]>(detailQuery, [favorite.target_id]);
        return {
          ...favorite,
          details: details[0] ? details[0] : null,
        };
      })
    );

    res.json({
      code: 200,
      success: true,
      data: detailedFavorites,
    });
  } catch (error) {
    console.error("获取收藏列表失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 添加收藏
export const addFavorite = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { targetId, targetType } = req.body;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    const [result] = await pool.query(
      "INSERT INTO favorites (user_id, target_id, target_type) VALUES (?, ?, ?)",
      [userId, targetId, targetType]
    );

    res.json({
      code: 200,
      success: true,
      message: "收藏成功",
      data: { id: (result as any).insertId },
    });
  } catch (error) {
    console.error("添加收藏失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 取消收藏
export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { targetId, targetType } = req.params;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    await pool.query(
      "DELETE FROM favorites WHERE user_id = ? AND target_id = ? AND target_type = ?",
      [userId, targetId, targetType]
    );

    res.json({
      code: 200,
      success: true,
      message: "取消收藏成功",
    });
  } catch (error) {
    console.error("取消收藏失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
};

// 更新收藏标签
export const updateFavoriteTags = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { favoriteId } = req.params;
    const { tagIds } = req.body;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "请先登录",
      });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 验证收藏是否属于当前用户
      const [favorites] = await connection.query<RowDataPacket[]>(
        "SELECT id FROM favorites WHERE id = ? AND user_id = ?",
        [favoriteId, userId]
      );

      if (!favorites.length) {
        throw new Error("收藏不存在或无权操作");
      }

      // 删除现有标签
      await connection.query(
        "DELETE FROM favorite_tag_relations WHERE favorite_id = ?",
        [favoriteId]
      );

      // 添加新标签
      if (tagIds && tagIds.length > 0) {
        const tagValues = tagIds.map((tagId: number) => [favoriteId, tagId]);
        await connection.query(
          "INSERT INTO favorite_tag_relations (favorite_id, tag_id) VALUES ?",
          [tagValues]
        );

        // 获取标签名称并更新 tag_count
        const [tags] = await connection.query<RowDataPacket[]>(
          "SELECT name FROM tags WHERE id IN (?)",
          [tagIds]
        );
        
        for (const tag of tags) {
          await connection.query(
            `INSERT INTO tag_count (user_id, tag_name, count) VALUES (?, ?, 1)
             ON DUPLICATE KEY UPDATE count = count + 1`,
            [userId, tag.name]
          );
        }
      }

      await connection.commit();

      res.json({
        code: 200,
        success: true,
        message: "更新标签成功",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("更新收藏标签失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: error instanceof Error ? error.message : "服务器错误",
    });
  }
};

// 获取所有标签
export const getTags = async (req: Request, res: Response) => {
  try {
    const [tags] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM favorite_tags ORDER BY name"
    );

    res.json({
      code: 200,
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error("获取标签列表失败:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "服务器错误",
    });
  }
}; 