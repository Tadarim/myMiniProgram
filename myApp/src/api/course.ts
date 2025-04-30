import Taro, { request } from '@tarojs/taro';

import { ApiResponse } from '../types/common';

import { BASE_URL, API_ROUTES } from './constant';

import { Course } from '@/types/course';

export interface SearchResult {
  courses: Course[];
  exercises: any[]; // 习题搜索结果
  total: number;
}

export interface CourseQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

export const courseService = {
  // 获取课程列表
  async getCourseList(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
  }): Promise<ApiResponse<Course[]>> {
    try {
      const token = Taro.getStorageSync('token');
      console.log('token', token);
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
      console.log('Request headers:', headers);

      const response = await request({
        url: `${BASE_URL}${API_ROUTES.COURSE_LIST}`,
        method: 'GET',
        data: params,
        header: headers
      });

      if (response.statusCode === 200) {
        return response.data;
      }
      throw new Error(response.data.message || '获取课程列表失败');
    } catch (error) {
      console.error('Get course list failed:', error);
      throw error;
    }
  },

  // 获取课程详情
  async getCourseDetail(courseId: number): Promise<ApiResponse<Course>> {
    try {
      const token = Taro.getStorageSync('token');
      const response = await request({
        url: `${BASE_URL}${API_ROUTES.COURSE_DETAIL}${courseId}`,
        method: 'GET',
        header: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.statusCode === 200) {
        return response.data;
      }
      throw new Error(response.data.message || '获取课程详情失败');
    } catch (error) {
      console.error('Get course detail failed:', error);
      throw error;
    }
  },

  // 搜索课程和习题
  async search(
    keyword: string,
    params: {
      page?: number;
      pageSize?: number;
      type?: 'course' | 'exercise' | 'all';
    }
  ): Promise<ApiResponse<SearchResult>> {
    try {
      const token = Taro.getStorageSync('token');
      const response = await request({
        url: `${BASE_URL}/search`,
        method: 'GET',
        data: {
          keyword,
          ...params
        },
        header: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.statusCode === 200) {
        return response.data;
      }
      throw new Error(response.data.message || '搜索失败');
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }
};
