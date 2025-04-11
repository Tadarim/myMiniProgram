import React, { lazy } from "react";
import ErrorPage from "@components/ErrorPage";
import LoginPage from "../layout/components/Login";
import App, { authLoader } from "../App";
import { createBrowserRouter, Navigate } from "react-router-dom";
import {
  DashboardOutlined,
  EditOutlined,
  TableOutlined,
  BarsOutlined,
} from "@ant-design/icons";

const Dashboard = lazy(() => import("../pages/ChooseCoursePage"));
const UserPage = lazy(() => import("../pages/UserPage"));
const CoursePage = lazy(() => import("../pages/CoursePage"));
const ChooseCoursePage = lazy(() => import("../pages/ChooseCoursePage"));

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
            title: "用户管理页",
            icon: <EditOutlined />,
            element: <UserPage />,
          },
          {
            path: "course",
            title: "课程管理页",
            icon: <TableOutlined />,
            element: <CoursePage />,
          },
          {
            path: "chooseCourse",
            title: "选课情况",
            icon: <BarsOutlined />,
            element: <ChooseCoursePage />,
          },
          // {
          //   path: "account",
          //   title: "个人页",
          //   icon: <UserOutlined />,
          //   children: [
          //     {
          //       path: "/account/center",
          //       title: "个人中心",
          //       element: <AccountCenter />,
          //     },
          //     {
          //       path: "/account/settings",
          //       title: "个人设置",
          //       element: <AccountSettings />,
          //     },
          //   ],
          // },
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
