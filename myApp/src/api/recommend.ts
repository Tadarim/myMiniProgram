import Taro from '@tarojs/taro';

// 获取综合推荐内容
export const getRecommendations = async () => {
  const response = await Taro.request({
    url: '/recommend',
    method: 'GET'
  });
  return response.data;
};

// 获取推荐用户
export const getRecommendedUsers = async () => {
  const response = await Taro.request({
    url: '/recommend/users',
    method: 'GET'
  });
  return response.data;
};

// 获取推荐题目
export const getRecommendedExercises = async () => {
  const response = await Taro.request({
    url: '/recommend/exercises',
    method: 'GET'
  });
  return response.data;
};

// 获取推荐小组
export const getRecommendedGroups = async () => {
  const response = await Taro.request({
    url: '/recommend/groups',
    method: 'GET'
  });
  return response.data;
};

// 获取推荐帖子
export const getRecommendedPosts = async () => {
  const response = await Taro.request({
    url: '/recommend/posts',
    method: 'GET'
  });
  return response.data;
};
