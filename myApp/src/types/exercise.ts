export interface Exercise {
  id: number | string;
  title: string;
  description: string;
  question_count: number;
  complete_count: number;
  created_at?: string;
  updated_at?: string;
  is_collected: boolean;
}

export interface Question {
  id: number | string;
  exercise_set_id: number | string;
  content: string;
  type: 'single' | 'multiple';
  options: string[];
  answer: string[];
  created_at?: string;
  updated_at?: string;
}
