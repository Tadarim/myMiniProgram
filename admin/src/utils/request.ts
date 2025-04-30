import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

const request = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 10000,
});

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

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.data?.error === "token out of date") {
      // token过期，清除用户信息并跳转到登录页
      localStorage.removeItem("userInfo");
      window.location.href = "/login";
      message.error("登录已过期，请重新登录");
    } else {
      message.error(error.response?.data?.message || error.message || "请求失败");
    }
    return Promise.reject(error);
  }
);

export default request;
