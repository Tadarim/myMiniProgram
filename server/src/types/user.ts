import { RowDataPacket } from "mysql2";

// 定义用户行数据类型
export interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  avatar: string;
  backgroundImage: string;
  description: string;
  extra: string;
}

export enum Gender {
  Male = 1,
  Female = 2,
  Unknown = 3,
}

// 学习风格枚举
export enum LearningStyle {
  Visual = "visual",
  Auditory = "auditory",
  Kinesthetic = "kinesthetic",
}

// 学习时间偏好
export enum TimePreference {
  Morning = "morning",
  Afternoon = "afternoon",
  Evening = "evening",
}

// 学习水平
export enum LearningLevel {
  Beginner = "beginner",
  Intermediate = "intermediate",
  Advanced = "advanced",
}

export interface LearningGoal {
  subject: string;
  targetLevel: LearningLevel;
  deadline: string;
}

export interface LearningStyleProfile {
  preference: LearningStyle;
  schedule: TimePreference;
  interaction: string;
}

export interface Skill {
  subject: string;
  level: number;
  confidence: number;
}

export interface LearningHistory {
  completedCourses: string[];
  averageScore: number;
  studyHours: number;
}

export interface SocialProfile {
  preferredGroupSize: number;
  leadership: number;
  cooperation: number;
}

export interface MotivationProfile {
  type: string;
  intensity: number;
  persistence: number;
}

export interface LearningProfile {
  goals: LearningGoal[];
  style: LearningStyleProfile;
  skills: Skill[];
  history: LearningHistory;
  social: SocialProfile;
  motivation: MotivationProfile;
}

export interface UserExtra {
  gender: Gender;
  birthday: string;
  location: string[];
  school: string;
  age: string;
  constellation: string;
  createTime: string;
  lastLoginTime: string;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  avatar: string;
  backgroundImage: string;
  desc: string;
  extra: UserExtra;
  learningProfile: LearningProfile;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  success: boolean;
  total?: number;
  message?: string;
}
