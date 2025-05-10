import Taro from '@tarojs/taro';

import { BASE_URL } from './constant';

const getHeaders = () => {
  return {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache'
  };
};

// 获取聊天会话列表
export const getChatSessions = () => {
  return Taro.request({
    url: '/chat/sessions',
    method: 'GET',
    header: getHeaders()
  });
};

// 获取聊天消息历史
export const getChatMessages = (sessionId: number, page = 1, pageSize = 20) => {
  return Taro.request({
    url: `/chat/messages/${sessionId}`,
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
    url: `/chat/messages`,
    method: 'POST',
    data,
    header: getHeaders()
  });
};

// 获取未读消息数
export const getUnreadCount = () => {
  return Taro.request({
    url: `/chat/unread`,
    method: 'GET',
    header: getHeaders()
  });
};

// 上传聊天图片
export const uploadChatImage = (filePath: string, sessionId: number) => {
  const token = Taro.getStorageSync('token');

  return Taro.uploadFile({
    url: `${BASE_URL}/chat/upload`,
    filePath,
    name: 'file',
    formData: {
      type: 'chat_image',
      sessionId
    },
    header: {
      Authorization: `Bearer ${token}`
    }
  });
};

// 上传聊天文件
export const uploadChatFile = (filePath: string, fileName: string, sessionId: number) => {
  const token = Taro.getStorageSync('token');

  return Taro.uploadFile({
    url: `${BASE_URL}/chat/upload`,
    filePath,
    name: 'file',
    formData: {
      type: 'chat_file',
      fileName,
      sessionId
    },
    header: {
      Authorization: `Bearer ${token}`
    }
  });
};
