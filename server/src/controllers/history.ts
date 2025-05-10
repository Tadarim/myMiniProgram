import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

// 添加历史记录
export const addHistory = async (req: Request, res: Response) => {
  const userId = req.auth?.id || req.user?.id;
  const { target_id, target_type } = req.body;
  if (!userId || !target_id || !target_type) {
    return res.status(400).json({ code: 400, message: '参数缺失' });
  }
  try {
    await pool.query(
      'INSERT IGNORE INTO history_records (user_id, target_id, target_type) VALUES (?, ?, ?)',
      [userId, target_id, target_type]
    );
    res.json({ code: 200, message: '添加历史记录成功' });
  } catch (e) {
    res.status(500).json({ code: 500, message: '添加历史记录失败', error: e });
  }
};

// 获取历史记录列表
export const getHistory = async (req: Request, res: Response) => {
  const userId = req.auth?.id || req.user?.id;
  if (!userId) {
    return res.status(401).json({ code: 401, message: '未登录' });
  }
  try {
    const [records] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM history_records WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    // 查询详情
    const detailedHistory = await Promise.all(
      records.map(async (record: any) => {
        let detailQuery = '';
        switch (record.target_type) {
          case 'course':
            detailQuery = 'SELECT * FROM courses WHERE id = ?';
            break;
          case 'exercise':
            detailQuery = 'SELECT * FROM exercise_sets WHERE id = ?';
            break;
          case 'post':
            detailQuery = 'SELECT * FROM posts WHERE id = ?';
            break;
          default:
            return null;
        }
        const [details] = await pool.query<RowDataPacket[]>(detailQuery, [record.target_id]);
        return {
          ...record,
          details: details[0] || null
        };
      })
    );
    res.json({ code: 200, data: detailedHistory });
  } catch (e) {
    res.status(500).json({ code: 500, message: '获取历史记录失败', error: e });
  }
}; 