import React, { useRef, useState } from "react"; // 引入 useState
import { ProTable, ProColumns, ActionType } from "@ant-design/pro-components";
// --- 修改：引入 Modal 和 Switch ---
import { Button, message, Popconfirm, Modal, Switch, Space } from "antd";
import {
  DeleteOutlined,
  EyeOutlined, // 引入预览图标
} from "@ant-design/icons";

// --- ADD THESE HELPER FUNCTIONS ---
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
// --- END OF ADDED FUNCTIONS ---

// 假设帖子的数据结构
interface PostItem {
  id: number;
  author: string;
  content: string;
  createdAt: string;
  status: "public" | "private"; // 添加状态字段：'public' 或 'private'
  images?: string[]; // 新增图片字段，可选
  // 其他字段...
}

// --- ADD THIS MOCK DATA ---
const mockPosts: PostItem[] = [
  {
    id: 1,
    author: "用户A",
    content:
      "这是第一条帖子，内容可能比较长，需要预览才能看到全部。这里省略了很多字...",
    createdAt: "2023-10-27 10:00:00",
    status: "public", // 示例状态
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
    status: "private", // 示例状态
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

// 模拟的帖子数据获取函数 (实际应替换为 API 调用)
const fetchPosts = async (params) => {
  console.log("Fetching posts with params:", params);
  await waitTime(500); // 模拟网络延迟
  // 在这里调用你的后端 API 获取帖子列表
  // const response = await yourApi.getPosts(params);
  // return { data: response.data, success: true, total: response.total };

  let filteredData = [...mockPosts]; // 使用更新后的 mockPosts
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
  // --- 新增：按状态筛选 (如果 ProTable 的筛选器配置了 status) ---
  if (params.status) {
    filteredData = filteredData.filter((post) => post.status === params.status);
  }
  // --- 结束新增 ---
  return { data: filteredData, success: true, total: filteredData.length };
};

// 删除帖子的函数 (实际应替换为 API 调用)
const handleDeletePost = async (id: number) => {
  console.log(`Deleting post with id: ${id}`);
  await waitTime(500); // 模拟网络延迟
  // 在这里调用你的后端 API 删除帖子
  // await yourApi.deletePost(id);
  // --- 更新 mock 数据 (仅用于前端演示) ---
  const index = mockPosts.findIndex((item) => item.id === id);
  if (index > -1) {
    mockPosts.splice(index, 1);
  }
  // --- 结束更新 ---
  message.success("删除成功");
  return true; // 返回 true 表示成功，ProTable 会刷新
};

// --- 新增：切换帖子状态的函数 (实际应替换为 API 调用) ---
const handleToggleStatus = async (post: PostItem) => {
  const newStatus = post.status === "public" ? "private" : "public";
  console.log(`Toggling status for post ${post.id} to ${newStatus}`);
  await waitTime(300); // 模拟网络延迟
  // 在这里调用你的后端 API 更新帖子状态
  // await yourApi.updatePostStatus(post.id, newStatus);
  // --- 更新 mock 数据 (仅用于前端演示) ---
  const index = mockPosts.findIndex((item) => item.id === post.id);
  if (index > -1) {
    mockPosts[index].status = newStatus;
  }
  // --- 结束更新 ---
  message.success(`状态已切换为 ${newStatus === "public" ? "公开" : "私密"}`);
  return true; // 返回 true 表示成功
};
// --- 结束新增 ---

const PostManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  // --- 新增状态 ---
  const [isPreviewModalVisible, setIsPreviewModalVisible] =
    useState<boolean>(false);
  const [currentPost, setCurrentPost] = useState<PostItem | undefined>(
    undefined
  );

  const columns: ProColumns<PostItem>[] = [
    { title: "ID", dataIndex: "id", key: "id", width: 80, search: false },
    { title: "作者", dataIndex: "author", key: "author", width: 120 },
    {
      title: "内容预览", // 修改标题
      dataIndex: "content",
      key: "content",
      ellipsis: true, // 内容过长时显示省略号
    },
    // --- 新增：状态列 ---
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      // 使用 valueEnum 提供筛选和显示文本
      valueEnum: {
        public: { text: "公开", status: "Success" }, // Success 状态会显示绿色圆点
        private: { text: "私密", status: "Default" }, // Default 状态会显示灰色圆点
      },
      // 可以添加筛选功能
      filters: true,
      onFilter: true,
    },
    // --- 结束新增 ---
    {
      title: "发布时间",
      dataIndex: "createdAt",
      key: "createdAt",
      valueType: "dateTime",
      width: 180,
      search: false,
      sorter: true, // 允许按时间排序
    },
    {
      title: "操作",
      key: "action",
      search: false,
      width: 200, // 调整宽度以容纳更多按钮
      render: (_, record) => (
        <Space size="middle">
          {" "}
          {/* 使用 Space 组件让按钮之间有间隔 */}
          {/* --- 新增：预览按钮 --- */}
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
          {/* --- 结束新增 --- */}
          {/* --- 新增：切换状态按钮 (使用 Popconfirm 包裹) --- */}
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
          {/* --- 结束新增 --- */}
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
      {/* 使用 Fragment 包裹 */}
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
        footer={null} // 不需要默认的底部按钮
        width={600} // 可以调整宽度
        destroyOnClose // 关闭时销毁 Modal 内容
      >
        {currentPost && ( // 确保 currentPost 有值再渲染
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
            {/* 为了更好地显示内容，可以给内容区域加个样式 */}
            <div
              style={{
                maxHeight: "400px",
                overflowY: "auto",
                padding: "10px",
                border: "1px solid #f0f0f0",
                background: "#fafafa",
                whiteSpace: "pre-wrap", // 保留换行和空格
                wordWrap: "break-word", // 长单词换行
              }}
            >
              {currentPost.content}
            </div>
            {/* 新增：图片展示区域 */}
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
