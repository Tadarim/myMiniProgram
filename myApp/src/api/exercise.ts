import Taro, { request } from '@tarojs/taro';

import { API_ROUTES, BASE_URL } from './constant';

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
      url: `${BASE_URL}${API_ROUTES.EXERCISE_LIST}`,
      method: 'GET',
      data: params,
      header: headers
    });

    if (res.statusCode === 200) {
      return res.data;
    }
  },

  // 获取习题详情
  async getExerciseDetail(id: string) {
    const token = Taro.getStorageSync('token');
    const res = await request({
      url: `${BASE_URL}/exercise/detail/${id}`,
      method: 'GET',
      header: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return res.data;
  },

  // 提交答题
  async submitExercise(id: string, answers: any) {
    const token = Taro.getStorageSync('token');
    const res = await request({
      url: `${BASE_URL}/exercise/${id}/submit`,
      method: 'POST',
      data: { answers },
      header: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return res.data;
  },

  // 收藏/取消收藏
  async collectExercise(id: string, collect: boolean) {
    const token = Taro.getStorageSync('token');
    const res = await request({
      url: `${BASE_URL}/exercise/${id}/collect`,
      method: 'POST',
      data: { collect },
      header: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return res.data;
  }
};
