interface MySQLConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
  charset: string;
}

const config: MySQLConfig = {
  host: "localhost",
  user: "root",
  password: "xuxinyu1234",
  database: "learning_system",
  port: 3306,
  charset: "utf8mb4", // 支持emoji存储
};

export default config;
