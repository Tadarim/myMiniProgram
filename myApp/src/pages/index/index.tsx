import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import enUS from '@nutui/nutui-react-taro/dist/locales/en-US';
import zhCN from '@nutui/nutui-react-taro/dist/locales/zh-CN';
import React, { useState } from 'react';

import Course from './components/Course';
import Navigation from './components/Navigation';

import Banner from '@/components/Banner';
import ImageWrapper from '@/components/ImageWrapper';
import List, { SceneType } from '@/components/List';
import Title from '@/components/Title';

import './index.less';
import NavigationBar from '@/components/NavigationBar';

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

  const mockList = [
    {
      title: '软件工程第一章',
      desc: '这是软件工程的第一张题目喔~这是软件工程的第一张题目喔~',
      cover:
        'https://img20.360buyimg.com/openfeedback/jfs/t1/283794/20/8607/4775/67e17970Fdef6707f/af26052f0e9d5999.jpg'
    },
    {
      title: '软件工程第一章',
      desc: '这是软件工程的第一张题目喔~这是软件工程的第一张题目喔~'
    },
    {
      title: '软件工程第一章',
      desc: '这是软件工程的第一张题目喔~这是软件工程的第一张题目喔~'
    },
    {
      title: '软件工程第一章',
      desc: '这是软件工程的第一张题目喔~这是软件工程的第一张题目喔~'
    },
    {
      title: '软件工程第一章',
      desc: '这是软件工程的第一张题目喔~这是软件工程的第一张题目喔~'
    }
  ];

  const contentList = mockList.map((item) => ({
    ...item,
    prefix: () =>
      item.cover ? (
        <ImageWrapper
          style={{ width: '50px', height: '50px', marginRight: '15px' }}
          src={item.cover}
        />
      ) : null
  }));
  return (
    <View className='home'>
      <NavigationBar title='首页' showBack={false} useOpacity />
      <Banner />
      <Navigation />
      <View className='home-main'>
        <Title
          text='推荐课程'
          onMoreClick={() => {
            Taro.navigateTo({ url: '/pages/category/index' });
          }}
        />
        <Course />
        <Title text='热门题库' />
        <List contentList={contentList} scene={SceneType.DeleteMode} />
      </View>
    </View>
  );
}

export default Index;
