import Taro from '@tarojs/taro';

import { BASE_URL } from './constant';

const getHeaders = () => {
  const token = Taro.getStorageSync('token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : ''
  };
};

export const getChatSessions = (type?: 'single' | 'group') => {
  return Taro.request({
    url: '/chat/sessions',
    method: 'GET',
    data: type ? { type } : {},
    header: getHeaders()
  });
};

export const getOrCreateSession = (targetId: number) => {
  const numericTargetId = Number(targetId);

  if (Number.isNaN(numericTargetId) || numericTargetId <= 0) {
    console.error('无效的目标用户ID:', targetId);
    return Promise.reject(new Error(`无效的目标用户ID: ${targetId}`));
  }

  // 尝试从缓存获取会话ID
  const chatSessionsCache = Taro.getStorageSync('chatSessionsCache') || {};
  const cachedSession = chatSessionsCache[`user_${numericTargetId}`];

  // 如果缓存中有最近30分钟内创建的会话，直接返回缓存的会话
  if (cachedSession && Date.now() - cachedSession.timestamp < 30 * 60 * 1000) {
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
  }).then((response) => {
    if (
      response.statusCode === 200 &&
      response.data.code === 200 &&
      response.data.data
    ) {
      const sessionData = response.data.data;

      // 更新缓存
      chatSessionsCache[`user_${numericTargetId}`] = {
        data: sessionData,
        timestamp: Date.now()
      };

      Taro.setStorageSync('chatSessionsCache', chatSessionsCache);
    }

    return response;
  });
};

export const getChatMessages = (sessionId: number, page = 1, pageSize = 20) => {
  return Taro.request({
    url: `/chat/messages/${sessionId}`,
    method: 'GET',
    data: { page, pageSize },
    header: getHeaders()
  });
};

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

export const getUnreadCount = () => {
  return Taro.request({
    url: `/chat/unread`,
    method: 'GET',
    header: getHeaders()
  });
};

export const uploadChatImage = (
  filePath: string,
  sessionId: number,
  fileName?: string
) => {
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
      Authorization: getHeaders().Authorization
    }
  });
};

export const uploadChatFile = (
  filePath: string,
  fileName: string,
  sessionId: number
) => {
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
      Authorization: getHeaders().Authorization
    }
  });
};

export const refreshFileUrl = (messageId: number) => {
  return Taro.request({
    url: `/chat/refresh-file/${messageId}`,
    method: 'GET',
    header: getHeaders()
  });
};

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

export const joinGroup = (groupId: number) => {
  return Taro.request({
    url: `/chat/group/${groupId}/join`,
    method: 'POST',
    header: getHeaders()
  });
};

export const leaveGroup = (groupId: number) => {
  return Taro.request({
    url: `/chat/group/${groupId}/leave`,
    method: 'POST',
    header: getHeaders()
  });
};

export const dissolveGroup = (groupId: number) => {
  return Taro.request({
    url: `/chat/group/${groupId}/dissolve`,
    method: 'POST',
    header: getHeaders()
  });
};

export const uploadGroupCover = (filePath: string) => {
  return Taro.uploadFile({
    url: BASE_URL + '/chat/upload',
    filePath,
    name: 'file',
    formData: {
      type: 'group_cover'
    },
    header: {
      Authorization: getHeaders().Authorization
    }
  });
};

export const markGroupMessagesRead = (sessionId: number) => {
  return Taro.request({
    url: `/chat/messages/${sessionId}/read`,
    method: 'POST',
    header: getHeaders()
  });
};
