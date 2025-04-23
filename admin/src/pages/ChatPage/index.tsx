import React, { useRef } from "react";
import { ProTable, ProColumns, ActionType } from "@ant-design/pro-components";
import { Button, message, Popconfirm, Tag } from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons"; // 使用查看和删除图标

// --- Helper Functions (waitTime) ---
export const waitTimePromise = async (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};
export const waitTime = async (time: number = 100) => {
  await waitTimePromise(time);
};
// --- End Helper Functions ---

// 假设聊天会话 (群聊或单聊) 的数据结构
interface ChatSessionItem {
  id: string; // 会话ID (可能是群ID或特定格式的单聊ID)
  name: string; // 会话名称 (群名或对方用户名)
  type: "group" | "private"; // 会话类型
  memberCount?: number; // 成员数量 (群聊)
  lastMessageTime?: string; // 最后消息时间 (可选)
  creator?: string; // 创建者 (群聊, 可选)
  createdAt: string; // 创建时间
}

// 模拟的聊天会话数据获取函数 (实际应替换为 API 调用)
const fetchChats = async (params) => {
  console.log("Fetching chat sessions with params:", params);
  await waitTime(500);
  // --- 模拟数据 ---
  const mockChats: ChatSessionItem[] = [
    {
      id: "group_1001",
      name: "React 技术交流群",
      type: "group",
      memberCount: 58,
      lastMessageTime: "2023-10-27 15:30:00",
      creator: "Admin",
      createdAt: "2023-01-15 10:00:00",
    },
    {
      id: "group_1002",
      name: "学习打卡小组",
      type: "group",
      memberCount: 12,
      creator: "用户C",
      createdAt: "2023-08-01 18:00:00",
    },
  ];
  let filteredData = mockChats;
  if (params.name) {
    filteredData = filteredData.filter((chat) =>
      chat.name.includes(params.name)
    );
  }
  // 只保留群聊
  filteredData = filteredData.filter((chat) => chat.type === "group");
  return { data: filteredData, success: true, total: filteredData.length };
  // --- 模拟数据结束 ---
};

// 删除/解散会话的函数 (实际应替换为 API 调用, 注意权限和影响)
const handleDeleteChat = async (id: string) => {
  console.log(`Deleting chat session with id: ${id}`);
  await waitTime(500);
  message.success("操作成功"); // 根据实际操作是删除还是解散
  return true;
};

// (可选) 查看聊天记录的函数或跳转

const ChatManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<ChatSessionItem>[] = [
    {
      title: "会话ID",
      dataIndex: "id",
      key: "id",
      search: false,
      ellipsis: true,
    },
    { title: "会话名称", dataIndex: "name", key: "name", ellipsis: true },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      valueEnum: {
        group: { text: "群聊" },
      },
      render: (_, record) => <Tag color={"blue"}>群聊</Tag>,
    },
    {
      title: "成员数",
      dataIndex: "memberCount",
      key: "memberCount",
      search: false,
      render: (count) => count ?? "-",
    }, // 群聊显示成员数
    {
      title: "创建者",
      dataIndex: "creator",
      key: "creator",
      search: false,
      render: (creator) => creator ?? "-",
    }, // 群聊显示创建者
    {
      title: "最后消息时间",
      dataIndex: "lastMessageTime",
      key: "lastMessageTime",
      valueType: "dateTime",
      search: false,
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      valueType: "dateTime",
      search: false,
    },
    {
      title: "操作",
      key: "action",
      search: false,
      render: (_, record) => [
        <Button key="view" type="link" icon={<EyeOutlined />}>
          查看记录
        </Button>, // 查看记录功能需要实现
        <Popconfirm
          key="delete"
          title={"确定解散该群聊吗？"}
          onConfirm={async () => {
            const success = await handleDeleteChat(record.id);
            if (success && actionRef.current) {
              actionRef.current.reload();
            }
          }}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            解散
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <ProTable<ChatSessionItem>
      columns={columns}
      actionRef={actionRef}
      cardBordered
      request={fetchChats}
      editable={false}
      rowKey="id"
      search={{
        labelWidth: "auto",
      }}
      headerTitle="聊天会话列表"
      // 聊天管理通常不需要在后台直接创建会话
      // toolBarRender={() => [ ... ]}
    />
  );
};

export default ChatManagementPage;
