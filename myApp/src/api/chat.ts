import Taro from '@tarojs/taro';

import { BASE_URL } from './constant';

export interface ChatSession {
  id: number;
  target_id: number;
  target_name: string;
  target_avatar: string;
  last_message: string;
  last_time: string;
  unread_count: number;
}

export interface ChatMessage {
  id: number;
  session_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  type: 'text' | 'image' | 'file';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  is_read: boolean;
  created_at: string;
  sender_name: string;
  sender_avatar: string;
}

const getHeaders = () => {
  const token = Taro.getStorageSync('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  };
};

// 获取聊天会话列表
export const getChatSessions = () => {
  return Taro.request({
    url: `${BASE_URL}/chat/sessions`,
    method: 'GET',
    header: getHeaders()
  });
};

// 获取聊天消息历史
export const getChatMessages = (sessionId: number, page = 1, pageSize = 20) => {
  return Taro.request({
    url: `${BASE_URL}/chat/messages/${sessionId}`,
    method: 'GET',
    data: { page, pageSize },
    header: getHeaders()
  });
};

// 发送消息
export const sendMessage = (data: {
  sessionId: number;
  content: string;
  type?: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}) => {
  return Taro.request({
    url: `${BASE_URL}/chat/messages`,
    method: 'POST',
    data,
    header: getHeaders()
  });
};

// 获取未读消息数
export const getUnreadCount = () => {
  return Taro.request({
    url: `${BASE_URL}/chat/unread`,
    method: 'GET',
    header: getHeaders()
  });
};
