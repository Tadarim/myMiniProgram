import React, { useRef, useState } from "react";
import { ProTable, ProColumns, ActionType } from "@ant-design/pro-components";
import {
  Button,
  message,
  Popconfirm,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Divider,
  Radio,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";

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

type QuestionType = "single" | "multiple";

interface Question {
  id: number;
  content: string;
  type: QuestionType;
  options: string[];
  answer: string | string[];
}

interface ExerciseSet {
  id: number;
  title: string;
  description: string;
  courseId: number;
  courseName: string;
  questionCount: number;
  questions: Question[];
  createdAt: string;
}

const generateId = (type: 'exerciseSet' | 'question'): number => {
  if (type === 'exerciseSet') {
    const maxId = Math.max(...mockExerciseSets.map(set => set.id), 0);
    return maxId + 1;
  } else {
    const allQuestions = mockExerciseSets.flatMap(set => set.questions);
    const maxId = Math.max(...allQuestions.map(q => q.id), 0);
    return maxId + 1;
  }
};

let mockExerciseSets: ExerciseSet[] = [
  {
    id: 1,
    title: "React基础知识测试",
    description: "React基础概念和核心特性的测试题目",
    courseId: 1,
    courseName: "React基础教程",
    questionCount: 2,
    questions: [
      {
        id: 1,
        content: "React 是什么？",
        type: "single",
        options: ["JavaScript库", "编程语言", "操作系统", "数据库"],
        answer: "JavaScript库",
      },
      {
        id: 2,
        content: "React的核心特性包括哪些？",
        type: "multiple",
        options: ["组件化", "虚拟DOM", "单向数据流", "JSX语法"],
        answer: ["组件化", "虚拟DOM", "单向数据流", "JSX语法"],
      },
    ],
    createdAt: "2024-03-20 10:00:00",
  },
  {
    id: 2,
    title: "Vue.js入门测试",
    description: "Vue.js基础知识测试题目",
    courseId: 2,
    courseName: "Vue.js入门教程",
    questionCount: 2,
    questions: [
      {
        id: 3,
        content: "Vue.js的核心是什么？",
        type: "single",
        options: ["数据驱动", "组件化", "路由系统", "状态管理"],
        answer: "数据驱动",
      },
      {
        id: 4,
        content: "Vue.js 2.x的特性有哪些？",
        type: "multiple",
        options: ["响应式系统", "虚拟DOM", "组件化", "模板语法"],
        answer: ["响应式系统", "虚拟DOM", "组件化", "模板语法"],
      },
    ],
    createdAt: "2024-03-21 11:00:00",
  },
];

const mockCourses = [
  { id: 1, name: "React基础教程" },
  { id: 2, name: "Vue.js入门教程" },
  { id: 3, name: "Angular进阶课程" },
];

const fetchExerciseSets = async (params: any) => {
  console.log("Fetching exercise sets with params:", params);
  await waitTime(500);

  let filteredData = [...mockExerciseSets];
  if (params.title) {
    filteredData = filteredData.filter((set) =>
      set.title.includes(params.title)
    );
  }
  if (params.courseName) {
    filteredData = filteredData.filter((set) =>
      set.courseName.includes(params.courseName)
    );
  }

  return { data: filteredData, success: true, total: filteredData.length };
};

const handleDeleteExerciseSet = async (id: number) => {
  console.log(`Deleting exercise set with id: ${id}`);
  await waitTime(500);
  
  mockExerciseSets = mockExerciseSets.filter(set => set.id !== id);
  message.success("删除成功");
  return true;
};

const handleSaveExerciseSet = async (values: any, mode: 'add' | 'edit', currentId?: number) => {
  console.log("Saving exercise set:", values);
  await waitTime(500);

  const { title, description, courseId } = values;
  const course = mockCourses.find(c => c.id === courseId);

  if (mode === 'add') {
    const newExerciseSet: ExerciseSet = {
      id: generateId('exerciseSet'),
      title,
      description,
      courseId,
      courseName: course?.name || '',
      questionCount: 0,
      questions: [],
      createdAt: new Date().toISOString(),
    };
    mockExerciseSets = [...mockExerciseSets, newExerciseSet];
  } else if (mode === 'edit' && currentId) {
    mockExerciseSets = mockExerciseSets.map(set => {
      if (set.id === currentId) {
        return {
          ...set,
          title,
          description,
          courseId,
          courseName: course?.name || '',
        };
      }
      return set;
    });
  }

  message.success("保存成功");
  return true;
};

const handleDeleteQuestion = async (exerciseSetId: number, questionId: number) => {
  console.log(`Deleting question ${questionId} from exercise set ${exerciseSetId}`);
  await waitTime(500);

  mockExerciseSets = mockExerciseSets.map(set => {
    if (set.id === exerciseSetId) {
      const updatedQuestions = set.questions.filter(q => q.id !== questionId);
      return {
        ...set,
        questions: updatedQuestions,
        questionCount: updatedQuestions.length,
      };
    }
    return set;
  });

  message.success("删除题目成功");
  return true;
};

const ExerciseSetManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [questionForm] = Form.useForm();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [currentExerciseSet, setCurrentExerciseSet] = useState<ExerciseSet | null>(null);
  const [modalTitle, setModalTitle] = useState("新增习题集");
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");

  const handleViewQuestions = (record: ExerciseSet) => {
    setCurrentExerciseSet(record);
    setIsViewModalVisible(true);
  };

  const handleEditExerciseSet = (record: ExerciseSet) => {
    setCurrentExerciseSet(record);
    setModalTitle("编辑习题集");
    setModalMode("edit");
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      courseId: record.courseId,
    });
    setIsModalVisible(true);
  };

  const handleAddExerciseSet = () => {
    setCurrentExerciseSet(null);
    setModalTitle("新增习题集");
    setModalMode("add");
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const success = await handleSaveExerciseSet(values, modalMode, currentExerciseSet?.id);
      if (success) {
        setIsModalVisible(false);
        actionRef.current?.reload();
      }
    } catch (error) {
      console.error("表单验证失败:", error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleAddQuestionClick = () => {
    questionForm.resetFields();
    setIsQuestionModalVisible(true);
  };

  const handleQuestionModalOk = async () => {
    try {
      const values = await questionForm.validateFields();
      if (!currentExerciseSet) return;

      const newQuestion = {
        content: values.content,
        type: values.type,
        options: values.options,
        answer: values.type === 'single' ? values.singleAnswer : values.multipleAnswer,
      };

      const newQuestionWithId = {
        id: generateId('question'),
        ...newQuestion,
      };

      mockExerciseSets = mockExerciseSets.map(set => {
        if (set.id === currentExerciseSet.id) {
          return {
            ...set,
            questions: [...set.questions, newQuestionWithId],
            questionCount: set.questions.length + 1,
          };
        }
        return set;
      });

      const updatedSet = mockExerciseSets.find(set => set.id === currentExerciseSet.id);
      setCurrentExerciseSet(updatedSet || null);
      
      setIsQuestionModalVisible(false);
      message.success('添加题目成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('题目表单验证失败:', error);
    }
  };

  const handleQuestionDelete = async (exerciseSetId: number, questionId: number) => {
    const success = await handleDeleteQuestion(exerciseSetId, questionId);
    if (success) {
      const updatedSet = mockExerciseSets.find(set => set.id === exerciseSetId);
      setCurrentExerciseSet(updatedSet || null);
      actionRef.current?.reload();
    }
  };

  const renderQuestionsList = () => {
    if (!currentExerciseSet) return null;

    return (
      <div>
        {currentExerciseSet.questions.map((question, index) => (
          <div
            key={question.id}
            style={{
              marginBottom: 20,
              padding: 16,
              border: "1px solid #f0f0f0",
              borderRadius: 4,
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: 8 }}>
              {index + 1}. {question.content}
              <Tag
                color={question.type === "single" ? "blue" : "green"}
                style={{ marginLeft: 8 }}
              >
                {question.type === "single" ? "单选题" : "多选题"}
              </Tag>
              <span style={{ marginLeft: 8, color: '#999', fontSize: '12px' }}>
                ID: {question.id}
              </span>
            </div>

            {question.type === "single" ? (
              <Radio.Group value={question.answer as string} disabled>
                {question.options.map((option, optIndex) => (
                  <Radio
                    key={optIndex}
                    value={option}
                    style={{ display: "block", marginBottom: 8 }}
                  >
                    {option}
                  </Radio>
                ))}
              </Radio.Group>
            ) : (
              <div>
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} style={{ marginBottom: 8 }}>
                    <Checkbox
                      checked={(question.answer as string[]).includes(option)}
                      disabled
                    >
                      {option}
                    </Checkbox>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 8, color: "#666" }}>
              <strong>正确答案：</strong>
              {Array.isArray(question.answer)
                ? question.answer.join("、")
                : question.answer}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const columns: ProColumns<ExerciseSet>[] = [
    {
      title: "习题集ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      search: false,
    },
    {
      title: "习题集名称",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      width: 200,
      search: true,
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      search: false,
      width: 300,
    },
    {
      title: "所属课程",
      dataIndex: "courseName",
      key: "courseName",
      width: 150,
      search: true,
    },
    {
      title: "题目数量",
      dataIndex: "questionCount",
      key: "questionCount",
      search: false,
      width: 80,
      render: (_, record) => record.questions.length,
    },
    {
      title: "题目类型",
      key: "questionTypes",
      search: false,
      width: 80,
      render: (_, record) => {
        const types = new Set(record.questions.map((q) => q.type));
        return (
          <Space size={0}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {Array.from(types).map((type) => (
                <Tag key={type}>{type === "single" ? "单选" : "多选"}</Tag>
              ))}
            </div>
          </Space>
        );
      },
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      valueType: "dateTime",
      search: false,
      width: 180,
    },
    {
      title: "操作",
      key: "action",
      search: false,
      width: 140,
      align: "center",
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
            onClick={() => handleViewQuestions(record)}
          >
            查看题目
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditExerciseSet(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个习题集吗？"
            onConfirm={async () => {
              const success = await handleDeleteExerciseSet(record.id);
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
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<ExerciseSet>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={fetchExerciseSets}
        rowKey="id"
        search={{
          labelWidth: "auto",
          defaultCollapsed: false,
        }}
        pagination={{
          defaultPageSize: 10,
          showQuickJumper: true,
        }}
        dateFormatter="string"
        headerTitle="习题集列表"
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddExerciseSet}
          >
            新增习题集
          </Button>,
        ]}
      />

      <Modal
        title={`${currentExerciseSet?.title || ""} - 题目详情`}
        visible={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {renderQuestionsList()}
      </Modal>

      <Modal
        title={modalTitle}
        visible={isModalVisible}
        onCancel={handleModalCancel}
        width={600}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleModalOk}>
            保存
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ courseId: mockCourses[0]?.id }}
        >
          <Form.Item
            name="title"
            label="习题集名称"
            rules={[{ required: true, message: "请输入习题集名称" }]}
          >
            <Input placeholder="请输入习题集名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: "请输入习题集描述" }]}
          >
            <Input.TextArea rows={4} placeholder="请输入习题集描述" />
          </Form.Item>

          <Form.Item
            name="courseId"
            label="所属课程"
            rules={[{ required: true, message: "请选择所属课程" }]}
          >
            <Select placeholder="请选择所属课程">
              {mockCourses.map((course) => (
                <Select.Option key={course.id} value={course.id}>
                  {course.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {modalMode === "edit" && (
            <>
              <Divider>题目管理</Divider>
              <div style={{ marginBottom: 16 }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddQuestionClick}
                >
                  添加题目
                </Button>
              </div>
              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                {currentExerciseSet?.questions.map((question, index) => (
                  <div
                    key={question.id}
                    style={{
                      marginBottom: 16,
                      padding: 12,
                      border: "1px solid #f0f0f0",
                      borderRadius: 4,
                    }}
                  >
                    <div style={{ fontWeight: "bold", marginBottom: 8 }}>
                      {index + 1}. {question.content}
                      <Tag
                        color={question.type === "single" ? "blue" : "green"}
                        style={{ marginLeft: 8 }}
                      >
                        {question.type === "single" ? "单选题" : "多选题"}
                      </Tag>
                      <span style={{ marginLeft: 8, color: '#999', fontSize: '12px' }}>
                        ID: {question.id}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: 8,
                      }}
                    >
                      <Button
                        type="link"
                        danger
                        size="small"
                        onClick={() => {
                          if (currentExerciseSet) {
                            handleQuestionDelete(currentExerciseSet.id, question.id);
                          }
                        }}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Form>
      </Modal>

      <Modal
        title="添加题目"
        visible={isQuestionModalVisible}
        onCancel={() => setIsQuestionModalVisible(false)}
        onOk={handleQuestionModalOk}
        width={600}
      >
        <Form
          form={questionForm}
          layout="vertical"
          initialValues={{
            type: 'single',
            options: ['', '', '', ''],
          }}
        >
          <Form.Item
            name="content"
            label="题目内容"
            rules={[{ required: true, message: '请输入题目内容' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入题目内容" />
          </Form.Item>

          <Form.Item
            name="type"
            label="题目类型"
            rules={[{ required: true, message: '请选择题目类型' }]}
          >
            <Radio.Group>
              <Radio value="single">单选题</Radio>
              <Radio value="multiple">多选题</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.List name="options">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Form.Item
                    label={index === 0 ? '选项' : ''}
                    required={true}
                    key={field.key}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                      <Form.Item
                        {...field}
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: "请输入选项内容或删除此选项",
                          },
                        ]}
                        noStyle
                      >
                        <Input placeholder={`选项 ${index + 1}`} style={{ width: '90%' }} />
                      </Form.Item>
                      {fields.length > 2 && (
                        <Button
                          type="link"
                          onClick={() => remove(field.name)}
                          style={{ marginLeft: 8 }}
                        >
                          删除
                        </Button>
                      )}
                    </div>
                  </Form.Item>
                ))}
                {fields.length < 6 && (
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block>
                      添加选项
                    </Button>
                  </Form.Item>
                )}
              </>
            )}
          </Form.List>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.type !== currentValues.type || 
              prevValues.options !== currentValues.options
            }
          >
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              const options = getFieldValue('options')?.filter(Boolean) || [];
              
              return type === 'single' ? (
                <Form.Item
                  name="singleAnswer"
                  label="正确答案"
                  rules={[{ required: true, message: '请选择正确答案' }]}
                >
                  <Select 
                    placeholder="请选择正确答案"
                    options={options.map((option: string) => ({
                      label: option,
                      value: option,
                    }))}
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  name="multipleAnswer"
                  label="正确答案"
                  rules={[{ required: true, message: '请选择正确答案' }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="请选择正确答案"
                    style={{ width: '100%' }}
                    options={options.map((option: string) => ({
                      label: option,
                      value: option,
                    }))}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ExerciseSetManagementPage;
