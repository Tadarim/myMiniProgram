import Taro, { request } from '@tarojs/taro';

import { BASE_URL } from './constant';

export const fetchLocation = () => {
  return request({
    url: 'https://www.mxnzp.com/api/address/list?app_id=nikekejpel7eodcp&app_secret=fCR8CHa9Hol001s1A7MYEToYvqhMEU8Z'
  });
};

export const fetchBirthDayExtra = async (birthday: string) => {
  try {
    const response = await request({
      url: 'https://zj.v.api.aa1.cn/api/Age-calculation',
      data: { birthday }
    });
    const jsonStartIndex = response.data.indexOf('{');
    const jsonEndIndex = response.data.lastIndexOf('}');
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      const jsonString = response.data.substring(
        jsonStartIndex,
        jsonEndIndex + 1
      );
      const jsonData = JSON.parse(jsonString);
      return jsonData;
    }
    throw new Error('无法提取 JSON 数据');
  } catch (error) {
    console.error('Error fetching birthday extra:', error);
    return null;
  }
};

const noAuthUrls = [
  '/api/auth/login',
  '/auth/send-code',
  '/auth/reset-password',
  '/auth/wechat-login'
];

export const authInterceptor = function (chain) {
  const requestParams = chain.requestParams;
  const token = Taro.getStorageSync('token');
  const needAuth = !noAuthUrls.some((url) => requestParams.url.includes(url));

  // 自动补全 baseUrl
  if (requestParams.url && !/^https?:\/\//.test(requestParams.url)) {
    requestParams.url = BASE_URL + requestParams.url;
  }

  if (token && needAuth) {
    requestParams.header = {
      ...requestParams.header,
      Authorization: `Bearer ${token}`
    };
  }
  return chain.proceed(requestParams);
};
