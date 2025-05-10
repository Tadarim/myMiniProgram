import Taro from '@tarojs/taro';

export const getFavorites = async () => {
  return Taro.request({
    url: '/favorites',
    method: 'GET'
  });
};
