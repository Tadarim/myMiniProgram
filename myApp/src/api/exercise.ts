import Taro, { request } from '@tarojs/taro';

import { ApiResponse } from '../types/common';

import { API_ROUTES } from './constant';

export const exerciseService = {
  // 获取习题列表
  async getExerciseList(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
  }) {
    const token = Taro.getStorageSync('token');

    if (!token) {
      Taro.navigateTo({
        url: '/pages/login/index'
      });
      throw new Error('请先登录');
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const res = await request({
      url: API_ROUTES.EXERCISE_LIST,
      method: 'GET',
      data: params,
      header: headers
    });

    if (res.statusCode === 200) {
      return res.data;
    }
  },

  // 获取习题详情
  async getExerciseDetail(exerciseId: string): Promise<any> {
    const token = Taro.getStorageSync('token');
    try {
      const response = await request({
        url: `/exercise/detail/${exerciseId}`,
        method: 'GET',
        header: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.statusCode === 200) {
        return response.data;
      }
      throw new Error(response.data.message || '获取习题详情失败');
    } catch (error) {
      console.error('Get exercise detail failed:', error);
      throw error;
    }
  },

  // 收藏/取消收藏
  async collectExercise(id: string, collect: boolean) {
    const token = Taro.getStorageSync('token');
    const res = await request({
      url: `/exercise/${id}/collect`,
      method: 'POST',
      data: { collect },
      header: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return res.data;
  },

  // 更新完成数
  async updateCompleteCount(exerciseId: string): Promise<any> {
    const token = Taro.getStorageSync('token');
    const userId = Taro.getStorageSync('userId');
    try {
      const response = await request({
        url: `/exercise/${exerciseId}/complete`,
        method: 'POST',
        data: { userId },
        header: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.statusCode === 200) {
        return response.data;
      }
      throw new Error(response.data.message || '更新完成数量失败');
    } catch (error) {
      console.error('Update complete count failed:', error);
      throw error;
    }
  },

  // 收藏/取消收藏习题
  async toggleExerciseCollection(
    exerciseId: string
  ): Promise<
    ApiResponse<{ collections_count: number; is_collected: boolean }>
  > {
    try {
      const token = Taro.getStorageSync('token');
      const response = await request({
        url: `/exercise/${exerciseId}/collection`,
        method: 'POST',
        header: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.statusCode === 200) {
        return response.data;
      }
      throw new Error(response.data.message || '收藏操作失败');
    } catch (error) {
      console.error('Toggle exercise collection failed:', error);
      throw error;
    }
  }
};
