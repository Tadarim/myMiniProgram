export type MaterialType =
  | 'video'
  | 'ppt'
  | 'pdf'
  | 'doc'
  | 'txt'
  | 'image'
  | 'audio';

export interface Course {
  id: number;
  title: string;
  description: string;
  cover: string;
  rating: number;
  is_collected: boolean;
  created_at?: string;
  updated_at?: string;
  chapters: Chapter[];
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
