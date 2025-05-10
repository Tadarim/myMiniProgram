import Taro, { request } from '@tarojs/taro';

import { API_ROUTES } from './constant';
import { ApiResponse, ScheduleItem } from './types';

export const getScheduleList = () => {
  const token = Taro.getStorageSync('token');

  if (!token) {
    console.error('未找到token');
    return Promise.reject('未登录');
  }

  return request<ApiResponse<ScheduleItem[]>>({
    url: API_ROUTES.SCHEDULE_LIST,
    method: 'GET',
    header: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
};

export const createSchedule = (data: {
  title: string;
  time: string;
  description: string;
}) => {
  const token = Taro.getStorageSync('token');

  if (!token) {
    console.error('未找到token');
    return Promise.reject('未登录');
  }

  return request<ApiResponse<ScheduleItem>>({
    url: API_ROUTES.CREATE_SCHEDULE,
    method: 'POST',
    data,
    header: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
};

export const deleteSchedule = (id: string | number) => {
  const token = Taro.getStorageSync('token');

  if (!token) {
    console.error('未找到token');
    return Promise.reject('未登录');
  }

  return request<ApiResponse>({
    url: `${API_ROUTES.DELETE_SCHEDULE}${id}`,
    method: 'DELETE',
    header: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
};
