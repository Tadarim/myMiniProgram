import React from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  LoginFormPage,
  ProFormCheckbox,
  ProFormText,
} from "@ant-design/pro-components";
import { message } from "antd";
import useLoginStore from "@stores/login";
import { adminLogin } from "@api/login";

const Login = () => {
  const { setUserInfo, setToken } = useLoginStore();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      const { success, message: resMessage, data } = await adminLogin(values);

      if (success) {
        message.success("登录成功🎉🎉🎉");
        if (data) {
          setUserInfo(data.userInfo);
          setToken(data.token);
          navigate("/", { replace: true });
        }
      } else {
        message.error(resMessage || "登录失败");
      }
    } catch (error) {
      message.error("登录失败，请稍后重试");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        height: "100vh",
      }}
    >
      <LoginFormPage
        backgroundImageUrl="https://gw.alipayobjects.com/zos/rmsportal/FfdJeJRQWjEeGTpqgBKj.png"
        onFinish={onFinish}
        title="admin"
        subTitle="后台管理系统"
        activityConfig={{
          style: {
            boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.2)",
            color: "#fff",
            borderRadius: 8,
            backgroundColor: "#1677FF",
          },
        }}
      >
        <ProFormText
          name="username"
          fieldProps={{
            size: "large",
            prefix: <UserOutlined className={"prefixIcon"} />,
          }}
          placeholder={"用户名: admin 或 superadmin"}
          rules={[
            {
              required: true,
              message: "请输入用户名!",
            },
          ]}
        />
        <ProFormText.Password
          name="password"
          fieldProps={{
            size: "large",
            prefix: <LockOutlined className={"prefixIcon"} />,
          }}
          placeholder={"密码: admin123 或 superadmin123"}
          rules={[
            {
              required: true,
              message: "请输入密码！",
            },
          ]}
        />
        <div
          style={{
            marginBlockEnd: 24,
          }}
        >
          <ProFormCheckbox noStyle name="autoLogin">
            自动登录
          </ProFormCheckbox>
        </div>
      </LoginFormPage>
    </div>
  );
};

export default Login;
