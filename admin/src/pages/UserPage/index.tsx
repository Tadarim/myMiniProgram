/* eslint-disable @typescript-eslint/no-inferrable-types */
import React, { useRef, useState, useEffect } from "react";
import { ProTable, ProColumns, ActionType } from "@ant-design/pro-components";
import { Button, message, Modal, Table } from "antd";
import { ExportOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { UserItem, Gender } from "../../types/user";
import { getUserList, deleteUser } from "../../api/user";

const UserTablePage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<UserItem | undefined>(undefined);
  const [isPreviewModalVisible, setIsPreviewModalVisible] =
    useState<boolean>(false);
  const [dataToExport, setDataToExport] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [allUsers, setAllUsers] = useState<UserItem[]>([]);

  useEffect(() => {
    fetchUserList();
  }, []);

  const fetchUserList = async () => {
    setLoading(true);
    try {
      const response = await getUserList();
      if (response.data) {
        setDataToExport(response.data);
        setAllUsers(response.data);
      }
    } catch (error) {
      message.error("获取用户列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (params: any) => {
    try {
      let filteredData = [...allUsers];

      if (params.username) {
        filteredData = filteredData.filter((item) =>
          item.username.toLowerCase().includes(params.username.toLowerCase())
        );
      }

      if (params.email) {
        filteredData = filteredData.filter((item) =>
          item.email.toLowerCase().includes(params.email.toLowerCase())
        );
      }

      if (params.startTime && params.endTime) {
        filteredData = filteredData.filter((item) => {
          const createTime = new Date(item.extra.createTime).getTime();
          const startTime = new Date(params.startTime).getTime();
          const endTime = new Date(params.endTime).getTime();
          return createTime >= startTime && createTime <= endTime;
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

  const handleConfirmExport = () => {
    if (dataToExport.length === 0) {
      message.warning("没有数据可以导出");
      return;
    }
    try {
      const dataForSheet = dataToExport.map((item) => ({
        用户ID: item.id,
        用户名: item.username,
        邮箱: item.email,
        性别:
          item.extra.gender === Gender.Male
            ? "男"
            : item.extra.gender === Gender.Female
            ? "女"
            : "保密",
        描述: item.desc,
        所在地: item.extra.location.join(", "),
        学校: item.extra.school,
        最后登录: item.extra.lastLoginTime,
        创建时间: item.extra.createTime,
      }));
      const worksheet = XLSX.utils.json_to_sheet(dataForSheet);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "用户数据");

      const fileName = `用户数据导出_${new Date().toLocaleDateString()}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      message.success("数据导出成功！");
      setIsPreviewModalVisible(false);
    } catch (error) {
      console.error("导出 Excel 时出错:", error);
      message.error("导出数据失败，请检查控制台错误信息。");
    }
  };

  const columns: ProColumns<UserItem>[] = [
    {
      dataIndex: "index",
      valueType: "indexBorder",
      width: 48,
    },
    {
      title: "用户ID",
      dataIndex: "id",
      key: "id",
      sorter: true,
      copyable: true,
      ellipsis: true,
      search: false,
      width: 80,
    },
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      copyable: true,
      ellipsis: true,
      tip: "用户名过长会自动收缩",
      formItemProps: {
        rules: [
          {
            required: true,
            message: "此项为必填项",
          },
        ],
      },
    },
    {
      title: "邮箱",
      dataIndex: "email",
      copyable: true,
      ellipsis: true,
      search: {
        transform: (value) => {
          return {
            email: value,
          };
        },
      },
    },
    {
      title: "性别",
      dataIndex: "extra",
      hideInTable: true,
      search: false,
      render: (_, record) =>
        record.extra.gender === Gender.Male
          ? "男"
          : record.extra.gender === Gender.Female
          ? "女"
          : "保密",
    },
    {
      title: "描述",
      dataIndex: "desc",
      hideInTable: true,
      search: false,
    },
    {
      title: "所在地",
      dataIndex: "extra",
      hideInTable: true,
      search: false,
      render: (_, record) => record.extra.location.join(", "),
    },
    {
      title: "学校",
      dataIndex: "extra",
      hideInTable: true,
      search: false,
      render: (_, record) => record.extra.school,
    },
    {
      title: "创建时间",
      dataIndex: "extra",
      valueType: "date",
      sorter: true,
      hideInSearch: true,
      render: (_, record) => record.extra.createTime,
    },
    {
      title: "最后登录",
      dataIndex: "extra",
      valueType: "date",
      sorter: true,
      hideInSearch: true,
      render: (_, record) => record.extra.lastLoginTime,
    },
    {
      title: "创建时间范围",
      dataIndex: "extra",
      valueType: "dateRange",
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            startTime: value[0],
            endTime: value[1],
          };
        },
      },
      render: (_, record) => record.extra.createTime,
    },
    {
      title: "操作",
      valueType: "option",
      key: "option",
      render: (text, record, _, action) => [
        <a
          key="view"
          onClick={() => {
            setCurrentRow(record);
            setModalVisible(true);
          }}
        >
          查看
        </a>,
        <Button
          key="delete"
          type="link"
          danger
          onClick={() => {
            Modal.confirm({
              title: "确定要删除该用户吗？",
              content: "删除后将无法恢复，请谨慎操作！",
              okText: "确定",
              cancelText: "取消",
              onOk: async () => {
                try {
                  await deleteUser(record.id);
                  message.success("删除成功");
                  action?.reload();
                } catch (error) {
                  message.error("删除失败");
                }
              },
            });
          }}
        >
          删除
        </Button>,
      ],
    },
  ];

  const previewColumns = [
    { title: "用户ID", dataIndex: "id", key: "id" },
    { title: "用户名", dataIndex: "username", key: "username" },
    { title: "邮箱", dataIndex: "email", key: "email" },
    {
      title: "性别",
      dataIndex: "extra",
      key: "gender",
      render: (extra: any) =>
        extra.gender === "male"
          ? "男"
          : extra.gender === "female"
          ? "女"
          : "其他",
    },
    { title: "描述", dataIndex: "desc", key: "desc" },
    {
      title: "所在地",
      dataIndex: "extra",
      key: "location",
      render: (extra: any) => extra.location.join(", "),
    },
    {
      title: "学校",
      dataIndex: "extra",
      key: "school",
      render: (extra: any) => extra.school,
    },
    {
      title: "最后登录",
      dataIndex: "extra",
      key: "lastLoginTime",
      render: (extra: any) => extra.lastLoginTime,
    },
    {
      title: "创建时间",
      dataIndex: "extra",
      key: "createTime",
      render: (extra: any) => extra.createTime,
    },
  ];

  return (
    <>
      <ProTable<UserItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        loading={loading}
        request={handleSearch}
        rowKey="id"
        search={{
          labelWidth: "auto",
          defaultCollapsed: false,
          span: 6,
        }}
        toolBarRender={() => [
          <Button
            key="export"
            icon={<ExportOutlined />}
            onClick={() => {
              if (dataToExport.length > 0) {
                setIsPreviewModalVisible(true);
              } else {
                message.warning("当前没有数据可以导出");
              }
            }}
          >
            导出数据
          </Button>,
        ]}
      />

      <Modal
        title="导出数据预览与确认"
        visible={isPreviewModalVisible}
        onOk={handleConfirmExport}
        onCancel={() => setIsPreviewModalVisible(false)}
        width={800}
        okText="确认导出"
        cancelText="取消"
        destroyOnClose
      >
        <p>将导出以下 {dataToExport.length} 条数据：</p>
        <Table
          dataSource={dataToExport}
          columns={previewColumns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          scroll={{ y: 300 }}
          size="small"
        />
      </Modal>

      <Modal
        title="用户信息详情"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {currentRow && (
          <div>
            <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
              <div>
                <h4>头像</h4>
                <img
                  src={currentRow.avatar}
                  alt="用户头像"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <p
                  style={{
                    marginTop: "5px",
                    fontSize: "12px",
                    color: "#666",
                    wordBreak: "break-all",
                  }}
                >
                  URL: {currentRow.avatar}
                </p>
              </div>
              <div>
                <h4>背景图片</h4>
                <img
                  src={currentRow.backgroundImage}
                  alt="背景图片"
                  style={{
                    width: "200px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
                <p
                  style={{
                    marginTop: "5px",
                    fontSize: "12px",
                    color: "#666",
                    wordBreak: "break-all",
                  }}
                >
                  URL: {currentRow.backgroundImage}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "10px",
              }}
            >
              <p>
                <strong>用户ID：</strong>
                {currentRow.id}
              </p>
              <p>
                <strong>用户名：</strong>
                {currentRow.username}
              </p>
              <p>
                <strong>邮箱：</strong>
                {currentRow.email}
              </p>
              <p>
                <strong>性别：</strong>
                {currentRow.extra.gender === Gender.Male
                  ? "男"
                  : currentRow.extra.gender === Gender.Female
                  ? "女"
                  : "保密"}
              </p>
              <p>
                <strong>描述：</strong>
                {currentRow.desc}
              </p>
              <p>
                <strong>所在地：</strong>
                {currentRow.extra.location.join(", ")}
              </p>
              <p>
                <strong>学校：</strong>
                {currentRow.extra.school}
              </p>
              <p>
                <strong>年龄：</strong>
                {currentRow.extra.age || "未设置"}
              </p>
              <p>
                <strong>生日：</strong>
                {currentRow.extra.birthday || "未设置"}
              </p>
              <p>
                <strong>星座：</strong>
                {currentRow.extra.constellation || "未设置"}
              </p>
              <p>
                <strong>最后登录：</strong>
                {currentRow.extra.lastLoginTime}
              </p>
              <p>
                <strong>创建时间：</strong>
                {currentRow.extra.createTime}
              </p>
            </div>

            {/* <div style={{ marginTop: '20px' }}>
              <h4>学习档案</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <p>
                  <strong>学习风格：</strong>
                  {currentRow.learningProfile.style.preference}
                </p>
                <p>
                  <strong>学习时间：</strong>
                  {currentRow.learningProfile.style.schedule}
                </p>
                <p>
                  <strong>互动偏好：</strong>
                  {currentRow.learningProfile.style.interaction}
                </p>
                <p>
                  <strong>小组规模：</strong>
                  {currentRow.learningProfile.social.preferredGroupSize}人
                </p>
                <p>
                  <strong>领导力：</strong>
                  {currentRow.learningProfile.social.leadership}
                </p>
                <p>
                  <strong>合作性：</strong>
                  {currentRow.learningProfile.social.cooperation}
                </p>
                <p>
                  <strong>动机类型：</strong>
                  {currentRow.learningProfile.motivation.type}
                </p>
                <p>
                  <strong>动机强度：</strong>
                  {currentRow.learningProfile.motivation.intensity}
                </p>
                <p>
                  <strong>持久度：</strong>
                  {currentRow.learningProfile.motivation.persistence}
                </p>
                <p>
                  <strong>平均分：</strong>
                  {currentRow.learningProfile.history.averageScore}
                </p>
                <p>
                  <strong>学习时长：</strong>
                  {currentRow.learningProfile.history.studyHours}小时
                </p>
              </div>
            </div> */}
          </div>
        )}
      </Modal>
    </>
  );
};

export default UserTablePage;
