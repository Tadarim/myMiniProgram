import React, { useRef, useState, useEffect } from "react";
import { ProTable, ProColumns, ActionType } from "@ant-design/pro-components";
import { Button, message, Popconfirm, Modal, Space, Avatar, Tag } from "antd";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import {
  PostItem,
  getPosts,
  deletePost,
  togglePostStatus,
} from "../../api/post";

interface Attachment {
  url: string;
  type: string;
  name: string;
}

const PostManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [loading, setLoading] = useState<boolean>(false);
  const [allPosts, setAllPosts] = useState<PostItem[]>([]);
  const [isPreviewModalVisible, setIsPreviewModalVisible] =
    useState<boolean>(false);
  const [currentPost, setCurrentPost] = useState<PostItem | undefined>(
    undefined
  );

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await getPosts({
        current: 1,
        pageSize: 1000,
      });
      if (response.success && response.data) {
        setAllPosts(response.data);
      }
    } catch (error) {
      message.error("获取帖子列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (params: any) => {
    try {
      let filteredData = [...allPosts];

      if (params.content) {
        filteredData = filteredData.filter((item) =>
          item.content.toLowerCase().includes(params.content.toLowerCase())
        );
      }

      if (params.username) {
        filteredData = filteredData.filter((item) =>
          item.username.toLowerCase().includes(params.username.toLowerCase())
        );
      }

      if (params.type) {
        filteredData = filteredData.filter((item) => item.type === params.type);
      }

      if (params.tags) {
        filteredData = filteredData.filter((item) => {
          if (!item.tags) return false;
          const postTags = item.tags
            .split(",")
            .map((tag: string) => tag.trim().toLowerCase());
          const searchTags = params.tags
            .split(",")
            .map((tag: string) => tag.trim().toLowerCase());
          return searchTags.some((tag: string) => postTags.includes(tag));
        });
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

  const getFileIcon = (fileType: string): string => {
    if (fileType === "image") return "🖼️";
    if (fileType === "pdf") return "📄";
    if (fileType === "doc" || fileType === "docx") return "📝";
    if (fileType === "xls" || fileType === "xlsx") return "📊";
    if (fileType === "ppt" || fileType === "pptx") return "📑";
    if (fileType === "video") return "🎥";
    if (fileType === "audio") return "🎵";
    if (fileType === "zip" || fileType === "rar") return "📦";
    return "📎";
  };

  const columns: ProColumns<PostItem>[] = [
    { title: "ID", dataIndex: "id", key: "id", width: 80, search: false },
    {
      title: "作者",
      dataIndex: "username",
      key: "username",
      width: 120,
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} size="small" />
          {record.username}
        </Space>
      ),
    },
    {
      title: "内容",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
      render: (_, record) => {
        const attachments = Array.isArray(record.attachments)
          ? record.attachments
          : JSON.parse(record.attachments || "[]");

        return (
          <div>
            <div
              style={{
                marginBottom: attachments.length > 0 ? 8 : 0,
              }}
            >
              {record.content}
            </div>
            {attachments.length > 0 && (
              <div style={{ display: "flex", gap: 4 }}>
                {attachments.slice(0, 3).map((file: Attachment, idx: number) =>
                  file.type === "image" ? (
                    <img
                      key={idx}
                      src={file.url}
                      alt={file.name}
                      style={{
                        width: 40,
                        height: 40,
                        objectFit: "cover",
                        borderRadius: 4,
                        border: "1px solid #eee",
                      }}
                    />
                  ) : (
                    <div
                      key={idx}
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
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        padding: "0 4px",
                      }}
                      title={file.name}
                    >
                      {file.name?.split(".").pop()?.toUpperCase() || "FILE"}
                    </div>
                  )
                )}
                {attachments.length > 3 && (
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
                    +{attachments.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "标签",
      dataIndex: "tags",
      key: "tags",
      width: 200,
      search: {
        transform: (value: string) => ({ tags: value }),
      },
      render: (_, record) => {
        if (!record.tags) return null;
        return (
          <Space size={[0, 4]} wrap>
            {record.tags.split(",").map((tag) => (
              <Tag key={tag} color="blue">
                {tag}
              </Tag>
            ))}
          </Space>
        );
      },
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
      search: false,
      filters: true,
      onFilter: true,
    },
    {
      title: "发布时间",
      dataIndex: "created_at",
      key: "created_at",
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
              try {
                const newStatus = await togglePostStatus(record);
                message.success(
                  `状态已切换为 ${newStatus === "public" ? "公开" : "私密"}`
                );
                await fetchPosts();
                actionRef.current?.reload();
              } catch (error) {
                message.error(
                  error instanceof Error ? error.message : "状态切换失败"
                );
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
              try {
                await deletePost(record.id);
                message.success("删除成功");
                await fetchPosts();
                actionRef.current?.reload();
              } catch (error) {
                message.error(
                  error instanceof Error ? error.message : "删除失败"
                );
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
        headerTitle="帖子列表"
      />

      <Modal
        title="帖子内容预览"
        open={isPreviewModalVisible}
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
              <strong>作者:</strong>{" "}
              <Space>
                <Avatar src={currentPost.avatar} size="small" />
                {currentPost.username}
              </Space>
            </p>
            <p>
              <strong>发布时间:</strong> {currentPost.created_at}
            </p>
            <p>
              <strong>更新时间:</strong> {currentPost.updated_at}
            </p>
            <p>
              <strong>状态:</strong>{" "}
              {currentPost.status === "public" ? "公开" : "私密"}
            </p>
            <p>
              <strong>标签:</strong>{" "}
              <Space size={[0, 4]} wrap>
                {currentPost.tags.split(",").map((tag) => (
                  <Tag key={tag} color="blue">
                    {tag}
                  </Tag>
                ))}
              </Space>
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
            {currentPost.attachments && (
              <div style={{ marginTop: 16 }}>
                <strong>附件：</strong>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 8,
                  }}
                >
                  {(Array.isArray(currentPost.attachments)
                    ? currentPost.attachments
                    : JSON.parse(currentPost.attachments || "[]")
                  ).map((file: Attachment, idx: number) =>
                    file.type === "image" ? (
                      <img
                        key={idx}
                        src={file.url}
                        alt={file.name}
                        style={{
                          width: 100,
                          height: 100,
                          objectFit: "cover",
                          borderRadius: 4,
                          border: "1px solid #eee",
                        }}
                      />
                    ) : (
                      <a
                        key={idx}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 100,
                          height: 100,
                          background: "#f0f0f0",
                          borderRadius: 4,
                          border: "1px solid #eee",
                          textDecoration: "none",
                          color: "#666",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontSize: 24, marginBottom: 4 }}>
                          {getFileIcon(file.type)}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            width: "100%",
                          }}
                          title={file.name}
                        >
                          {file.name || "未命名文件"}
                        </div>
                      </a>
                    )
                  )}
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
