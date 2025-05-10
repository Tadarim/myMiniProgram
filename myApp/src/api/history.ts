import { request } from '@tarojs/taro';

const addHistory = async (
  target_id: number | string,
  target_type: 'course' | 'exercise' | 'post'
) => {
  return request({
    url: '/history/add',
    method: 'POST',
    data: { target_id, target_type }
  });
};

const getHistory = async () => {
  return request({
    url: '/history/list',
    method: 'GET'
  });
};

export { addHistory, getHistory };
