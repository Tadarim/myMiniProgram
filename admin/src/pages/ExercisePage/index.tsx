import React, { useEffect, useRef, useState } from "react";
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
import {
  getExerciseSets,
  createExerciseSet,
  updateExerciseSet,
  deleteExerciseSet,
  getExerciseSetDetail,
  addQuestion,
  deleteQuestion,
  ExerciseSet,
  ExerciseSetDetail,
} from "@/api/exercise";

const ExerciseSetManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [questionForm] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [allExerciseSets, setAllExerciseSets] = useState<ExerciseSet[]>([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [currentExerciseSet, setCurrentExerciseSet] =
    useState<ExerciseSetDetail | null>(null);
  const [modalTitle, setModalTitle] = useState("新增习题集");
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");

  useEffect(() => {
    fetchExerciseSets();
  }, []);

  const fetchExerciseSets = async () => {
    setLoading(true);
    try {
      const response = await getExerciseSets({});
      if (response.success && response.data) {
        setAllExerciseSets(response.data);
      }
    } catch (error) {
      message.error("获取习题集列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (params: any) => {
    try {
      let filteredData = [...allExerciseSets];

      if (params.title) {
        filteredData = filteredData.filter((item) =>
          item.title.toLowerCase().includes(params.title.toLowerCase())
        );
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

  const handleDeleteExerciseSet = async (id: number) => {
    try {
      const response = await deleteExerciseSet(id);
      if (response.success) {
        message.success("删除成功");
        fetchExerciseSets();
        return true;
      } else {
        message.error(response.message || "删除失败");
        return false;
      }
    } catch (error) {
      message.error("删除失败");
      return false;
    }
  };

  const handleSaveExerciseSet = async (
    values: any,
    mode: "add" | "edit",
    currentId?: number
  ) => {
    try {
      let response;
      if (mode === "add") {
        response = await createExerciseSet({
          title: values.title,
          description: values.description,
        });
      } else if (mode === "edit" && currentId) {
        response = await updateExerciseSet(currentId, {
          title: values.title,
          description: values.description,
        });
      }

      if (response?.success) {
        message.success("保存成功");
        fetchExerciseSets();
        if (actionRef.current) {
          actionRef.current.reload();
        }
        return true;
      } else {
        message.error(response?.message || "保存失败");
        return false;
      }
    } catch (error) {
      message.error("保存失败");
      return false;
    }
  };

  const handleDeleteQuestion = async (
    exerciseSetId: number,
    questionId: number
  ) => {
    try {
      const response = await deleteQuestion(exerciseSetId, questionId);
      if (response.success) {
        message.success("删除题目成功");
        fetchExerciseSets();
        return true;
      } else {
        message.error(response.message || "删除题目失败");
        return false;
      }
    } catch (error) {
      message.error("删除题目失败");
      return false;
    }
  };

  const handleViewQuestions = async (record: ExerciseSet) => {
    try {
      const response = await getExerciseSetDetail(record.id);
      if (response.success && response.data) {
        setCurrentExerciseSet(response.data);
        setIsViewModalVisible(true);
      } else {
        message.error(response.message || "获取习题集详情失败");
      }
    } catch (error) {
      message.error("获取习题集详情失败");
    }
  };

  const handleEditExerciseSet = async (record: ExerciseSet) => {
    setLoading(true);
    try {
      const response = await getExerciseSetDetail(record.id);
      if (response.success && response.data) {
        setCurrentExerciseSet(response.data);
        setModalTitle("编辑习题集");
        setModalMode("edit");
        form.setFieldsValue({
          title: response.data.title,
          description: response.data.description,
        });
        setIsModalVisible(true);
      } else {
        message.error(response.message || "获取习题集详情失败");
      }
    } catch (error) {
      message.error("获取习题集详情失败");
    } finally {
      setLoading(false);
    }
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
      const success = await handleSaveExerciseSet(
        values,
        modalMode,
        currentExerciseSet?.id
      );
      if (success) {
        setIsModalVisible(false);
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
        answer:
          values.type === "single"
            ? [values.singleAnswer]
            : values.multipleAnswer,
      };

      const response = await addQuestion(currentExerciseSet.id, newQuestion);
      if (response.success) {
        const updatedSet = await getExerciseSetDetail(currentExerciseSet.id);
        if (updatedSet.success && updatedSet.data) {
          setCurrentExerciseSet(updatedSet.data);
        }
        setIsQuestionModalVisible(false);
        message.success("添加题目成功");
        fetchExerciseSets();
      } else {
        message.error(response.message || "添加题目失败");
      }
    } catch (error) {
      message.error("添加题目失败");
    }
  };

  const handleQuestionDelete = async (
    exerciseSetId: number,
    questionId: number
  ) => {
    const success = await handleDeleteQuestion(exerciseSetId, questionId);
    if (success) {
      const updatedSet = await getExerciseSetDetail(exerciseSetId);
      if (updatedSet.success && updatedSet.data) {
        setCurrentExerciseSet(updatedSet.data);
      }
    }
  };

  const renderQuestionsList = () => {
    if (!currentExerciseSet?.questions) return null;

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
              <span style={{ marginLeft: 8, color: "#999", fontSize: "12px" }}>
                ID: {question.id}
              </span>
            </div>

            {question.type === "single" ? (
              <Radio.Group value={question.answer[0] as string} disabled>
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
      search: false,
      width: 100,
      align: "center",
    },
    {
      title: "习题集名称",
      dataIndex: "title",
      ellipsis: true,
      width: 200,
    },
    {
      title: "题目数量",
      dataIndex: "question_count",
      search: false,
      width: 100,
      align: "center",
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      search: false,
      width: 180,
      valueType: "dateTime",
    },
    {
      title: "操作",
      key: "action",
      search: false,
      width: 240,
      align: "center",
      render: (_, record) => (
        <Space size="middle">
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
        loading={loading}
        request={handleSearch}
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
        <Form form={form} layout="vertical">
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
                {currentExerciseSet?.questions?.map((question, index) => (
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
                      <span
                        style={{
                          marginLeft: 8,
                          color: "#999",
                          fontSize: "12px",
                        }}
                      >
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
                            handleQuestionDelete(
                              currentExerciseSet.id,
                              question.id
                            );
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
            type: "single",
            options: ["", "", "", ""],
            singleAnswer: "",
            multipleAnswer: [],
          }}
        >
          <Form.Item
            name="content"
            label="题目内容"
            rules={[{ required: true, message: "请输入题目内容" }]}
          >
            <Input.TextArea rows={4} placeholder="请输入题目内容" />
          </Form.Item>

          <Form.Item
            name="type"
            label="题目类型"
            rules={[{ required: true, message: "请选择题目类型" }]}
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
                    label={index === 0 ? "选项" : ""}
                    required={true}
                    key={field.key}
                  >
                    <div style={{ display: "flex", alignItems: "baseline" }}>
                      <Form.Item
                        {...field}
                        validateTrigger={["onChange", "onBlur"]}
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: "请输入选项内容或删除此选项",
                          },
                        ]}
                        noStyle
                      >
                        <Input
                          placeholder={`选项 ${index + 1}`}
                          style={{ width: "90%" }}
                        />
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
              const type = getFieldValue("type");
              const options = getFieldValue("options")?.filter(Boolean) || [];

              return type === "single" ? (
                <Form.Item
                  name="singleAnswer"
                  label="正确答案"
                  rules={[{ required: true, message: "请选择正确答案" }]}
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
                  rules={[{ required: true, message: "请选择正确答案" }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="请选择正确答案"
                    style={{ width: "100%" }}
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
