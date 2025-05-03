import request from "@utils/request";
import { CourseItem, Chapter } from "@/types/course";
import { ApiResponse } from "@/types/common";

export interface CourseListResponse {
  success: boolean;
  data: CourseItem[];
  total: number;
  message?: string;
}

export interface CourseResponse {
  success: boolean;
  data?: CourseItem;
  message?: string;
}

export interface CourseUpdate {
  title?: string;
  description?: string;
  cover?: string;
  rating?: number;
  status?: "draft" | "published" | "archived";
  publishTime?: string;
}

export interface ChapterUpdate {
  title?: string;
  order?: number;
}

export interface ChapterCreate {
  courseId: string;
  title: string;
}

export interface ChapterResponse {
  success: boolean;
  data?: Chapter;
  message?: string;
}

export async function getCourseList(params: {
  page: number;
  pageSize: number;
  keyword?: string;
}): Promise<CourseListResponse> {
  return request({
    url: "/course/list",
    method: "get",
    params,
  });
}

export async function getCourseDetail(id: string): Promise<CourseResponse> {
  return request({
    url: `/course/${id}`,
    method: "get",
  });
}

export async function createCourse(data: {
  title: string;
  description: string;
  cover?: string;
  status?: "draft" | "published" | "archived";
}): Promise<CourseResponse> {
  return request({
    url: "/course",
    method: "post",
    data,
  });
}

export async function updateCourse(
  id: string,
  data: {
    title?: string;
    description?: string;
    cover?: string;
    status?: "draft" | "published" | "archived";
  }
): Promise<CourseResponse> {
  return request({
    url: `/course/${id}`,
    method: "put",
    data,
  });
}

export async function deleteCourse(id: string): Promise<CourseResponse> {
  return request({
    url: `/course/${id}`,
    method: "delete",
  });
}

export async function updateChapter(
  id: string,
  data: ChapterUpdate
): Promise<ApiResponse<null>> {
  return request({
    url: `/course/chapters/${id}`,
    method: "put",
    data,
  });
}

export async function createChapter(
  data: ChapterCreate
): Promise<ChapterResponse> {
  return request({
    url: "/course/chapters",
    method: "post",
    data,
  });
}

export const deleteChapter = async (
  chapterId: string
): Promise<ApiResponse<null>> => {
  try {
    const response = await request({
      url: `/course/chapters/${chapterId}`,
      method: "delete",
    });
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "删除章节失败",
      data: null,
      code: 500,
    };
  }
};

export async function getChapterDetail(id: string): Promise<ChapterResponse> {
  return request({
    url: `/course/chapters/${id}`,
    method: "get",
  });
}

export async function reviewMaterial(
  materialId: string,
  approved: boolean
): Promise<ApiResponse<null>> {
  return request({
    url: `/course/materials/${materialId}/review`,
    method: "post",
    data: {
      approved,
    },
  });
}

export async function deleteMaterial(
  materialId: string
): Promise<ApiResponse<null>> {
  return request({
    url: `/course/materials/${materialId}`,
    method: "delete",
  });
}
