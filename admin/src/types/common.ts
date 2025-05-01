export interface ApiResponse<T> {
  code: number | string;
  data: T;
  success: boolean;
  message?: string;
}
