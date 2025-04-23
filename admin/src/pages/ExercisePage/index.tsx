import React, { useRef } from 'react';
import { ProTable, ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

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

// 假设习题的数据结构
interface ExerciseItem {
  id: number;
  question: string; // 题干
  type: 'single' | 'multiple' | 'judge'; // 题目类型：单选、多选、判断
  options?: string[]; // 选项 (判断题可能没有)
  answer: string | string[]; // 答案
  courseId?: number; // 关联课程ID (可选)
  courseName?: string; // 关联课程名称 (可选)
  difficulty?: 'easy' | 'medium' | 'hard'; // 难度 (可选)
  createdAt: string;
}

// 模拟的习题数据获取函数 (实际应替换为 API 调用)
const fetchExercises = async (params) => {
  console.log('Fetching exercises with params:', params);
  await waitTime(500);
  // --- 模拟数据 ---
  const mockExercises: ExerciseItem[] = [
    { id: 1, question: 'React 是什么？', type: 'single', options: ['库', '框架', '语言'], answer: '库', courseName: 'React 基础', difficulty: 'easy', createdAt: '2023-10-20 10:00:00' },
    { id: 2, question: 'Vue 的核心特点有哪些？', type: 'multiple', options: ['响应式', '组件化', '虚拟DOM', '渐进式'], answer: ['响应式', '组件化', '虚拟DOM', '渐进式'], courseName: 'Vue.js 入门', difficulty: 'medium', createdAt: '2023-10-21 11:00:00' },
    { id: 3, question: 'JavaScript 是动态类型语言吗？', type: 'judge', answer: '是', difficulty: 'easy', createdAt: '2023-10-22 12:00:00' },
  ];
  let filteredData = mockExercises;
  if (params.question) {
    filteredData = filteredData.filter(ex => ex.question.includes(params.question));
  }
   if (params.courseName) {
    filteredData = filteredData.filter(ex => ex.courseName?.includes(params.courseName));
  }
   if (params.type) {
    filteredData = filteredData.filter(ex => ex.type === params.type);
  }
  return { data: filteredData, success: true, total: filteredData.length };
  // --- 模拟数据结束 ---
};

// 删除习题的函数 (实际应替换为 API 调用)
const handleDeleteExercise = async (id: number) => {
   console.log(`Deleting exercise with id: ${id}`);
   await waitTime(500);
   message.success('删除成功');
   return true;
};

// (可选) 新增/编辑习题的函数或Modal

const ExerciseManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<ExerciseItem>[] = [
    { title: 'ID', dataIndex: 'id', key: 'id', search: false },
    { title: '题干', dataIndex: 'question', key: 'question', ellipsis: true },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      valueEnum: { // 使用 valueEnum 实现筛选
        single: { text: '单选题' },
        multiple: { text: '多选题' },
        judge: { text: '判断题' },
      },
      render: (_, record) => {
        const typeMap = { single: '单选', multiple: '多选', judge: '判断' };
        return <Tag>{typeMap[record.type]}</Tag>;
      }
    },
    { title: '所属课程', dataIndex: 'courseName', key: 'courseName' },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      search: false, // 简单示例，不加搜索
       render: (_, record) => {
         const colorMap = { easy: 'green', medium: 'blue', hard: 'red' };
         const textMap = { easy: '简单', medium: '中等', hard: '困难' };
         return record.difficulty ? <Tag color={colorMap[record.difficulty]}>{textMap[record.difficulty]}</Tag> : '-';
       }
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', valueType: 'dateTime', search: false },
    {
      title: '操作',
      key: 'action',
      search: false,
      render: (_, record) => [
        <Button key="edit" type="link" icon={<EditOutlined />}>编辑</Button>, // 编辑功能需要实现 Modal
        <Popconfirm
          key="delete"
          title="确定删除这道题吗？"
          onConfirm={async () => {
            const success = await handleDeleteExercise(record.id);
            if (success && actionRef.current) {
              actionRef.current.reload();
            }
          }}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <ProTable<ExerciseItem>
      columns={columns}
      actionRef={actionRef}
      cardBordered
      request={fetchExercises}
      editable={false} // 通常通过 Modal 编辑
      rowKey="id"
      search={{
        labelWidth: 'auto',
      }}
      headerTitle="习题列表"
      toolBarRender={() => [
        <Button key="add" icon={<PlusOutlined />} type="primary">
          新增习题
        </Button>, // 新增功能需要实现 Modal
      ]}
    />
  );
};

export default ExerciseManagementPage;