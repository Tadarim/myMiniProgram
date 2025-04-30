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
  status?: 'draft' | 'published' | 'archived';
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
    url: "/api/course/list",
    method: "get",
    params,
  });
}

export async function getCourseDetail(id: string): Promise<CourseResponse> {
  return request({
    url: `/api/course/${id}`,
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
    url: "/api/course",
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
    url: `/api/course/${id}`,
    method: "put",
    data,
  });
}

export async function deleteCourse(id: string): Promise<CourseResponse> {
  return request({
    url: `/api/course/${id}`,
    method: "delete",
  });
}

export async function updateChapter(
  id: string,
  data: ChapterUpdate
): Promise<ApiResponse<null>> {
  return request({
    url: `/api/course/chapters/${id}`,
    method: "put",
    data,
  });
}

export async function createChapter(data: ChapterCreate): Promise<ChapterResponse> {
  return request({
    url: "/api/course/chapters",
    method: "post",
    data,
  });
}

export async function deleteChapter(id: string): Promise<ApiResponse<null>> {
  return request({
    url: `/api/course/chapters/${id}`,
    method: "delete",
  });
}

export async function getChapterDetail(id: string): Promise<ChapterResponse> {
  return request({
    url: `/api/course/chapters/${id}`,
    method: "get",
  });
}

export async function reviewMaterial(
  materialId: string,
  approved: boolean
): Promise<ApiResponse<null>> {
  return request({
    url: `/api/course/materials/${materialId}/review`,
    method: "post",
    data: {
      approved,
    },
  });
}

export async function deleteMaterial(materialId: string): Promise<ApiResponse<null>> {
  return request({
    url: `/api/course/materials/${materialId}`,
    method: "delete",
  });
}
