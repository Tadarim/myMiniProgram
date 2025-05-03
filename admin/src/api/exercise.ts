import request from "@/utils/request";

export interface ExerciseSet {
  id: number;
  title: string;
  description: string;
  question_count: number;
  created_at: string;
  updated_at: string;
}

export interface ExerciseSetDetail extends ExerciseSet {
  questions: Question[];
}

export interface Question {
  id: number;
  content: string;
  type: "single" | "multiple";
  options: string[];
  answer: string | string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
}

export async function getExerciseSets(params?: {
  title?: string;
}): Promise<ApiResponse<ExerciseSet[]>> {
  return request({
    url: "/exercise/list",
    method: "get",
    params,
  });
}

export async function createExerciseSet(data: Omit<ExerciseSet, "id" | "question_count" | "created_at" | "updated_at">): Promise<ApiResponse<ExerciseSet>> {
  return request({
    url: "/exercise/create",
    method: "post",
    data,
  });
}

export async function updateExerciseSet(
  id: number,
  data: Omit<ExerciseSet, "id" | "question_count" | "created_at" | "updated_at">
): Promise<ApiResponse<ExerciseSet>> {
  return request({
    url: `/exercise/update/${id}`,
    method: "put",
    data,
  });
}

export async function deleteExerciseSet(id: number): Promise<ApiResponse> {
  return request({
    url: `/exercise/delete/${id}`,
    method: "delete",
  });
}

export async function getExerciseSetDetail(id: number): Promise<ApiResponse<ExerciseSetDetail>> {
  return request({
    url: `/exercise/detail/${id}`,
    method: "get",
  });
}

export async function addQuestion(
  exerciseSetId: number,
  data: Omit<Question, "id">
): Promise<ApiResponse<Question>> {
  return request({
    url: `/exercise/${exerciseSetId}/questions/add`,
    method: "post",
    data,
  });
}

export async function deleteQuestion(
  exerciseSetId: number,
  questionId: number
): Promise<ApiResponse> {
  return request({
    url: `/exercise/${exerciseSetId}/questions/${questionId}`,
    method: "delete",
  });
}
