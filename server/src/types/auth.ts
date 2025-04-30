import { RowDataPacket } from "mysql2";

// 微信登录响应类型
export interface WeChatResponse {
  errcode?: number;
  errmsg?: string;
  openid?: string;
  session_key?: string;
  unionid?: string;
}

// 用户数据库行类型
export interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  password: string;
  avatar: string;
  background_image: string;
  description: string;
  extra: string;
}

// 登录请求类型
export interface LoginRequest {
  email: string;
  password: string;
}

// 发送验证码请求类型
export interface SendCodeRequest {
  email: string;
}

// 重置密码请求类型
export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

// 微信登录请求类型
export interface WeChatLoginRequest {
  code: string;
}

// 登录响应类型
export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    avatar: string;
    backgroundImage: string;
    desc: string;
    extra: {
      gender: number;
      location: string[];
      school: string;
      createTime: string;
      lastLoginTime: string;
      birthday: string;
      age: string;
      constellation: string;
    };
    learningProfile: {
      goals: any[];
      style: {
        preference: string;
        schedule: string;
        interaction: string;
      };
      skills: any[];
      history: {
        completedCourses: string[];
        averageScore: number;
        studyHours: number;
      };
      social: {
        preferredGroupSize: number;
        leadership: number;
        cooperation: number;
      };
      motivation: {
        type: string;
        intensity: number;
        persistence: number;
      };
    };
  };
}
