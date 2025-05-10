import Taro, { request } from '@tarojs/taro';

import { ApiResponse } from '../types/common';

import { API_ROUTES } from './constant';

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
export const toggleCollection = async (
  postId: number
): Promise<
  ApiResponse<{ collections_count: number; is_collected: boolean }>
> => {
  try {
    const token = Taro.getStorageSync('token');
    const response = await request({
      url: `/posts/${postId}/collection`,
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
    console.error('Toggle post collection failed:', error);
    throw error;
  }
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
