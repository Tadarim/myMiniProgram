import Taro from '@tarojs/taro';

import { API_ROUTES } from './constant';

import { API_BASE_URL } from '@/config';

export interface Attachment {
  url: string;
  type: string;
  name: string;
}

export interface Post {
  id: number;
  content: string;
  attachments: Attachment[];
  type: 'normal' | 'help';
  author_id: number;
  username: string;
  avatar: string;
  time_ago: string;
  likes_count: number;
  comments_count: number;
  collections_count: number;
  is_liked: boolean;
  is_collected: boolean;
  tags: string[];
}

export interface Comment {
  id: number;
  content: string;
  author_id: number;
  username: string;
  avatar: string;
  time_ago: string;
  likes_count: number;
  is_liked: boolean;
}

export interface PostListResponse {
  data: Post[];
  total: number;
}

export interface CommentListResponse {
  data: Comment[];
  total: number;
}

// 基础请求函数
const request = async <T>(options: Taro.request.Option) => {
  try {
    const token = Taro.getStorageSync('token');
    const header = {
      'Content-Type': 'application/json',
      ...options.header
    };

    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }

    const response = await Taro.request({
      ...options,
      url: `${API_BASE_URL}${options.url}`,
      header
    });

    if (response.statusCode === 401) {
      Taro.removeStorageSync('token');
      Taro.navigateTo({ url: '/pages/login/index' });
      throw new Error('登录已过期');
    }

    if (response.statusCode >= 400) {
      throw new Error(response.data.message || '请求失败');
    }

    return response.data as T;
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
};

// 获取帖子列表
export const getPosts = async (params: {
  page: number;
  pageSize: number;
  type?: 'all' | 'normal' | 'help';
  keyword?: string;
}) => {
  return request<PostListResponse>({
    url: API_ROUTES.POST_LIST,
    method: 'GET',
    data: params
  });
};

// 获取帖子详情
export const getPostDetail = async (postId: number) => {
  return request<{ data: Post }>({
    url: `/posts/${postId}`,
    method: 'GET'
  });
};

// 创建帖子
export const createPost = async (data: {
  content: string;
  type: 'normal' | 'help';
  tags?: string[];
  attachments?: Attachment[];
}) => {
  return request<{ data: Post }>({
    url: API_ROUTES.CREATE_POST,
    method: 'POST',
    data
  });
};

// 点赞/取消点赞帖子
export const toggleLike = async (postId: number) => {
  return request<{ data: { likes_count: number; is_liked: boolean } }>({
    url: `/posts/${postId}/like`,
    method: 'POST'
  });
};

// 收藏/取消收藏帖子
export const toggleCollection = async (postId: number) => {
  return request<{
    data: { collections_count: number; is_collected: boolean };
  }>({
    url: `/posts/${postId}/collection`,
    method: 'POST'
  });
};

// 获取帖子评论列表
export const getComments = async (
  postId: number,
  params: {
    page: number;
    pageSize: number;
  }
) => {
  return request<CommentListResponse>({
    url: `/posts/${postId}/comments`,
    method: 'GET',
    data: params
  });
};

// 发表评论
export const addComment = async (postId: number, content: string) => {
  return request<{ data: Comment }>({
    url: `/posts/${postId}/comments`,
    method: 'POST',
    data: { content }
  });
};

// 点赞/取消点赞评论
export const toggleCommentLike = async (commentId: number) => {
  return request<{ data: { likes_count: number; is_liked: boolean } }>({
    url: `/comments/${commentId}/like`,
    method: 'POST'
  });
};

// 删除帖子
export const deletePost = async (postId: number) => {
  return request<{ data: null }>({
    url: `/posts/${postId}`,
    method: 'DELETE'
  });
};
