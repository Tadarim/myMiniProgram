import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import enUS from '@nutui/nutui-react-taro/dist/locales/en-US';
import zhCN from '@nutui/nutui-react-taro/dist/locales/zh-CN';
import React, { useState } from 'react';

import Course from './components/Course';
import Navigation from './components/Navigation';

import Banner from '@/components/Banner';
import Title from '@/components/Title';

import './index.less';

function Index() {
  const [locale, setLocale] = useState(zhCN);
  const localeKey = locale === zhCN ? 'zhCN' : 'enUS';
  const [visible, setVisible] = useState(false);
  const [translated] = useState({
    zhCN: {
      welcome: '欢迎使用 NutUI React 开发 Taro 多端项目。',
      button: '使用英文',
      open: '点击打开'
    },
    enUS: {
      welcome:
        'Welcome to use NutUI React to develop Taro multi-terminal projects.',
      button: 'Use Chinese',
      open: 'Click Me'
    }
  });

  const { statusBarHeight } = Taro.getSystemInfoSync();
  const handleSwitchLocale = () => {
    setLocale(locale === zhCN ? enUS : zhCN);
  };
  return (
    <View className='home'>
      <Banner />
      <Navigation />
      <View className='home-main'>
        <Title text='推荐课程' />
        <Course />
      </View>
    </View>
  );
}

export default Index;
