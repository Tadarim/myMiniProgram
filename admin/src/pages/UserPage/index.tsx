/* eslint-disable @typescript-eslint/no-inferrable-types */
import React, { useRef } from "react";
import { EllipsisOutlined, PlusOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable, TableDropdown } from "@ant-design/pro-components";
import { Button, Dropdown } from "antd";

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
  phone: string;
  last_login: string;
  created_at: string;
};

const mockUsers: UserItem[] = [
  {
    id: "1",
    username: "张伟",
    phone: "138-1234-5678",
    last_login: "2025-03-30",
    created_at: "2025-01-15",
  },
  {
    id: "2",
    username: "李娜",
    phone: "139-2345-6789",
    last_login: "2025-03-31",
    created_at: "2024-12-10",
  },
  {
    id: "3",
    username: "王强",
    phone: "137-3456-7890",
    last_login: "2025-02-15",
    created_at: "2025-02-01",
  },
];

const columns: ProColumns<UserItem>[] = [
  {
    dataIndex: "index",
    valueType: "indexBorder",
    width: 48,
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
    title: "电话",
    dataIndex: "phone",
    copyable: true,
    ellipsis: true,
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
    render: (text, record, _, action) => [
      <a
        key="editable"
        onClick={() => {
          action?.startEditable?.(record.id);
        }}
      >
        编辑
      </a>,
      <a key="view">查看</a>,
      <Button
        key="reset"
        type="link"
        onClick={() => {
          console.log("xxy");
        }}
      >
        重置密码
      </Button>,
      <TableDropdown
        key="actionGroup"
        onSelect={() => action?.reload()}
        menus={[{ key: "delete", name: "删除" }]}
      />,
    ],
  },
];

const UserTablePage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  return (
    <ProTable<UserItem>
      columns={columns}
      actionRef={actionRef}
      cardBordered
      request={async (params) => {
        await waitTime(500);
        let filteredData = [...mockUsers];

        if (params.username) {
          filteredData = filteredData.filter((user) =>
            user.username.toLowerCase().includes(params.username.toLowerCase())
          );
        }

        return {
          data: filteredData,
          success: true,
          total: filteredData.length,
        };
      }}
      editable={{
        type: "multiple",
      }}
      rowKey="id"
      search={{
        labelWidth: "auto",
      }}
      toolBarRender={() => [
        <Button
          key="button"
          icon={<PlusOutlined />}
          onClick={() => {
            actionRef.current?.reload();
          }}
          type="primary"
        >
          新增用户
        </Button>,
        <Dropdown
          key="menu"
          menu={{
            items: [
              {
                label: "导出数据",
                key: "export",
              },
              {
                label: "导入用户",
                key: "import",
              },
            ],
          }}
        >
          <Button>
            <EllipsisOutlined />
          </Button>
        </Dropdown>,
      ]}
    />
  );
};

export default UserTablePage;
