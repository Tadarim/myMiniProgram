/* eslint-disable @typescript-eslint/no-inferrable-types */
import React, { useRef, useState, useEffect } from "react";
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
  Modal,
  Table,
  Space,
  Tag,
  message,
  Form,
  Input,
  Upload,
} from "antd";
import {
  getCourseList,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseDetail,
  updateChapter,
  reviewMaterial,
  deleteMaterial,
  getChapterDetail,
  deleteChapter,
  createChapter,
} from "@api/course";
import { uploadFile } from "@api/upload";
import type {
  CourseItem,
  MaterialType,
  Material,
  Chapter,
} from "@/types/course";

const CourseManagementPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [isChapterModalVisible, setIsChapterModalVisible] = useState(false);
  const [isMaterialModalVisible, setIsMaterialModalVisible] = useState(false);
  const [isEditChapterModalVisible, setIsEditChapterModalVisible] =
    useState(false);
  const [isAddCourseModalVisible, setIsAddCourseModalVisible] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<CourseItem | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [courseList, setCourseList] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const chapterForm = Form.useForm()[0];
  const courseForm = Form.useForm()[0];

  const fetchCourseList = async () => {
    setLoading(true);
    try {
      const res = await getCourseList({
        page: 1,
        pageSize: 10,
      });
      if (res && res.success) {
        setCourseList(res.data);
      }
    } catch (error) {
      message.error("获取课程列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseList();
  }, []);

  const handleSearch = async (params: any) => {
    const { title } = params;
    if (!title) {
      return {
        data: courseList,
        success: true,
        total: courseList.length,
      };
    }

    const filteredData = courseList.filter((item) =>
      item.title.toLowerCase().includes(title.toLowerCase())
    );

    return {
      data: filteredData,
      success: true,
      total: filteredData.length,
    };
  };

  const renderMaterialTypeTag = (type: MaterialType) => {
    if (!type) return null;
    const typeColors: Record<MaterialType, string> = {
      video: "blue",
      pdf: "red",
      ppt: "orange",
    };
    const typeNames: Record<MaterialType, string> = {
      video: "视频",
      pdf: "PDF",
      ppt: "PPT",
    };
    const color = typeColors[type] || "default";
    const name = typeNames[type] || "未知";
    return <Tag color={color}>{name}</Tag>;
  };

  const handleAddChapter = async (values: { title: string }) => {
    if (!currentCourse) return;

    try {
      const res = await createChapter({
        courseId: currentCourse.id,
        title: values.title,
      });

      if (res.success && res.data) {
        const newChapter: Chapter = {
          id: res.data.id,
          title: res.data.title,
          order: currentCourse.chapters.length + 1,
          materials: [],
        };

        const updatedCourse = {
          ...currentCourse,
          chapters: [...currentCourse.chapters, newChapter],
        };
        setCurrentCourse(updatedCourse);
        setCourseList((prevList) =>
          prevList.map((course) =>
            course.id === currentCourse.id
              ? { ...course, chapters: [...course.chapters, newChapter] }
              : course
          )
        );

        message.success("添加章节成功");
        setIsEditChapterModalVisible(false);
        chapterForm.resetFields();
      } else {
        message.error(res.message || "添加章节失败");
      }
    } catch (error) {
      message.error("添加章节失败，请重试");
    }
  };

  const handleEditChapter = async (values: { title: string }) => {
    if (!currentCourse || !currentChapter) return;

    try {
      setCurrentCourse((prevCourse) => {
        if (!prevCourse) return null;
        return {
          ...prevCourse,
          chapters: prevCourse.chapters.map((chapter) =>
            chapter.id === currentChapter.id
              ? { ...chapter, title: values.title }
              : chapter
          ),
        };
      });

      const res = await updateChapter(currentChapter.id, {
        title: values.title,
      });

      if (res.success) {
        message.success("更新章节成功");
        setIsEditChapterModalVisible(false);
        chapterForm.resetFields();
      } else {
        message.error(res.message || "更新章节失败");
        setCurrentCourse((prevCourse) => {
          if (!prevCourse) return null;
          return {
            ...prevCourse,
            chapters: prevCourse.chapters.map((chapter) =>
              chapter.id === currentChapter.id
                ? { ...chapter, title: currentChapter.title }
                : chapter
            ),
          };
        });
      }
    } catch (error) {
      message.error("更新章节失败，请重试");
      setCurrentCourse((prevCourse) => {
        if (!prevCourse) return null;
        return {
          ...prevCourse,
          chapters: prevCourse.chapters.map((chapter) =>
            chapter.id === currentChapter.id
              ? { ...chapter, title: currentChapter.title }
              : chapter
          ),
        };
      });
    }
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (!currentCourse) return;

    Modal.confirm({
      title: "确定要删除该章节吗？",
      content: "删除后将无法恢复，该章节下的所有资料也将被删除！",
      onOk: async () => {
        try {
          const res = await deleteChapter(chapterId);
          if (res.success) {
            const updatedChapters = currentCourse.chapters.filter(
              (chapter: Chapter) => chapter.id !== chapterId
            );
            setCurrentCourse({
              ...currentCourse,
              chapters: updatedChapters,
            });

            setCourseList((prevList) =>
              prevList.map((course) =>
                course.id === currentCourse.id
                  ? { ...course, chapters: updatedChapters }
                  : course
              )
            );

            message.success(res.message || "删除章节成功");
          } else {
            message.error(res.message || "删除章节失败");
          }
        } catch (error) {
          message.error("删除章节失败，请重试");
        }
      },
    });
  };

  const handleUploadMaterial = async (file: File) => {
    try {
      if (file.size === 0) {
        message.error("文件大小为0，请选择有效的文件");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("chapterId", currentChapter?.id || "");
      formData.append("fileName", file.name);

      const token = JSON.parse(localStorage.getItem("userInfo") || "{}").state
        .token;
      if (!token) {
        message.error("未登录或登录已过期");
        return;
      }

      formData.append("token", token);

      console.log("开始上传文件:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      const response = await uploadFile(formData);
      console.log("上传响应:", response);

      if (response.success && currentChapter) {
        const newMaterial: Material = {
          id: response.data.id.toString(),
          title: response.data.fileName,
          type: response.data.fileType as MaterialType,
          url: response.data.url,
          uploadTime: response.data.created_at,
          status: "pending",
          isSystem: false,
        };

        setCurrentChapter((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            materials: [...prev.materials, newMaterial],
          };
        });

        message.success("上传成功，等待审核");
      } else {
        message.error(response.message || "上传失败");
      }
    } catch (error) {
      console.error("上传文件失败:", error);
      message.error("上传文件失败，请重试");
    }
  };

  const handleReviewMaterial = async (
    chapterId: string,
    materialId: string,
    approved: boolean
  ) => {
    if (!currentCourse) return;

    Modal.confirm({
      title: "确认审核",
      content: `确定要${approved ? "通过" : "拒绝"}这个资料吗？`,
      onOk: async () => {
        try {
          const res = await reviewMaterial(materialId, approved);
          if (res.success) {
            const chapterRes = await getChapterDetail(chapterId);
            if (chapterRes.success && chapterRes.data) {
              setCurrentChapter(chapterRes.data);

              setCurrentCourse((prevCourse) => {
                if (!prevCourse) return null;
                const updatedChapters = prevCourse.chapters.map((chapter) =>
                  chapter.id === chapterId ? chapterRes.data : chapter
                ) as Chapter[];
                return {
                  ...prevCourse,
                  chapters: updatedChapters,
                };
              });
            }

            message.success(`${approved ? "通过" : "拒绝"}成功`);
          }
        } catch (error) {
          message.error("审核失败");
        }
      },
    });
  };

  const handleDeleteMaterial = async (
    chapterId: string,
    materialId: string
  ) => {
    if (!currentCourse) return;

    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这个资料吗？删除后将无法恢复！",
      onOk: async () => {
        try {
          const res = await deleteMaterial(materialId);
          if (res.success) {
            setCurrentCourse((prevCourse) => {
              if (!prevCourse) return null;
              return {
                ...prevCourse,
                chapters: prevCourse.chapters.map((chapter) => {
                  if (chapter.id === chapterId) {
                    return {
                      ...chapter,
                      materials: chapter.materials.filter(
                        (material) => material.id !== materialId
                      ),
                    };
                  }
                  return chapter;
                }),
              };
            });

            if (currentChapter?.id === chapterId) {
              setCurrentChapter((prevChapter) => {
                if (!prevChapter) return null;
                return {
                  ...prevChapter,
                  materials: prevChapter.materials.filter(
                    (material) => material.id !== materialId
                  ),
                };
              });
            }

            message.success("删除成功");
          } else {
            message.error(res.message || "删除失败");
          }
        } catch (error) {
          message.error("删除失败，请重试");
        }
      },
    });
  };

  const handleAddCourse = async (values: any) => {
    try {
      let coverUrl = "";
      if (values.cover) {
        const formData = new FormData();
        formData.append("file", values.cover.file);
        formData.append("type", "course_cover");
        const uploadRes = await uploadFile(formData);
        if (!uploadRes.success) {
          message.error("封面图片上传失败");
          return;
        }
        coverUrl = uploadRes.data.url;
      }

      const res = await createCourse({
        title: values.title,
        description: values.description,
        status: "draft",
        cover: coverUrl,
      });
      if (res.success) {
        message.success("新增课程成功");
        setIsAddCourseModalVisible(false);
        courseForm.resetFields();
        fetchCourseList();
      } else {
        message.error(res.message || "新增课程失败");
      }
    } catch (error) {
      console.error("创建课程失败:", error);
      message.error("创建课程失败");
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const res = await deleteCourse(courseId);
      if (res.success) {
        message.success("删除成功");
        setCourseList((prevList) =>
          prevList.filter((course) => course.id !== courseId)
        );
        actionRef.current?.reload();
      } else {
        message.error(res.message || "删除失败");
      }
    } catch (error) {
      message.error("删除失败，请重试");
    }
  };

  const handleGetCourseDetail = async (courseId: string) => {
    try {
      const res = await getCourseDetail(courseId);
      if (res && res.success && res.data) {
        setCurrentCourse(res.data);
        setIsChapterModalVisible(true);
      } else {
        message.error("获取课程详情失败");
      }
    } catch (error) {
      message.error("获取课程详情失败");
    }
  };

  const materialColumns = [
    {
      title: "资料名称",
      dataIndex: "title",
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
      render: (status?: "pending" | "approved" | "rejected") => {
        const statusMap = {
          pending: { color: "orange", text: "待审核" },
          approved: { color: "green", text: "已通过" },
          rejected: { color: "red", text: "已拒绝" },
          default: { color: "default", text: "未知" },
        };
        const currentStatus = status || "default";
        return (
          <Tag color={statusMap[currentStatus]?.color}>
            {statusMap[currentStatus].text}
          </Tag>
        );
      },
    },
    {
      title: "上传时间",
      dataIndex: "upload_time",
      render: (time: string) => {
        if (!time) return "-";
        try {
          const date = new Date(time);
          if (isNaN(date.getTime())) {
            const formattedTime = time.replace(" ", "T");
            const newDate = new Date(formattedTime);
            return isNaN(newDate.getTime()) ? "-" : newDate.toLocaleString();
          }
          return date.toLocaleString();
        } catch (error) {
          return "-";
        }
      },
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, material: Material) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              if (material.url) {
                try {
                  new URL(material.url);
                  window.open(material.url, "_blank");
                } catch (error) {
                  message.error("无效的URL地址");
                }
              } else {
                message.error("资料URL不存在");
              }
            }}
            disabled={!material.url}
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
      dataIndex: "title",
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
      dataIndex: "id",
      copyable: true,
      width: 120,
    },
    {
      title: "课程名称",
      dataIndex: "title",
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
      title: "课程评分",
      dataIndex: "rating",
      width: 100,
      render: (_, record) => {
        const rating = Number(record.rating);
        return `${isNaN(rating) ? 0 : rating.toFixed(1)}分`;
      },
      sorter: (a, b) => {
        const ratingA = Number(a.rating);
        const ratingB = Number(b.rating);
        return (isNaN(ratingA) ? 0 : ratingA) - (isNaN(ratingB) ? 0 : ratingB);
      },
      formItemProps: {
        rules: [
          {
            required: true,
            message: "此项为必填项",
          },
          {
            type: "number",
            min: 0,
            max: 5,
            message: "评分必须在0-5分之间",
          },
        ],
      },
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
      dataIndex: "status",
      width: 100,
      valueEnum: {
        draft: { text: "草稿", status: "Default" },
        published: { text: "已发布", status: "Success" },
        archived: { text: "已归档", status: "Error" },
      },
    },
    {
      title: "操作",
      valueType: "option",
      width: 280,
      render: (_, record) => [
        <Button
          key="chapters"
          type="link"
          icon={<FolderOutlined />}
          onClick={() => handleGetCourseDetail(record.id)}
        >
          章节管理
        </Button>,
        record.status === "draft" && (
          <Button
            key="publish"
            type="link"
            onClick={() => handleUpdateCourseStatus(record.id, "published")}
          >
            发布
          </Button>
        ),
        record.status === "published" && (
          <Button
            key="archive"
            type="link"
            danger
            onClick={() => handleUpdateCourseStatus(record.id, "archived")}
          >
            归档
          </Button>
        ),
        <Button
          key="delete"
          type="link"
          danger
          onClick={() => {
            Modal.confirm({
              title: "确定要删除该课程吗？",
              content: "删除后将无法恢复，请谨慎操作！",
              onOk: () => handleDeleteCourse(record.id),
            });
          }}
        >
          删除
        </Button>,
      ],
    },
  ];

  const handleUpdateCourseStatus = async (
    courseId: string,
    status: "draft" | "published" | "archived"
  ) => {
    try {
      setCourseList((prevList) =>
        prevList.map((course) =>
          course.id === courseId ? { ...course, status } : course
        )
      );
      actionRef.current?.reload();

      const res = await updateCourse(courseId, {
        status,
      });
      if (res.success) {
        message.success(status === "published" ? "课程已发布" : "课程已归档");
      } else {
        message.error(res.message || "操作失败");
        setCourseList((prevList) =>
          prevList.map((course) =>
            course.id === courseId
              ? { ...course, status: course.status }
              : course
          )
        );
        actionRef.current?.reload();
      }
    } catch (error) {
      message.error("操作失败，请重试");
      setCourseList((prevList) =>
        prevList.map((course) =>
          course.id === courseId ? { ...course, status: course.status } : course
        )
      );
      actionRef.current?.reload();
    }
  };

  return (
    <>
      <ProTable<CourseItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        loading={loading}
        dataSource={courseList}
        request={async (params) => {
          const result = await handleSearch(params);
          return {
            data: result.data,
            success: result.success,
            total: result.total,
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
              setIsAddCourseModalVisible(true);
            }}
          >
            新增课程
          </Button>,
        ]}
      />

      <Modal
        title="新增课程"
        visible={isAddCourseModalVisible}
        onCancel={() => setIsAddCourseModalVisible(false)}
        onOk={() => courseForm.submit()}
      >
        <Form form={courseForm} onFinish={handleAddCourse} layout="vertical">
          <Form.Item
            name="title"
            label="课程名称"
            rules={[{ required: true, message: "请输入课程名称" }]}
          >
            <Input placeholder="请输入课程名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="课程描述"
            rules={[{ required: true, message: "请输入课程描述" }]}
          >
            <Input.TextArea placeholder="请输入课程描述" />
          </Form.Item>
          <Form.Item
            name="cover"
            label="课程封面"
            rules={[{ required: true, message: "请上传课程封面" }]}
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith("image/");
                if (!isImage) {
                  message.error("只能上传图片文件！");
                  return Upload.LIST_IGNORE;
                }
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                  message.error("图片大小不能超过 2MB！");
                  return Upload.LIST_IGNORE;
                }
                return false;
              }}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传封面</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`${currentCourse?.title || ""} - 章节管理`}
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
            name="title"
            label="章节名称"
            rules={[{ required: true, message: "请输入章节名称" }]}
          >
            <Input placeholder="请输入章节名称" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`${currentChapter?.title || ""} - 资料管理`}
        visible={isMaterialModalVisible}
        onCancel={() => setIsMaterialModalVisible(false)}
        width={800}
        footer={[
          <Upload
            key="upload"
            showUploadList={false}
            customRequest={({ file }) => {
              if (currentChapter) {
                handleUploadMaterial(file as File);
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
          dataSource={
            currentChapter?.materials?.map((material) => {
              return {
                ...material,
                status: material.status || "pending",
              };
            }) || []
          }
          rowKey="id"
          pagination={false}
        />
      </Modal>
    </>
  );
};

export default CourseManagementPage;
