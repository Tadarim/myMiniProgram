import React, { lazy } from "react";
import ErrorPage from "@components/ErrorPage";
import LoginPage from "../layout/components/Login";
import App, { authLoader } from "../App";
import { createBrowserRouter, Navigate } from "react-router-dom";
import {
  DashboardOutlined,
  EditOutlined,
  TableOutlined,
  MessageOutlined,
  ReadOutlined,
} from "@ant-design/icons";

const Dashboard = lazy(() => import("../pages/DashboardPage"));
const UserPage = lazy(() => import("../pages/UserPage"));
const CoursePage = lazy(() => import("../pages/CoursePage"));
const PostPage = lazy(() => import("../pages/PostPage"));
const ExercisePage = lazy(() => import("../pages/ExercisePage"));

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
            title: "用户管理",
            icon: <EditOutlined />,
            element: <UserPage />,
          },
          {
            path: "course",
            title: "课程管理",
            icon: <TableOutlined />,
            element: <CoursePage />,
          },
          {
            path: "post",
            title: "帖子管理",
            icon: <MessageOutlined />,
            element: <PostPage />,
          },
          {
            path: "exercise",
            title: "习题管理",
            icon: <ReadOutlined />,
            element: <ExercisePage />,
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
