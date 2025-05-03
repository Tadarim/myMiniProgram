export interface ApiResponse<T = any> {
  code: number;
  success: boolean;
  data?: T;
  message: string;
}

export interface ScheduleItem {
  id: number | string;
  title: string;
  time: string;
  description: string;
}
