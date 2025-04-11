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

type SelectionItem = {
  id: string;
  studentName: string;
  studentId: string;
  courseName: string;
  courseId: string;
  selectionDate: string;
};

const mockSelections: SelectionItem[] = [
  {
    id: "1",
    studentName: "张伟",
    studentId: "20230001",
    courseName: "高等数学",
    courseId: "MATH101",
    selectionDate: "2025-03-01",
  },
  {
    id: "2",
    studentName: "李娜",
    studentId: "20230002",
    courseName: "计算机基础",
    courseId: "CS101",
    selectionDate: "2025-03-02",
  },
  {
    id: "3",
    studentName: "王强",
    studentId: "20230003",
    courseName: "英语写作",
    courseId: "ENG201",
    selectionDate: "2025-03-03",
  },
];

const columns: ProColumns<SelectionItem>[] = [
  {
    dataIndex: "index",
    valueType: "indexBorder",
    width: 48,
  },
  {
    title: "学生姓名",
    dataIndex: "studentName",
    copyable: true,
    ellipsis: true,
  },
  {
    title: "学号",
    dataIndex: "studentId",
    copyable: true,
    ellipsis: true,
  },
  {
    title: "课程名称",
    dataIndex: "courseName",
    ellipsis: true,
  },
  {
    title: "课程代码",
    dataIndex: "courseId",
    ellipsis: true,
  },
  {
    title: "选课日期",
    dataIndex: "selectionDate",
    valueType: "date",
    sorter: true,
    hideInSearch: true,
  },
  {
    title: "选课时间范围",
    dataIndex: "selectionDate",
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
    render: (text, record) => [
      <a key="view">查看</a>,
      <TableDropdown
        key="actionGroup"
        onSelect={() => {}}
        menus={[
          { key: "delete", name: "删除选课" },
        ]}
      />,
    ],
  },
];

const CourseSelectionPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  return (
    <ProTable<SelectionItem>
      columns={columns}
      actionRef={actionRef}
      cardBordered
      request={async (params) => {
        await waitTime(500);
        let filteredData = [...mockSelections];
        
        if (params.studentName) {
          filteredData = filteredData.filter(item => 
            item.studentName.includes(params.studentName)
          );
        }
        if (params.courseName) {
          filteredData = filteredData.filter(item => 
            item.courseName.includes(params.courseName)
          );
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
          key="button"
          icon={<PlusOutlined />}
          onClick={() => {
            actionRef.current?.reload();
          }}
          type="primary"
        >
          新增选课
        </Button>,
        <Dropdown
          key="menu"
          menu={{
            items: [
              {
                label: "导出所有选课信息",
                key: "exportAll",
              },
              {
                label: "导出当前课程选课信息",
                key: "exportCurrent",
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

export default CourseSelectionPage;