export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/chat/index',
    'pages/forum/index',
    'pages/user/index',
    'pages/category/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'static/icon/unselected/home.png',
        selectedIconPath: 'static/icon/selected/home.png'
      },
      {
        pagePath: 'pages/chat/index',
        text: '聊天',
        iconPath: 'static/icon/unselected/chat.png',
        selectedIconPath: 'static/icon/selected/chat.png'
      },
      {
        pagePath: 'pages/forum/index',
        text: '论坛',
        iconPath: 'static/icon/unselected/forum.png',
        selectedIconPath: 'static/icon/selected/forum.png'
      },
      {
        pagePath: 'pages/user/index',
        text: '我的',
        iconPath: 'static/icon/unselected/user.png',
        selectedIconPath: 'static/icon/selected/user.png'
      }
    ],
    color: '#2c2c2c',
    selectedColor: '#09AAFF'
  }
});
