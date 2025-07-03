import mysql from "mysql2/promise";

// 创建连接池
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "password",
  database: "learning_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

export default pool;

