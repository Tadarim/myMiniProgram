import React, { useRef, useState, useEffect } from "react";
import { ProTable, ProColumns, ActionType } from "@ant-design/pro-components";
import { Button, message, Avatar, Space, Badge } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

interface ChatItem {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
}

const ChatPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [chatList, setChatList] = useState<ChatItem[]>([]);

  useEffect(() => {
    fetchChatList();
  }, []);

  const fetchChatList = async () => {
    setLoading(true);
    try {
      // TODO: 从后端获取聊天列表
      const mockData: ChatItem[] = [
        {
          id: 1,
          name: "张三",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
          lastMessage: "你好，请问有什么可以帮你的吗？",
          lastTime: "10:30",
          unreadCount: 2,
        },
        {
          id: 2,
          name: "李四",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
          lastMessage: "好的，我明白了",
          lastTime: "昨天",
          unreadCount: 0,
        },
      ];
      setChatList(mockData);
    } catch (error) {
      message.error("获取聊天列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (params: any) => {
    try {
      let filteredData = [...chatList];

      if (params.name) {
        filteredData = filteredData.filter((item) =>
          item.name.toLowerCase().includes(params.name.toLowerCase())
        );
      }

      return {
        data: filteredData,
        success: true,
        total: filteredData.length,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  const columns: ProColumns<ChatItem>[] = [
    {
      title: "头像",
      dataIndex: "avatar",
      key: "avatar",
      width: 80,
      search: false,
      render: (_, record) => (
        <Badge count={record.unreadCount} offset={[-5, 5]}>
          <Avatar src={record.avatar} size={40} />
        </Badge>
      ),
    },
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      width: 120,
    },
    {
      title: "最后消息",
      dataIndex: "lastMessage",
      key: "lastMessage",
      ellipsis: true,
      search: false,
    },
    {
      title: "时间",
      dataIndex: "lastTime",
      key: "lastTime",
      width: 100,
      search: false,
    },
    {
      title: "操作",
      key: "action",
      search: false,
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/chat/${record.id}`)}
        >
          查看
        </Button>
      ),
    },
  ];

  return (
    <ProTable<ChatItem>
      columns={columns}
      actionRef={actionRef}
      cardBordered
      loading={loading}
      request={handleSearch}
      rowKey="id"
      search={{
        labelWidth: "auto",
      }}
      pagination={{
        defaultPageSize: 10,
        showQuickJumper: true,
      }}
      headerTitle="聊天列表"
    />
  );
};

export default ChatPage; 