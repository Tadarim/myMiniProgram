import React, { lazy } from "react";
import ErrorPage from "@components/ErrorPage";
import LoginPage from "../layout/components/Login";
import App, { authLoader } from "../App";
import { createBrowserRouter, Navigate } from "react-router-dom";
import {
  DashboardOutlined,
  EditOutlined,
  TableOutlined,
  MessageOutlined, // 帖子图标
  ReadOutlined, // <--- 新增：习题图标
} from "@ant-design/icons";

// 修改：将 Dashboard 指向新的 DashboardPage
const Dashboard = lazy(() => import("../pages/DashboardPage")); // <--- 修改此行
const UserPage = lazy(() => import("../pages/UserPage"));
const CoursePage = lazy(() => import("../pages/CoursePage"));
const PostPage = lazy(() => import("../pages/PostPage"));
// --- 新增懒加载组件 ---
const ExercisePage = lazy(() => import("../pages/ExercisePage")); // <--- 新增：习题管理页

const routes = [
  {
    path: "/",
    element: <App />,
    loader: authLoader,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          {
            index: true,
            title: "Dashboard",
            icon: <DashboardOutlined />,
            element: <Dashboard />,
          },
          {
            path: "user",
            title: "用户管理", // 统一名称
            icon: <EditOutlined />,
            element: <UserPage />,
          },
          {
            path: "course",
            title: "课程管理", // 统一名称
            icon: <TableOutlined />,
            element: <CoursePage />,
          },
          {
            path: "post",
            title: "帖子管理",
            icon: <MessageOutlined />,
            element: <PostPage />,
          },
          // --- 新增习题管理路由 ---
          {
            path: "exercise", // 路由路径
            title: "习题管理", // 菜单标题
            icon: <ReadOutlined />, // 使用习题图标
            element: <ExercisePage />, // 使用懒加载的组件
          },
          {
            path: "*",
            element: <Navigate to="/" replace={true} />,
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
];

export { routes };

export default createBrowserRouter(routes);
