import Taro from '@tarojs/taro';

import { BASE_URL } from './constant';

import { ChatMessage } from '@/types/chat';
import { CreateGroupParams } from '@/types/group';


const getHeaders = () => {
  const token = Taro.getStorageSync('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// 获取聊天会话列表
export const getChatSessions = (type?: 'single' | 'group') => {
  return Taro.request({
    url: '/chat/sessions',
    method: 'GET',
    data: type ? { type } : {},
    header: getHeaders()
  });
};

// 获取或创建会话
export const getOrCreateSession = (targetId: number) => {
  // 确保targetId是数字
  const numericTargetId = Number(targetId);

  // 记录实际发送的ID，便于调试
  console.log('创建会话，目标用户ID:', numericTargetId, '类型:', typeof numericTargetId);

  if (Number.isNaN(numericTargetId) || numericTargetId <= 0) {
    console.error('无效的目标用户ID:', targetId);
    return Promise.reject(new Error(`无效的目标用户ID: ${targetId}`));
  }

  // 尝试从缓存获取会话ID
  const chatSessionsCache = Taro.getStorageSync('chatSessionsCache') || {};
  const cachedSession = chatSessionsCache[`user_${numericTargetId}`];

  // 如果缓存中有最近30分钟内创建的会话，直接返回缓存的会话
  if (cachedSession && (Date.now() - cachedSession.timestamp < 30 * 60 * 1000)) {
    console.log('从缓存获取会话:', cachedSession);
    // 返回符合Taro.request返回结构的对象
    return Promise.resolve({
      statusCode: 200,
      data: {
        code: 200,
        success: true,
        data: cachedSession.data
      }
    });
  }

  // 没有缓存或缓存过期，发起网络请求
  return Taro.request({
    url: `/chat/session/${numericTargetId}`,
    method: 'GET',
    header: getHeaders()
  }).then(response => {
    // 请求成功且返回有效会话时，更新缓存
    if (response.statusCode === 200 && response.data.code === 200 && response.data.data) {
      const sessionData = response.data.data;

      // 更新缓存
      chatSessionsCache[`user_${numericTargetId}`] = {
        data: sessionData,
        timestamp: Date.now()
      };

      // 保存到本地存储
      Taro.setStorageSync('chatSessionsCache', chatSessionsCache);
      console.log('会话已缓存:', sessionData.id);
    }

    return response;
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
export const uploadChatImage = (filePath: string, sessionId: number, fileName?: string) => {
  return Taro.uploadFile({
    url: BASE_URL + '/chat/upload',
    filePath,
    name: 'file',
    formData: {
      sessionId,
      type: 'chat_image',
      fileName
    },
    header: {
      'Authorization': getHeaders().Authorization
    }
  });
};

// 上传聊天文件
export const uploadChatFile = (filePath: string, fileName: string, sessionId: number) => {
  return Taro.uploadFile({
    url: BASE_URL + '/chat/upload',
    filePath,
    name: 'file',
    formData: {
      sessionId,
      type: 'chat_file',
      fileName
    },
    header: {
      'Authorization': getHeaders().Authorization
    }
  });
};

// 刷新文件URL
export const refreshFileUrl = (messageId: number) => {
  return Taro.request({
    url: `/chat/refresh-file/${messageId}`,
    method: 'GET',
    header: getHeaders()
  });
};

// ================ 群组相关API ================

// 获取我加入的群组列表
export const getMyGroups = () => {
  return Taro.request({
    url: '/chat/my-groups',
    method: 'GET',
    header: getHeaders()
  });
};

// 获取推荐的群组
export const getRecommendedGroups = () => {
  return searchGroups('', true);
};

// 搜索群组
export const searchGroups = (keyword?: string, recommended?: boolean) => {
  let url = '/chat/groups/search';
  const params: Record<string, string> = {};

  if (keyword) {
    params.keyword = keyword;
  }

  if (recommended) {
    params.recommended = 'true';
  }

  return Taro.request({
    url,
    method: 'GET',
    data: params,
    header: getHeaders()
  });
};

// 创建群组
export const createGroup = (data: {
  name: string;
  description?: string;
  avatar?: string;
  members?: number[];
}) => {
  return Taro.request({
    url: '/chat/group',
    method: 'POST',
    data,
    header: getHeaders()
  });
};

// 获取群组详情
export const getGroupDetail = (groupId: number) => {
  return Taro.request({
    url: `/chat/group/${groupId}`,
    method: 'GET',
    header: getHeaders()
  });
};

// 加入群组
export const joinGroup = (groupId: number) => {
  return Taro.request({
    url: `/chat/group/${groupId}/join`,
    method: 'POST',
    header: getHeaders()
  });
};

// 退出群组
export const leaveGroup = (groupId: number) => {
  return Taro.request({
    url: `/chat/group/${groupId}/leave`,
    method: 'POST',
    header: getHeaders()
  });
};

// 解散群组（仅群主可操作）
export const dissolveGroup = (groupId: number) => {
  return Taro.request({
    url: `/chat/group/${groupId}/dissolve`,
    method: 'POST',
    header: getHeaders()
  });
};

// 上传群组封面
export const uploadGroupCover = (filePath: string) => {
  return Taro.uploadFile({
    url: BASE_URL + '/chat/upload',
    filePath,
    name: 'file',
    formData: {
      type: 'group_cover'
    },
    header: {
      'Authorization': getHeaders().Authorization
    }
  });
};

// 标记群消息已读
export const markGroupMessagesRead = (sessionId: number) => {
  return Taro.request({
    url: `/chat/messages/${sessionId}/read`,
    method: 'POST',
    header: getHeaders()
  });
};
