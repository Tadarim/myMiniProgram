import React, { useRef, useState } from "react";
import { ProTable, ProColumns, ActionType } from "@ant-design/pro-components";
import { Button, message, Popconfirm, Modal, Space } from "antd";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";

export const waitTimePromise = async (time = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export const waitTime = async (time = 100) => {
  await waitTimePromise(time);
};

interface PostItem {
  id: number;
  author: string;
  content: string;
  createdAt: string;
  status: "public" | "private";
  images?: string[];
}

const mockPosts: PostItem[] = [
  {
    id: 1,
    author: "用户A",
    content:
      "这是第一条帖子，内容可能比较长，需要预览才能看到全部。这里省略了很多字...",
    createdAt: "2023-10-27 10:00:00",
    status: "public",
    images: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
    ],
  },
  {
    id: 2,
    author: "用户B",
    content: "今天天气不错，适合出去玩。这条是私密状态。",
    createdAt: "2023-10-26 15:30:00",
    status: "private",
    images: [],
  },
  {
    id: 3,
    author: "用户C",
    content: "需要审核的帖子内容。",
    createdAt: "2023-10-28 09:00:00",
    status: "private",
    images: ["https://images.unsplash.com/photo-1519125323398-675f0ddb6308"],
  },
];

const fetchPosts = async (params) => {
  console.log("Fetching posts with params:", params);
  await waitTime(500);

  let filteredData = [...mockPosts];
  if (params.content) {
    filteredData = filteredData.filter((post) =>
      post.content.includes(params.content)
    );
  }
  if (params.author) {
    filteredData = filteredData.filter((post) =>
      post.author.includes(params.author)
    );
  }

  if (params.status) {
    filteredData = filteredData.filter((post) => post.status === params.status);
  }

  return { data: filteredData, success: true, total: filteredData.length };
};

const handleDeletePost = async (id: number) => {
  console.log(`Deleting post with id: ${id}`);
  await waitTime(500);

  const index = mockPosts.findIndex((item) => item.id === id);
  if (index > -1) {
    mockPosts.splice(index, 1);
  }

  message.success("删除成功");
  return true;
};

const handleToggleStatus = async (post: PostItem) => {
  const newStatus = post.status === "public" ? "private" : "public";
  console.log(`Toggling status for post ${post.id} to ${newStatus}`);
  await waitTime(300);

  const index = mockPosts.findIndex((item) => item.id === post.id);
  if (index > -1) {
    mockPosts[index].status = newStatus;
  }

  message.success(`状态已切换为 ${newStatus === "public" ? "公开" : "私密"}`);
  return true;
};

const PostManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const [isPreviewModalVisible, setIsPreviewModalVisible] =
    useState<boolean>(false);
  const [currentPost, setCurrentPost] = useState<PostItem | undefined>(
    undefined
  );

  const columns: ProColumns<PostItem>[] = [
    { title: "ID", dataIndex: "id", key: "id", width: 80, search: false },
    { title: "作者", dataIndex: "author", key: "author", width: 120 },
    {
      title: "内容",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
      render: (_, record) => (
        <div>
          <div
            style={{
              marginBottom: record.images && record.images.length > 0 ? 8 : 0,
            }}
          >
            {record.content}
          </div>
          {record.images && record.images.length > 0 && (
            <div style={{ display: "flex", gap: 4 }}>
              {record.images.slice(0, 3).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`图片${idx + 1}`}
                  style={{
                    width: 40,
                    height: 40,
                    objectFit: "cover",
                    borderRadius: 4,
                    border: "1px solid #eee",
                  }}
                />
              ))}
              {record.images.length > 3 && (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f0f0f0",
                    borderRadius: 4,
                    border: "1px solid #eee",
                    fontSize: 12,
                    color: "#666",
                  }}
                >
                  +{record.images.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      valueEnum: {
        public: { text: "公开", status: "Success" },
        private: { text: "私密", status: "Default" },
      },
      filters: true,
      onFilter: true,
    },
    {
      title: "发布时间",
      dataIndex: "createdAt",
      key: "createdAt",
      valueType: "dateTime",
      width: 180,
      search: false,
      sorter: true,
    },
    {
      title: "操作",
      key: "action",
      search: false,
      width: 200,
      render: (_, record) => (
        <Space
          size={0}
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setCurrentPost(record);
              setIsPreviewModalVisible(true);
            }}
          >
            预览
          </Button>
          <Popconfirm
            title={`确定要将此帖子切换为 "${
              record.status === "public" ? "私密" : "公开"
            }" 状态吗?`}
            onConfirm={async () => {
              const success = await handleToggleStatus(record);
              if (success && actionRef.current) {
                actionRef.current.reload(); // 成功后刷新表格
              }
            }}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link">
              {record.status === "public" ? "设为私密" : "设为公开"}
            </Button>
          </Popconfirm>
          <Popconfirm
            title="确定删除这条帖子吗？"
            onConfirm={async () => {
              const success = await handleDeletePost(record.id);
              if (success && actionRef.current) {
                actionRef.current.reload(); // 删除成功后刷新表格
              }
            }}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<PostItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={fetchPosts}
        editable={false}
        rowKey="id"
        search={{
          labelWidth: "auto",
        }}
        headerTitle="帖子列表"
      />

      <Modal
        title="帖子内容预览"
        visible={isPreviewModalVisible}
        onCancel={() => setIsPreviewModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        {currentPost && (
          <div>
            <p>
              <strong>ID:</strong> {currentPost.id}
            </p>
            <p>
              <strong>作者:</strong> {currentPost.author}
            </p>
            <p>
              <strong>发布时间:</strong> {currentPost.createdAt}
            </p>
            <p>
              <strong>状态:</strong>{" "}
              {currentPost.status === "public" ? "公开" : "私密"}
            </p>
            <p>
              <strong>内容:</strong>
            </p>
            <div
              style={{
                maxHeight: "400px",
                overflowY: "auto",
                padding: "10px",
                border: "1px solid #f0f0f0",
                background: "#fafafa",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
              }}
            >
              {currentPost.content}
            </div>
            {currentPost.images && currentPost.images.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <strong>图片：</strong>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 8,
                  }}
                >
                  {currentPost.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`帖子图片${idx + 1}`}
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        borderRadius: 4,
                        border: "1px solid #eee",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default PostManagementPage;
