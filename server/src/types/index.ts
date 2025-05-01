export interface User {
  id: number;
  username: string;
  email: string;
  role: "admin" | "user";
  avatar?: string;
  background_image?: string;
  description?: string;
  extra?: string;
  created_at: string;
  updated_at: string;
} 