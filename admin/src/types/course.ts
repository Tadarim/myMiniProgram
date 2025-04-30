export type MaterialType = "video" | "pdf" | "ppt";

export interface Material {
  id: string;
  title: string;
  type: MaterialType;
  url: string;
  uploadTime: string;
  status: "pending" | "approved" | "rejected";
  isSystem: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  order?: number;
  materials: Material[];
}

export interface CourseItem {
  id: string;
  title: string;
  courseId: string;
  description: string;
  chapters: Chapter[];
  created_at: string;
  isVisible: boolean;
  rating: number;
  status: 'draft' | 'published' | 'archived';
}

export interface ChapterUpdate {
  title?: string;
  order?: number;
} 