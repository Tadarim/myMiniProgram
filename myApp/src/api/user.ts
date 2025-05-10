import Taro from '@tarojs/taro';

/**
 * 获取请求头，包含token
 */
const getHeaders = () => {
  const token = Taro.getStorageSync('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
};

/**
 * 获取用户统计数据（学习课程、完成题库等）
 */
export const getUserStats = async () => {
  try {
    const res = await Taro.request({
      url: `/user/stats/me`,
      method: 'GET',
      header: getHeaders()
    });

    return res.data;
  } catch (error) {
    console.error('获取用户统计数据失败:', error);
    throw error;
  }
};
