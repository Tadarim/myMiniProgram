import pool from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const query = async <T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params: any[] = []
): Promise<T> => {
  try {
    const [rows] = await pool.query(sql, params);
    return rows as T;
  } catch (error) {
    console.error("数据库查询错误:", error);
    throw error;
  }
};

// 获取数据库连接
const getConnection = async () => {
  return await pool.getConnection();
};

export { query, getConnection };
