import Taro, { request } from '@tarojs/taro';

import { ApiResponse } from '../types/common';

import { API_ROUTES } from './constant';

import { Course } from '@/types/course';

export interface SearchResult {
  courses?: Course[];
  exercises?: any[];
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

      const response = await request({
        url: API_ROUTES.COURSE_LIST,
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
        url: `/course/${courseId}`,
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
        url: `/search`,
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
  },

  // 评分课程
  async rateCourse(
    courseId: number,
    data: { rating: number; comment?: string }
  ): Promise<ApiResponse<null>> {
    try {
      const token = Taro.getStorageSync('token');
      const response = await request({
        url: `/course/${courseId}/rate`,
        method: 'POST',
        data,
        header: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.statusCode === 200) {
        return response.data;
      }
      throw new Error(response.data.message || '评分失败');
    } catch (error) {
      console.error('Rate course failed:', error);
      throw error;
    }
  },

  async updateCourseViewCount(courseId: number): Promise<ApiResponse<null>> {
    try {
      const token = Taro.getStorageSync('token');
      const response = await request({
        url: `/course/view`,
        data: {
          id: courseId
        },
        method: 'POST',
        header: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.statusCode === 200) {
        return response.data;
      }
      throw new Error(response.data.message || '更新浏览量失败');
    } catch (error) {
      console.error('Update course view_count failed:', error);
      throw error;
    }
  },

  // 收藏/取消收藏课程
  async toggleCourseCollection(
    courseId: number
  ): Promise<
    ApiResponse<{ collections_count: number; is_collected: boolean }>
  > {
    try {
      const token = Taro.getStorageSync('token');
      const response = await request({
        url: `/course/${courseId}/collection`,
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
      console.error('Toggle course collection failed:', error);
      throw error;
    }
  }
};
