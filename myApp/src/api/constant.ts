export const BASE_URL = 'http://localhost:3000/api';

export const API_ROUTES = {
  LOGIN: '/client/auth/login',
  SEND_CODE: '/client/auth/send-code',
  RESET_PASSWORD: '/client/auth/reset-password',
  VERIFY_CODE: '/client/auth/verify-code',
  WECHAT_LOGIN: '/client/auth/wechat-login',
  UPDATE_PROFILE: '/client/auth/update-profile',
  COURSE_LIST: '/course/list',
  COURSE_DETAIL: '/course/',
  COURSE_RATINGS: '/course/:courseId/rate',
  CREATE_COURSE: '/course',
  UPDATE_COURSE: '/course/',
  DELETE_COURSE: '/course/',
  UPLOAD: '/upload',
  GET_QINIU_TOKEN: '/upload/qiniu-token',
  SCHEDULE_LIST: '/schedule/list',
  CREATE_SCHEDULE: '/schedule/create',
  DELETE_SCHEDULE: '/schedule/delete/',
  EXERCISE_LIST: '/exercise/list'
};
