/* eslint-disable @typescript-eslint/no-inferrable-types */
import React, { useRef } from "react";
import { EllipsisOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable, TableDropdown } from "@ant-design/pro-components";
import { Button, Dropdown, Switch } from "antd";

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

type CourseItem = {
  id: string;
  courseName: string;
  courseId: string;
  teacher: string;
  created_at: string;
  isVisible: boolean;
};

const mockCourses: CourseItem[] = [
  {
    id: "1",
    courseName: "高等数学",
    courseId: "MATH101",
    teacher: "张教授",
    created_at: "2025-01-10",
    isVisible: true,
  },
  {
    id: "2",
    courseName: "计算机基础",
    courseId: "CS101",
    teacher: "李老师",
    created_at: "2025-01-15",
    isVisible: false,
  },
  {
    id: "3",
    courseName: "英语写作",
    courseId: "ENG201",
    teacher: "王博士",
    created_at: "2025-02-01",
    isVisible: true,
  },
];

const columns: ProColumns<CourseItem>[] = [
  {
    dataIndex: "index",
    valueType: "indexBorder",
    width: 48,
  },
  {
    title: "课程名称",
    dataIndex: "courseName",
    copyable: true,
    ellipsis: true,
    tip: "课程名称过长会自动收缩",
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
    title: "课程代码",
    dataIndex: "courseId",
    copyable: true,
    ellipsis: true,
  },
  {
    title: "授课教师",
    dataIndex: "teacher",
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
    title: "可见性",
    dataIndex: "isVisible",
    render: (_, record) => (
      <Switch
        checked={record.isVisible}
        onChange={(checked) => {
          console.log(`设置 ${record.courseId} 可见性为 ${checked}`);
        }}
      />
    ),
  },
  {
    title: "操作",
    valueType: "option",
    key: "option",
    render: (text, record) => [
      <a key="edit">编辑</a>,
      <Button
        key="upload"
        type="link"
        icon={<UploadOutlined />}
        onClick={() => {
          console.log(`上传 ${record.courseId} 的课程资料`);
        }}
      >
        上传资料
      </Button>,
      <TableDropdown
        key="actionGroup"
        onSelect={(key) => {
          console.log(`管理 ${record.courseId} 的资料 - 操作: ${key}`);
        }}
        menus={[
          { key: "viewMaterials", name: "查看资料" },
          { key: "delete", name: "删除课程" },
        ]}
      />,
    ],
  },
];

const CourseManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  return (
    <ProTable<CourseItem>
      columns={columns}
      actionRef={actionRef}
      cardBordered
      request={async (params) => {
        await waitTime(500);
        let filteredData = [...mockCourses];
        
        if (params.courseName) {
          filteredData = filteredData.filter(course => 
            course.courseName.includes(params.courseName)
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
          新增课程
        </Button>,
        <Dropdown
          key="menu"
          menu={{
            items: [
              {
                label: "导出课程列表",
                key: "export",
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

export default CourseManagementPage;