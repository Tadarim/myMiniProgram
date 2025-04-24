import React from "react";
import { Avatar, Dropdown, MenuProps, Space } from "antd";
import { useLoginStore } from "@stores/index";

const RightContent: React.FC = () => {
  const { setUserInfo } = useLoginStore();
  const logoutHandle = () => {
    setUserInfo(null);
  };
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: <span onClick={logoutHandle}>退出登录</span>,
    },
    {
      key: "2",
      label: "个人中心",
    },
  ];

  return (
    <Space size={20}>
      <Dropdown menu={{ items }} placement="bottomRight">
        <Avatar
          src="https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png"
          style={{ cursor: "pointer" }}
        />
      </Dropdown>
    </Space>
  );
};

export default RightContent;
