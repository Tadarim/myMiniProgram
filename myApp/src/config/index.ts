// 开发环境
const DEV_API_BASE_URL = 'http://localhost:3000/api';

// 生产环境
const PROD_API_BASE_URL = 'https://api.yourdomain.com/api';

// 根据环境选择API地址
export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? PROD_API_BASE_URL
  : DEV_API_BASE_URL;

// 其他配置
export const APP_NAME = '健身助手';
export const APP_VERSION = '1.0.0';
