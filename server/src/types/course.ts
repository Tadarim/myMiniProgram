import { RowDataPacket } from "mysql2";

export type MaterialType =
  | "video"
  | "ppt"
  | "pdf"
  | "doc"
  | "txt"
  | "image"
  | "audio";

export interface Course {
  id: number;
  title: string;
  description?: string;
  cover?: string;
  rating: number;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
  chapters: Chapter[];
  is_collected?: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  materials: Material[];
}

export interface Material {
  id: string;
  title: string;
  type: MaterialType;
  url: string;
  upload_time: string;
  status: "pending" | "approved" | "rejected";
  is_system: boolean;
}

export interface CourseQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

export interface CourseCreate {
  title: string;
  description?: string;
  cover?: string;
  status?: "draft" | "published" | "archived";
}

export interface CourseUpdate {
  title?: string;
  description?: string;
  cover?: string;
  rating?: number;
  status?: "draft" | "published" | "archived";
}

export interface CourseRating {
  courseId: number;
  userId: number;
  rating: number;
  comment?: string;
}

// 定义课程行数据类型
export interface CourseRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  cover: string;
  rating: number;
  status: 'draft' | 'published' | 'archived';
  is_collected: boolean;
  created_at: string;
  updated_at: string;
}

// 定义章节行数据类型
export interface ChapterRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  order_num: number;
}

// 定义素材行数据类型
export interface MaterialRow extends RowDataPacket {
  id: number;
  title: string;
  type: string;
  url: string;
  status: "pending" | "approved" | "rejected";
  order_num: number;
  created_at: string;
  is_system: boolean;
}
