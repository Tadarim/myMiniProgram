/* eslint-disable @typescript-eslint/no-inferrable-types */
import React, { useRef, useState } from "react";
import {
  ProTable,
  ProColumns,
  ActionType,
  ModalForm,
  ProFormText,
  ProFormDatePicker,
  ProFormSelect,
  TableDropdown,
} from "@ant-design/pro-components";
import { Button, message, Modal, Table } from "antd";
import { ExportOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

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

type UserItem = {
  id: string;
  username: string;
  email: string;
  last_login: string;
  created_at: string;
  avatar_url?: string;
  background_url?: string;
  gender?: "male" | "female" | "other";
  description?: string;
  location?: string;
  school?: string;
};

const mockUsers: UserItem[] = [
  {
    id: "1",
    username: "张伟",
    email: "zhangwei@example.com",
    last_login: "2025-03-30",
    created_at: "2025-01-15",
    avatar_url:
      "https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png",
    background_url:
      "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png",
    gender: "male",
    description: "热爱编程的全栈工程师",
    location: "北京",
    school: "清华大学",
  },
  {
    id: "2",
    username: "李娜",
    email: "lina@example.com",
    last_login: "2025-03-31",
    created_at: "2024-12-10",
    avatar_url:
      "https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg",
    gender: "female",
    description: "UI/UX 设计师，追求极致用户体验",
    location: "上海",
    school: "同济大学",
  },
  {
    id: "3",
    username: "王强",
    email: "wangqiang@example.com",
    last_login: "2025-02-15",
    created_at: "2025-02-01",
    gender: "male",
    description: "数据分析师，挖掘数据价值",
    location: "深圳",
    school: "中山大学",
  },
];

const UserTablePage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [resetPwdModalVisible, setResetPwdModalVisible] =
    useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<UserItem | undefined>(undefined);
  const [isPreviewModalVisible, setIsPreviewModalVisible] =
    useState<boolean>(false);
  const [dataToExport, setDataToExport] = useState<UserItem[]>([]);

  const handleUpdate = async (values: Partial<UserItem>) => {
    if (!currentRow) return false;
    await waitTime(500); // 模拟网络请求
    console.log("更新后的值:", { ...currentRow, ...values });
    const index = mockUsers.findIndex((item) => item.id === currentRow.id);
    if (index > -1) {
      mockUsers[index] = { ...mockUsers[index], ...values };
    }
    message.success("修改成功");
    actionRef.current?.reload();
    return true;
  };

  const handleResetPassword = async (values: { password?: string }) => {
    if (!currentRow) return false;
    if (!values.password) {
      message.error("请输入新密码");
      return false;
    }
    await waitTime(500);
    console.log(
      `用户 ${currentRow.username} (ID: ${currentRow.id}) 的新密码设置为: ${values.password}`
    );
    message.success("密码重置成功");
    return true;
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
          item.gender === "male"
            ? "男"
            : item.gender === "female"
            ? "女"
            : "其他",
        描述: item.description,
        所在地: item.location,
        学校: item.school,
        最后登录: item.last_login,
        创建时间: item.created_at,
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
      hideInExport: true,
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
    },
    {
      title: "性别",
      dataIndex: "gender",
      hideInTable: true,
      search: false,
      render: (_, record) =>
        record.gender === "male"
          ? "男"
          : record.gender === "female"
          ? "女"
          : "其他",
    },
    {
      title: "描述",
      dataIndex: "description",
      hideInTable: true,
      search: false,
    },
    {
      title: "所在地",
      dataIndex: "location",
      hideInTable: true,
      search: false,
    },
    {
      title: "学校",
      dataIndex: "school",
      hideInTable: true,
      search: false,
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      valueType: "date",
      sorter: true,
      hideInSearch: true,
    },
    {
      title: "最后登录",
      dataIndex: "last_login",
      valueType: "date",
      sorter: true,
      hideInSearch: true,
    },
    {
      title: "创建时间范围",
      dataIndex: "created_at",
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
    },
    {
      title: "操作",
      valueType: "option",
      key: "option",
      hideInExport: true,
      render: (text, record, _, action) => [
        <a
          key="view"
          onClick={() => {
            setCurrentRow(record);
            setModalVisible(true);
          }}
        >
          查看/编辑
        </a>,
        <Button
          key="reset"
          type="link"
          onClick={() => {
            setCurrentRow(record);
            setResetPwdModalVisible(true);
          }}
        >
          重置密码
        </Button>,
        <TableDropdown
          key="actionGroup"
          onSelect={async (key) => {
            if (key === "delete") {
              Modal.confirm({
                title: "确定要删除该用户吗？",
                content: "删除后将无法恢复，请谨慎操作！",
                okText: "确定",
                cancelText: "取消",
                onOk: async () => {
                  await waitTime(500);
                  const index = mockUsers.findIndex(
                    (item) => item.id === record.id
                  );
                  if (index > -1) {
                    mockUsers.splice(index, 1);
                  }
                  message.success("删除成功");
                  action?.reload();
                },
              });
            }
          }}
          menus={[{ key: "delete", name: "删除" }]}
        />,
      ],
    },
  ];

  const previewColumns = [
    { title: "用户ID", dataIndex: "id", key: "id" },
    { title: "用户名", dataIndex: "username", key: "username" },
    { title: "邮箱", dataIndex: "email", key: "email" },
    {
      title: "性别",
      dataIndex: "gender",
      key: "gender",
      render: (gender: string) =>
        gender === "male" ? "男" : gender === "female" ? "女" : "其他",
    },
    { title: "描述", dataIndex: "description", key: "description" },
    { title: "所在地", dataIndex: "location", key: "location" },
    { title: "学校", dataIndex: "school", key: "school" },
    { title: "最后登录", dataIndex: "last_login", key: "last_login" },
    { title: "创建时间", dataIndex: "created_at", key: "created_at" },
  ];

  return (
    <>
      <ProTable<UserItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params, sort, filter) => {
          await waitTime(500);
          console.log(
            "Request Params:",
            params,
            "Sorter:",
            sort,
            "Filter:",
            filter
          );
          let filteredData = [...mockUsers];

          if (params.username) {
            filteredData = filteredData.filter((user) =>
              user.username
                .toLowerCase()
                .includes(params.username.toLowerCase())
            );
          }
          if (params.email) {
            filteredData = filteredData.filter((user) =>
              user.email.toLowerCase().includes(params.email.toLowerCase())
            );
          }

          if (sort) {
            const sorterKey = Object.keys(sort)[0];
            const order = sort[sorterKey];

            if (sorterKey && order) {
              filteredData.sort((a, b) => {
                const valA = a[sorterKey as keyof UserItem];
                const valB = b[sorterKey as keyof UserItem];

                if (sorterKey === "created_at" || sorterKey === "last_login") {
                  const dateA = new Date(valA as string).getTime();
                  const dateB = new Date(valB as string).getTime();
                  return order === "ascend" ? dateA - dateB : dateB - dateA;
                } else if (
                  typeof valA === "number" &&
                  typeof valB === "number"
                ) {
                  return order === "ascend" ? valA - valB : valB - valA;
                } else {
                  const strA = String(valA ?? "");
                  const strB = String(valB ?? "");
                  if (strA < strB) {
                    return order === "ascend" ? -1 : 1;
                  }
                  if (strA > strB) {
                    return order === "ascend" ? 1 : -1;
                  }
                  return 0;
                }
              });
            }
          }

          return {
            data: filteredData,
            success: true,
            total: filteredData.length,
          };
        }}
        rowKey="id"
        search={{
          labelWidth: "auto",
        }}
        toolBarRender={() => [
          <Button
            key="export"
            icon={<ExportOutlined />}
            onClick={async () => {
              console.log("使用 mockUsers 进行导出测试...");
              const currentData = [...mockUsers];

              if (currentData && currentData.length > 0) {
                console.log("设置待导出数据:", currentData);
                setDataToExport(currentData);
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

      <ModalForm
        title={currentRow ? `编辑用户 - ${currentRow.username}` : "用户信息"}
        width="600px"
        visible={modalVisible}
        onVisibleChange={setModalVisible}
        initialValues={currentRow}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setCurrentRow(undefined),
        }}
        onFinish={async (value) => {
          const success = await handleUpdate(value);
          if (success) {
            setModalVisible(false);
            setCurrentRow(undefined);
          }
        }}
      >
        <ProFormText name="id" label="用户ID" readonly />
        <ProFormText
          name="username"
          label="用户名"
          rules={[{ required: true, message: "请输入用户名!" }]}
        />
        <ProFormText
          name="email"
          label="邮箱"
          rules={[
            { required: true, message: "请输入邮箱!" },
            { type: "email", message: "请输入有效的邮箱地址!" },
          ]}
        />
        <ProFormText
          name="avatar_url"
          label="头像URL"
          placeholder="请输入头像图片地址"
        />
        {currentRow?.avatar_url && (
          <div style={{ marginBottom: 16 }}>
            <img
              src={currentRow.avatar_url}
              alt="头像预览"
              style={{
                maxWidth: "100px",
                maxHeight: "100px",
                objectFit: "cover",
                borderRadius: "4px",
              }}
            />
          </div>
        )}
        <ProFormText
          name="background_url"
          label="背景URL"
          placeholder="请输入背景图片地址"
        />
        {currentRow?.background_url && (
          <div style={{ marginBottom: 16 }}>
            <img
              src={currentRow.background_url}
              alt="背景预览"
              style={{
                maxWidth: "200px",
                maxHeight: "100px",
                objectFit: "cover",
                borderRadius: "4px",
              }}
            />
          </div>
        )}
        <ProFormSelect
          name="gender"
          label="性别"
          options={[
            { label: "男", value: "male" },
            { label: "女", value: "female" },
            { label: "其他", value: "other" },
          ]}
          placeholder="请选择性别"
        />
        <ProFormText
          name="description"
          label="描述"
          placeholder="请输入个人描述"
        />
        <ProFormText
          name="location"
          label="所在地"
          placeholder="请输入所在地"
        />
        <ProFormText name="school" label="学校" placeholder="请输入学校名称" />
        <ProFormDatePicker name="created_at" label="创建时间" readonly />
        <ProFormDatePicker name="last_login" label="最后登录时间" readonly />
      </ModalForm>

      <ModalForm
        title={`重置用户 "${currentRow?.username}" 的密码`}
        width="400px"
        visible={resetPwdModalVisible}
        onVisibleChange={setResetPwdModalVisible}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setCurrentRow(undefined),
        }}
        onFinish={async (values) => {
          const success = await handleResetPassword(values);
          if (success) {
            setResetPwdModalVisible(false);
            setCurrentRow(undefined);
          }
        }}
      >
        <ProFormText.Password
          name="password"
          label="新密码"
          placeholder="请输入新密码"
          rules={[
            { required: true, message: "请输入新密码!" },
            { min: 6, message: "密码至少需要6位!" },
          ]}
        />
      </ModalForm>

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
    </>
  );
};

export default UserTablePage;
