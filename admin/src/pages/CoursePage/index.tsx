/* eslint-disable @typescript-eslint/no-inferrable-types */
import React, { useRef, useState } from "react";
import {
  PlusOutlined,
  FolderOutlined,
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import {
  Button,
  Switch,
  Modal,
  Table,
  Space,
  Tag,
  message,
  Form,
  Input,
  Upload,
} from "antd";

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

type MaterialType = "video" | "pdf" | "ppt";

interface Material {
  id: string;
  name: string;
  type: MaterialType;
  url: string;
  uploadTime: string;
  status: "pending" | "approved" | "rejected";
  isSystem: boolean;
}

interface Chapter {
  id: string;
  name: string;
  order: number;
  materials: Material[];
}

interface CourseItem {
  id: string;
  courseName: string;
  courseId: string;
  description: string;
  chapters: Chapter[];
  created_at: string;
  isVisible: boolean;
}

const mockCourses: CourseItem[] = [
  {
    id: "1",
    courseName: "高等数学",
    courseId: "MATH101",
    description: "微积分与线性代数基础",
    created_at: "2025-01-10",
    isVisible: true,
    chapters: [
      {
        id: "c1",
        name: "第一章：函数与极限",
        order: 1,
        materials: [
          {
            id: "m1",
            name: "1.1 函数概念",
            type: "video",
            url: "https://www.w3schools.com/html/mov_bbb.mp4",
            uploadTime: "2025-01-10",
            status: "approved",
            isSystem: true,
          },
          {
            id: "m2",
            name: "第一章PPT",
            type: "ppt",
            url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            uploadTime: "2025-01-10",
            status: "approved",
            isSystem: true,
          },
          {
            id: "m5",
            name: "函数极限补充资料",
            type: "pdf",
            url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            uploadTime: "2024-03-20",
            status: "pending",
            isSystem: false,
          },
        ],
      },
      {
        id: "c2",
        name: "第二章：导数与微分",
        order: 2,
        materials: [
          {
            id: "m3",
            name: "2.1 导数定义",
            type: "video",
            url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            uploadTime: "2025-01-11",
            status: "approved",
            isSystem: true,
          },
          {
            id: "m4",
            name: "第二章讲义",
            type: "pdf",
            url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            uploadTime: "2025-01-11",
            status: "approved",
            isSystem: true,
          },
          {
            id: "m6",
            name: "导数应用实例",
            type: "video",
            url: "https://www.w3schools.com/html/mov_bbb.mp4",
            uploadTime: "2024-03-20",
            status: "pending",
            isSystem: false,
          },
          {
            id: "m7",
            name: "微分习题集",
            type: "pdf",
            url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            uploadTime: "2024-03-20",
            status: "rejected",
            isSystem: false,
          },
        ],
      },
    ],
  },
];

const mockVideos = [
  {
    id: "v1",
    name: "1.1 函数概念",
    url: "https://www.w3schools.com/html/mov_bbb.mp4", // 示例视频
    type: "video",
    uploadTime: "2024-03-20",
  },
  {
    id: "v2",
    name: "1.2 极限与连续",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", // 开源示例视频
    type: "video",
    uploadTime: "2024-03-20",
  },
];

const mockFiles = [
  {
    id: "f1",
    name: "第一章讲义.pdf",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", // 示例PDF
    type: "pdf",
    uploadTime: "2024-03-20",
  },
  {
    id: "f2",
    name: "第一章PPT.pptx",
    url: "https://download.microsoft.com/download/0/B/E/0BE8BDD7-E5E8-422A-ABFD-4342ED7AD886/Windows10_1607_English_x64.iso", // 示例文件
    type: "ppt",
    uploadTime: "2024-03-20",
  },
];

const CourseManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [isChapterModalVisible, setIsChapterModalVisible] = useState(false);
  const [isMaterialModalVisible, setIsMaterialModalVisible] = useState(false);
  const [isEditChapterModalVisible, setIsEditChapterModalVisible] =
    useState(false);
  const [currentCourse, setCurrentCourse] = useState<CourseItem | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [chapterForm] = Form.useForm();

  const renderMaterialTypeTag = (type: MaterialType) => {
    const typeColors = {
      video: "blue",
      pdf: "red",
      ppt: "orange",
    };
    const typeNames = {
      video: "视频",
      pdf: "PDF",
      ppt: "PPT",
    };
    return <Tag color={typeColors[type]}>{typeNames[type]}</Tag>;
  };

  const handleAddChapter = async (values: any) => {
    if (!currentCourse) return;

    const newChapter: Chapter = {
      id: Date.now().toString(), // 简单的ID生成
      name: values.name,
      order: currentCourse.chapters.length + 1,
      materials: [],
    };

    // 更新课程的章节列表
    const updatedCourse = {
      ...currentCourse,
      chapters: [...currentCourse.chapters, newChapter],
    };
    setCurrentCourse(updatedCourse);

    message.success("添加章节成功");
    setIsEditChapterModalVisible(false);
    chapterForm.resetFields();
  };

  const handleEditChapter = async (values: any) => {
    if (!currentCourse || !currentChapter) return;

    const updatedChapters = currentCourse.chapters.map((chapter) =>
      chapter.id === currentChapter.id
        ? { ...chapter, name: values.name }
        : chapter
    );

    setCurrentCourse({
      ...currentCourse,
      chapters: updatedChapters,
    });

    message.success("更新章节成功");
    setIsEditChapterModalVisible(false);
    chapterForm.resetFields();
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (!currentCourse) return;

    Modal.confirm({
      title: "确定要删除该章节吗？",
      content: "删除后将无法恢复，该章节下的所有资料也将被删除！",
      onOk: () => {
        const updatedChapters = currentCourse.chapters.filter(
          (chapter) => chapter.id !== chapterId
        );
        setCurrentCourse({
          ...currentCourse,
          chapters: updatedChapters,
        });
        message.success("删除章节成功");
      },
    });
  };

  const handleUploadMaterial = async (
    chapterId: string,
    file: any,
    type: MaterialType
  ) => {
    if (!currentCourse) return;

    const newMaterial: Material = {
      id: Date.now().toString(),
      name: file.name,
      type,
      url:
        type === "video"
          ? mockVideos[Math.floor(Math.random() * mockVideos.length)].url
          : mockFiles[Math.floor(Math.random() * mockFiles.length)].url,
      uploadTime: new Date().toISOString(),
      status: "pending",
      isSystem: false,
    };

    // 更新章节的资料列表
    const updatedChapters = currentCourse.chapters.map((chapter) => {
      if (chapter.id === chapterId) {
        return {
          ...chapter,
          materials: [...chapter.materials, newMaterial],
        };
      }
      return chapter;
    });

    const updatedCourse = {
      ...currentCourse,
      chapters: updatedChapters,
    };

    setCurrentCourse(updatedCourse);

    // 更新当前章节
    const updatedChapter = updatedChapters.find(
      (chapter) => chapter.id === chapterId
    );
    if (updatedChapter) {
      setCurrentChapter(updatedChapter);
    }

    message.success("上传资料成功，等待审核");
  };

  // 添加审核资料函数
  const handleReviewMaterial = (
    chapterId: string,
    materialId: string,
    approved: boolean
  ) => {
    if (!currentCourse) return;

    const updatedChapters = currentCourse.chapters.map((chapter) => {
      if (chapter.id === chapterId) {
        return {
          ...chapter,
          materials: chapter.materials.map((material) => {
            if (material.id === materialId) {
              return {
                ...material,
                status: approved ? "approved" : "rejected",
              };
            }
            return material;
          }),
        };
      }
      return chapter;
    });

    const updatedCourse = {
      ...currentCourse,
      chapters: updatedChapters,
    };

    setCurrentCourse(updatedCourse);

    // 更新当前章节
    const updatedChapter = updatedChapters.find(
      (chapter) => chapter.id === chapterId
    );
    if (updatedChapter) {
      setCurrentChapter(updatedChapter);
    }

    message.success(`资料已${approved ? "通过" : "拒绝"}审核`);
  };

  const handleDeleteMaterial = (chapterId: string, materialId: string) => {
    if (!currentCourse) return;

    Modal.confirm({
      title: "确定要删除该资料吗？",
      content: "删除后将无法恢复！",
      onOk: () => {
        const updatedChapters = currentCourse.chapters.map((chapter) => {
          if (chapter.id === chapterId) {
            return {
              ...chapter,
              materials: chapter.materials.filter(
                (material) => material.id !== materialId
              ),
            };
          }
          return chapter;
        });

        const updatedCourse = {
          ...currentCourse,
          chapters: updatedChapters,
        };

        setCurrentCourse(updatedCourse);

        // 更新当前章节
        const updatedChapter = updatedChapters.find(
          (chapter) => chapter.id === chapterId
        );
        if (updatedChapter) {
          setCurrentChapter(updatedChapter);
        }

        message.success("删除资料成功");
      },
    });
  };

  // 资料列表列定义
  const materialColumns = [
    {
      title: "资料名称",
      dataIndex: "name",
    },
    {
      title: "类型",
      dataIndex: "type",
      render: (type: MaterialType) => renderMaterialTypeTag(type),
    },
    {
      title: "来源",
      dataIndex: "isSystem",
      render: (isSystem: boolean) => (
        <Tag color={isSystem ? "blue" : "green"}>
          {isSystem ? "系统资料" : "用户上传"}
        </Tag>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      render: (status: "pending" | "approved" | "rejected") => {
        const statusMap = {
          pending: { color: "orange", text: "待审核" },
          approved: { color: "green", text: "已通过" },
          rejected: { color: "red", text: "已拒绝" },
        };
        return (
          <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
        );
      },
    },
    {
      title: "上传时间",
      dataIndex: "uploadTime",
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, material: Material) => (
        <Space>
          <Button
            type="link"
            onClick={() => window.open(material.url, "_blank")}
          >
            查看
          </Button>
          {!material.isSystem && material.status === "pending" && (
            <>
              <Button
                type="link"
                onClick={() =>
                  handleReviewMaterial(currentChapter!.id, material.id, true)
                }
              >
                通过
              </Button>
              <Button
                type="link"
                danger
                onClick={() =>
                  handleReviewMaterial(currentChapter!.id, material.id, false)
                }
              >
                拒绝
              </Button>
            </>
          )}
          <Button
            type="link"
            danger
            onClick={() =>
              currentChapter &&
              handleDeleteMaterial(currentChapter.id, material.id)
            }
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const chapterColumns = [
    {
      title: "章节ID",
      dataIndex: "id",
      width: 100,
    },
    {
      title: "章节名称",
      dataIndex: "name",
    },
    {
      title: "资料数量",
      dataIndex: "materials",
      render: (materials: Material[]) => materials.length,
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, chapter: Chapter) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentChapter(chapter);
              chapterForm.setFieldsValue(chapter);
              setIsEditChapterModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<FolderOutlined />}
            onClick={() => {
              setCurrentChapter(chapter);
              setIsMaterialModalVisible(true);
            }}
          >
            管理资料
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteChapter(chapter.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const columns: ProColumns<CourseItem>[] = [
    {
      dataIndex: "index",
      valueType: "indexBorder",
      width: 48,
    },
    {
      title: "课程ID",
      dataIndex: "courseId",
      copyable: true,
      width: 120,
    },
    {
      title: "课程名称",
      dataIndex: "courseName",
      copyable: true,
      ellipsis: true,
      width: 200,
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
      title: "章节数量",
      dataIndex: "chapters",
      width: 100,
      render: (_, record) => record.chapters.length,
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      valueType: "date",
      width: 120,
      sorter: true,
      hideInSearch: true,
    },
    {
      title: "发布状态",
      dataIndex: "isVisible",
      width: 100,
      render: (_, record) => (
        <Switch
          checked={record.isVisible}
          onChange={(checked) => {
            // 更新课程状态
            const updatedCourses = mockCourses.map((course) => {
              if (course.id === record.id) {
                return {
                  ...course,
                  isVisible: checked,
                };
              }
              return course;
            });
            // 更新mockCourses
            mockCourses.length = 0;
            mockCourses.push(...updatedCourses);
            message.success(`课程已${checked ? "发布" : "下架"}`);
            // 刷新表格
            actionRef.current?.reload();
          }}
        />
      ),
    },
    {
      title: "操作",
      valueType: "option",
      width: 180,
      render: (_, record) => [
        <Button
          key="chapters"
          type="link"
          icon={<FolderOutlined />}
          onClick={() => {
            setCurrentCourse(record);
            setIsChapterModalVisible(true);
          }}
        >
          章节管理
        </Button>,
        <Button
          key="delete"
          type="link"
          danger
          onClick={() => {
            Modal.confirm({
              title: "确定要删除该课程吗？",
              content: "删除后将无法恢复，请谨慎操作！",
              onOk: () => {
                // 从mockCourses中删除课程
                const updatedCourses = mockCourses.filter(
                  (course) => course.id !== record.id
                );
                // 更新mockCourses
                mockCourses.length = 0;
                mockCourses.push(...updatedCourses);
                message.success("删除成功");
                // 刷新表格
                actionRef.current?.reload();
              },
            });
          }}
        >
          删除
        </Button>,
      ],
    },
  ];

  return (
    <>
      <ProTable<CourseItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params) => {
          await waitTime(500);
          let filteredData = [...mockCourses];

          if (params.courseName) {
            filteredData = filteredData.filter((course) =>
              course.courseName.includes(params.courseName)
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
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              // 打开新增课程表单
            }}
          >
            新增课程
          </Button>,
        ]}
      />

      {/* 章节管理弹窗 */}
      <Modal
        title={`${currentCourse?.courseName || ""} - 章节管理`}
        visible={isChapterModalVisible}
        onCancel={() => setIsChapterModalVisible(false)}
        width={800}
        footer={[
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentChapter(null);
              chapterForm.resetFields();
              setIsEditChapterModalVisible(true);
            }}
          >
            新增章节
          </Button>,
          <Button key="cancel" onClick={() => setIsChapterModalVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        <Table
          columns={chapterColumns}
          dataSource={currentCourse?.chapters || []}
          rowKey="id"
          pagination={false}
        />
      </Modal>

      {/* 新增/编辑章节弹窗 */}
      <Modal
        title={currentChapter ? "编辑章节" : "新增章节"}
        visible={isEditChapterModalVisible}
        onCancel={() => setIsEditChapterModalVisible(false)}
        onOk={() => chapterForm.submit()}
      >
        <Form
          form={chapterForm}
          onFinish={currentChapter ? handleEditChapter : handleAddChapter}
        >
          <Form.Item
            name="name"
            label="章节名称"
            rules={[{ required: true, message: "请输入章节名称" }]}
          >
            <Input placeholder="请输入章节名称" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 资料管理弹窗 */}
      <Modal
        title={`${currentChapter?.name || ""} - 资料管理`}
        visible={isMaterialModalVisible}
        onCancel={() => setIsMaterialModalVisible(false)}
        width={800}
        footer={[
          <Upload
            key="upload"
            showUploadList={false}
            customRequest={({ file }) => {
              if (currentChapter) {
                const fileName = (file as File).name.toLowerCase();
                const fileType = fileName.endsWith(".mp4")
                  ? "video"
                  : fileName.endsWith(".pdf")
                  ? "pdf"
                  : "ppt";
                handleUploadMaterial(currentChapter.id, file, fileType);
              }
            }}
          >
            <Button icon={<UploadOutlined />}>上传资料</Button>
          </Upload>,
          <Button key="cancel" onClick={() => setIsMaterialModalVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        <Table
          columns={materialColumns}
          dataSource={currentChapter?.materials || []}
          rowKey="id"
          pagination={false}
        />
      </Modal>
    </>
  );
};

export default CourseManagementPage;
