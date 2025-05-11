import { request, uploadFile } from '@tarojs/taro';

import { CreateGroupParams } from '@/types/group';

// 获取我加入的群组列表
export const getMyGroups = () => {
  return request({
    url: '/api/my-groups',
    method: 'GET'
  });
};

// 获取推荐的群组
export const getRecommendedGroups = () => {
  return request({
    url: '/api/recommended-groups',
    method: 'GET'
  });
};

// 创建群组
export const createGroup = (data: CreateGroupParams) => {
  return request({
    url: '/api/groups',
    method: 'POST',
    data
  });
};

// 获取群组详情
export const getGroupDetail = (groupId: number) => {
  return request({
    url: `/api/groups/${groupId}`,
    method: 'GET'
  });
};

// 获取群组成员
export const getGroupMembers = (groupId: number) => {
  return request({
    url: `/api/groups/${groupId}/members`,
    method: 'GET'
  });
};

// 加入群组
export const joinGroup = (groupId: number) => {
  return request({
    url: `/api/groups/${groupId}/join`,
    method: 'POST'
  });
};

// 退出群组
export const leaveGroup = (groupId: number) => {
  return request({
    url: `/api/groups/${groupId}/leave`,
    method: 'POST'
  });
};

// 发送群消息
export const sendGroupMessage = (data: {
  groupId: number;
  content: string;
  type: string;
}) => {
  return request({
    url: `/api/groups/${data.groupId}/messages`,
    method: 'POST',
    data: {
      content: data.content,
      type: data.type
    }
  });
};

// 获取群消息
export const getGroupMessages = (groupId: number, page: number = 1) => {
  return request({
    url: `/api/groups/${groupId}/messages`,
    method: 'GET',
    data: { page }
  });
};

// 标记群消息已读
export const markGroupMessagesRead = (groupId: number) => {
  return request({
    url: `/api/groups/${groupId}/messages/read`,
    method: 'POST'
  });
};

// 上传群组封面
export const uploadGroupCover = (filePath: string) => {
  return uploadFile({
    url: '/api/upload/group-cover',
    filePath,
    name: 'file'
  });
};
