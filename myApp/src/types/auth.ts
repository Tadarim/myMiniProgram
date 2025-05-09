import { UserInfo } from './user';

export interface UserLoginResponse {
  token: string;
  user: Omit<UserInfo, 'password'>;
}

export interface VerificationCodeResponse {
  success: boolean;
  message: string;
}

export interface WeChatLoginResponse {
  token: string;
  user: Omit<UserInfo, 'password'>;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken: string;
    user: UserInfo;
  };
}
