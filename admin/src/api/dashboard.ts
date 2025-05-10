import request from "@utils/request";
import { ApiResponse } from "@/types/common";

export interface DashboardData {
  courseCount: number;
  exerciseCount: number;
  postCount: number;
  userCount: number;
  courseTrend: Array<{ date: string; count: number }>;
  exerciseTrend: Array<{ date: string; count: number }>;
  postTrend: Array<{ date: string; count: number }>;
  courseHot: Array<{ title: string; count: number }>;
  exerciseHot: Array<{ title: string; count: number }>;
  postHot: Array<{ id: string; content: string; count: number }>;
  courseCollect: Array<{ title: string; count: number }>;
  exerciseComplete: Array<{ title: string; count: number }>;
  postInteract: Array<{ id: string; content: string; count: number }>;
  userActiveTrend: Array<{ date: string; count: number }>;
  favoriteTypeDist: Array<{ type: string; count: number }>;
  historyTypeDist: Array<{ type: string; count: number }>;
}

export async function getDashboardOverview(): Promise<ApiResponse<DashboardData>> {
  return request({
    url: "/dashboard/overview",
    method: "get",
  });
} 