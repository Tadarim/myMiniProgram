/* eslint-disable @typescript-eslint/no-inferrable-types */
import React, { useRef, useState } from "react";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import {
  ProTable,
  TableDropdown,
  ModalForm,
  ProFormText,
  ProFormDatePicker,
  ProFormSelect,
} from "@ant-design/pro-components";
// --- 新增导入 ---
import { Button, Dropdown, message, Popconfirm, Modal, Table } from "antd"; // 引入 Modal 和 Table
import * as XLSX from "xlsx"; // 引入 xlsx
// --- 结束新增 ---
import {
  ExportOutlined,
  ImportOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";

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
  last_login: string; // 日期字符串
  created_at: string; // 日期字符串
  // --- 新增字段 ---
  avatar_url?: string; // 头像 URL (可选)
  background_url?: string; // 背景图片 URL (可选)
  gender?: "male" | "female" | "other"; // 性别 (可选)
  description?: string; // 描述 (可选)
  location?: string; // 所在地 (可选)
  school?: string; // 学校 (可选)
};

const mockUsers: UserItem[] = [
  {
    id: "1",
    username: "张伟",
    email: "zhangwei@example.com",
    last_login: "2025-03-30",
    created_at: "2025-01-15",
    // --- 新增示例数据 ---
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
    // --- 新增示例数据 ---
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
    // --- 新增示例数据 ---
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
  // --- 新增状态：用于导出预览 ---
  const [isPreviewModalVisible, setIsPreviewModalVisible] =
    useState<boolean>(false);
  const [dataToExport, setDataToExport] = useState<UserItem[]>([]);
  // --- 结束新增 ---

  // 模拟更新用户的函数 (实际应调用 API)
  const handleUpdate = async (values: Partial<UserItem>) => {
    if (!currentRow) return false;
    await waitTime(500); // 模拟网络请求
    // 在这里调用你的后端 API 更新用户信息
    // await yourApi.updateUser(currentRow.id, values);
    console.log("更新后的值:", { ...currentRow, ...values });
    // 更新 mock 数据 (仅用于前端演示)
    const index = mockUsers.findIndex((item) => item.id === currentRow.id);
    if (index > -1) {
      mockUsers[index] = { ...mockUsers[index], ...values };
    }
    message.success("修改成功");
    actionRef.current?.reload(); // 刷新表格
    return true;
  };

  // --- 新增：模拟重置密码的函数 ---
  const handleResetPassword = async (values: { password?: string }) => {
    if (!currentRow) return false;
    if (!values.password) {
      message.error("请输入新密码");
      return false;
    }
    await waitTime(500); // 模拟网络请求
    // 在这里调用你的后端 API 重置密码
    // await yourApi.resetPassword(currentRow.id, values.password);
    console.log(
      `用户 ${currentRow.username} (ID: ${currentRow.id}) 的新密码设置为: ${values.password}`
    );
    message.success("密码重置成功"); // <--- 在这里添加成功消息
    return true;
  };
  // --- 结束新增 ---

  // --- 新增：处理导出确认的函数 ---
  const handleConfirmExport = () => {
    if (dataToExport.length === 0) {
      message.warning("没有数据可以导出");
      return;
    }
    try {
      // 1. 创建 worksheet
      // 可以选择性地移除不想导出的列，或调整列顺序/标题
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
        // 可以按需添加或移除字段
      }));
      const worksheet = XLSX.utils.json_to_sheet(dataForSheet);

      // 2. 创建 workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "用户数据"); // "用户数据" 是 sheet 的名字

      // 3. 触发下载
      // 设置默认文件名
      const fileName = `用户数据导出_${new Date().toLocaleDateString()}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      message.success("数据导出成功！");
      setIsPreviewModalVisible(false); // 关闭预览弹窗
    } catch (error) {
      console.error("导出 Excel 时出错:", error);
      message.error("导出数据失败，请检查控制台错误信息。");
    }
  };
  // --- 结束新增 ---

  const columns: ProColumns<UserItem>[] = [
    {
      dataIndex: "index",
      valueType: "indexBorder",
      width: 48,
      // 不导出此列
      hideInExport: true, // ProTable 内置的导出功能会识别，但我们自定义导出需要手动处理
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
    // --- 可以选择性地在表格中隐藏，但在导出时包含 ---
    {
      title: "性别",
      dataIndex: "gender",
      hideInTable: true, // 不在表格中显示
      search: false, // 不在搜索中显示
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
    // --- 结束隐藏列 ---
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
      // 不导出此列
      hideInExport: true,
      render: (text, record, _, action) => [
        <a
          key="view"
          onClick={() => {
            setCurrentRow(record);
            setModalVisible(true); // 打开用户信息编辑/查看 Modal
          }}
        >
          查看/编辑
        </a>,
        <Button
          key="reset"
          type="link"
          onClick={() => {
            setCurrentRow(record); // <--- 设置当前行
            setResetPwdModalVisible(true); // <--- 打开重置密码 Modal
          }}
        >
          重置密码
        </Button>,
        <TableDropdown
          key="actionGroup"
          onSelect={async (key) => {
            if (key === "delete") {
              // 可以用 Popconfirm 再次确认
              // Popconfirm.confirm({ ... })
              await waitTime(500); // 模拟删除
              console.log("删除用户:", record.id);
              const index = mockUsers.findIndex(
                (item) => item.id === record.id
              );
              if (index > -1) {
                mockUsers.splice(index, 1);
              }
              message.success("删除成功");
              action?.reload();
            }
          }}
          menus={[{ key: "delete", name: "删除" }]}
        />,
      ],
    },
  ];

  // --- 预览弹窗的列定义 ---
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
  // --- 结束预览列定义 ---

  return (
    <>
      <ProTable<UserItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params, sort, filter) => {
          // <--- 获取 sort 参数
          await waitTime(500);
          console.log(
            "Request Params:",
            params,
            "Sorter:",
            sort,
            "Filter:",
            filter
          ); // 打印参数方便调试
          let filteredData = [...mockUsers];

          // --- 搜索逻辑 ---
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
          // --- 可以在这里添加其他搜索条件 ---

          // --- 排序逻辑 ---
          if (sort) {
            const sorterKey = Object.keys(sort)[0]; // 获取排序字段
            const order = sort[sorterKey]; // 获取排序顺序 ('ascend' or 'descend')

            if (sorterKey && order) {
              filteredData.sort((a, b) => {
                const valA = a[sorterKey as keyof UserItem]; // 添加类型断言
                const valB = b[sorterKey as keyof UserItem]; // 添加类型断言

                // 对不同类型进行比较
                if (sorterKey === "created_at" || sorterKey === "last_login") {
                  // 日期比较
                  const dateA = new Date(valA as string).getTime();
                  const dateB = new Date(valB as string).getTime();
                  return order === "ascend" ? dateA - dateB : dateB - dateA;
                } else if (
                  typeof valA === "number" &&
                  typeof valB === "number"
                ) {
                  // 数字比较 (例如 ID 如果是数字类型)
                  return order === "ascend" ? valA - valB : valB - valA;
                } else {
                  // 其他类型（这里主要是 id 和 username）按字符串比较
                  const strA = String(valA ?? ""); // 处理 null/undefined
                  const strB = String(valB ?? ""); // 处理 null/undefined
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
          // --- 排序逻辑结束 ---

          return {
            data: filteredData,
            success: true,
            total: filteredData.length, // 如果是后端分页，这里应该是总数
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
              // --- 暂时简化：直接使用 mockUsers 进行测试 ---
              console.log("使用 mockUsers 进行导出测试...");
              const currentData = [...mockUsers]; // 直接使用原始 mock 数据
              // --- 结束简化 ---

              if (currentData && currentData.length > 0) {
                console.log("设置待导出数据:", currentData);
                setDataToExport(currentData); // 设置要导出的数据
                setIsPreviewModalVisible(true); // 打开预览弹窗
              } else {
                message.warning("当前没有数据可以导出");
              }
            }}
          >
            导出数据
          </Button>,
        ]}
      />

      {/* --- 用户信息编辑/查看 Modal --- */}
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
        {/* --- 新增表单项 --- */}
        <ProFormText
          name="avatar_url"
          label="头像URL"
          placeholder="请输入头像图片地址"
        />
        <ProFormText
          name="background_url"
          label="背景URL"
          placeholder="请输入背景图片地址"
        />
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
        {/* --- 结束新增 --- */}
        <ProFormDatePicker name="created_at" label="创建时间" readonly />
        <ProFormDatePicker name="last_login" label="最后登录时间" readonly />
      </ModalForm>

      {/* --- 新增：重置密码 Modal --- */}
      <ModalForm
        title={`重置用户 "${currentRow?.username}" 的密码`}
        width="400px"
        visible={resetPwdModalVisible}
        onVisibleChange={setResetPwdModalVisible}
        modalProps={{
          destroyOnClose: true, // 关闭时销毁表单状态
          onCancel: () => setCurrentRow(undefined), // 关闭时清空当前行
        }}
        onFinish={async (values) => {
          const success = await handleResetPassword(values);
          if (success) {
            setResetPwdModalVisible(false);
            setCurrentRow(undefined); // 清空当前行
          }
        }}
      >
        <ProFormText.Password // 使用 Password 组件
          name="password"
          label="新密码"
          placeholder="请输入新密码"
          rules={[
            { required: true, message: "请输入新密码!" },
            { min: 6, message: "密码至少需要6位!" }, // 添加最小长度校验
          ]}
        />
      </ModalForm>

      {/* --- 新增：导出预览 Modal --- */}
      <Modal
        title="导出数据预览与确认"
        visible={isPreviewModalVisible}
        onOk={handleConfirmExport} // 点击确认时调用导出函数
        onCancel={() => setIsPreviewModalVisible(false)} // 点击取消或关闭时隐藏
        width={800} // 可以根据需要调整宽度
        okText="确认导出"
        cancelText="取消"
        destroyOnClose // 关闭时销毁内部状态
      >
        <p>将导出以下 {dataToExport.length} 条数据：</p>
        <Table
          dataSource={dataToExport}
          columns={previewColumns} // 使用上面定义的预览列
          rowKey="id"
          pagination={{ pageSize: 5 }} // 预览时可以分页，或者设置 false 不分页
          scroll={{ y: 300 }} // 如果数据多，可以设置滚动
          size="small"
        />
      </Modal>
      {/* --- 结束新增 --- */}
    </>
  );
};

export default UserTablePage;
