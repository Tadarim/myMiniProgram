import Taro, { request } from '@tarojs/taro';

import { UserInfo } from '../types/user';

import { API_ROUTES } from './constant';
import { ApiResponse } from './types';

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: UserInfo;
  };
}

export interface VerificationResponse {
  success: boolean;
  message: string;
}

export const authService = {
  async loginWithEmail(
    email: string,
    password: string
  ): Promise<LoginResponse> {
    try {
      const response = await request({
        url: API_ROUTES.LOGIN,
        method: 'POST',
        data: { email, password }
      });

      if (response.statusCode === 200) {
        return response.data;
      }
      throw new Error(response.data.message || '登录失败');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  async sendVerificationCode(email: string): Promise<VerificationResponse> {
    try {
      const response = await request({
        url: API_ROUTES.SEND_CODE,
        method: 'POST',
        data: { email }
      });

      if (response.statusCode === 200) {
        return response.data;
      }
      throw new Error(response.data.message || '发送验证码失败');
    } catch (error) {
      console.error('Send verification code failed:', error);
      throw error;
    }
  },

  async resetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<VerificationResponse> {
    try {
      const response = await request({
        url: API_ROUTES.RESET_PASSWORD,
        method: 'POST',
        data: { email, code, newPassword }
      });

      if (response.statusCode === 200) {
        return response.data;
      }
      throw new Error(response.data.message || '重置密码失败');
    } catch (error) {
      console.error('Reset password failed:', error);
      throw error;
    }
  },

  async loginWithWeChat(code: string): Promise<LoginResponse> {
    try {
      const response = await request({
        url: API_ROUTES.WECHAT_LOGIN,
        method: 'POST',
        data: { code }
      });

      if (response.statusCode === 200) {
        return response.data;
      }
      throw new Error(response.data.message || '微信登录失败');
    } catch (error) {
      console.error('WeChat login failed:', error);
      throw error;
    }
  },

  async updateUserInfo(
    userInfo: Partial<UserInfo>
  ): Promise<ApiResponse<UserInfo>> {
    try {
      const token = Taro.getStorageSync('token');
      console.log('Stored token:', token);

      if (!token) {
        console.error('No token found in storage');
        throw new Error('未登录');
      }
      const response = await request({
        url: API_ROUTES.UPDATE_PROFILE,
        method: 'POST',
        data: userInfo,
        header: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Update profile response:', response);

      if (response.statusCode === 200) {
        return response.data;
      }
      throw new Error(response.data.message || '更新用户信息失败');
    } catch (error) {
      console.error('Update user info failed:', error);
      throw error;
    }
  }
};
