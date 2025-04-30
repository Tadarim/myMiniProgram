export interface ApiResponse<T> {
  code: number;
  data: T;
  success: boolean;
  message?: string;
} 