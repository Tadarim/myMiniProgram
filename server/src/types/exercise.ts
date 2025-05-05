import { RowDataPacket } from "mysql2";

export interface Exercise {
  id: number | string;
  title: string;
  description: string;
  question_count: number;
  complete_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface Question {
  id: number | string;
  exercise_set_id: number | string;
  content: string;
  type: "single" | "multiple";
  options: string[];
  answer: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseRow extends RowDataPacket {
  id: number | string;
  title: string;
  description: string;
  question_count: number;
  complete_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface QuestionRow extends RowDataPacket {
  id: number | string;
  exercise_set_id: number | string;
  content: string;
  type: "single" | "multiple";
  options: string[];
  answer: string[];
  created_at?: string;
  updated_at?: string;
}
