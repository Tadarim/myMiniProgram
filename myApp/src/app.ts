import { useDidShow, useDidHide, useLaunch } from '@tarojs/taro';

import React, { useEffect } from 'react';
// 全局样式
import './app.less';
import { useNavigationBar } from '@/hooks/useNavigationBar';

function App(props) {
  const { initNavigationBar } = useNavigationBar();
  // 可以使用所有的 React Hooks
  useEffect(() => {});

  // 对应 onShow
  useDidShow(() => {});

  // 对应 onHide
  useDidHide(() => {});

  useLaunch(() => initNavigationBar());

  return props.children;
}

export default App;
