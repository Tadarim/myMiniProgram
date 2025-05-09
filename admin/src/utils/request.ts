import axios from "axios";
import { message } from "antd";

const request = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const token = userInfo.state?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // 清除登录状态
      localStorage.removeItem("userInfo");
      // 跳转到登录页
      window.location.href = "/login";
      message.error("登录已过期，请重新登录");
    } else {
      message.error(
        error.response?.data?.message || error.message || "请求失败"
      );
    }
    return Promise.reject(error);
  }
);

export default request;
