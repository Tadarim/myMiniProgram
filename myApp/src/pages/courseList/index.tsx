import { View, Input, Image } from '@tarojs/components';
import Taro, { switchTab } from '@tarojs/taro';

import { Search } from '@nutui/icons-react-taro';
import React from 'react';

import NavigationBar from '@/components/NavigationBar';
import './index.less';
import { genUrl } from '@/utils';

const courseListPage: React.FC = () => {
  const categories = [
    {
      title: '软件工程',
      cover:
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&q=80'
    },
    {
      title: 'web前端',
      cover:
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80'
    },
    {
      title: '计算机网络',
      cover:
        'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=500&q=80'
    },
    {
      title: '数据库',
      cover:
        'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&q=80'
    },
    {
      title: '软件测试',
      cover:
        'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=500&q=80'
    },
    {
      title: '计算机算法',
      cover:
        'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&q=80'
    },
    {
      title: 'Java高级',
      cover:
        'https://images.unsplash.com/photo-1623479322729-28b25c16b011?w=500&q=80'
    }
  ];

  const handleCourseListClick = (courseList) => {
    // 跳转到课程详情页
    Taro.navigateTo({
      url: genUrl('/pages/courseDetail/index', {
        title: courseList.title,
        cover: courseList.cover
      })
    });
  };

  return (
    <View className='courseList-page'>
      <NavigationBar
        title='课程分类'
        beforeBack={() => {
          switchTab({ url: '/pages/index/index' });
        }}
      />
      <View className='search-bar'>
        <View className='search-input-wrapper'>
          <Search className='search-icon' />
          <Input
            className='search-input'
            type='text'
            placeholder='搜索课程'
            placeholderStyle='color: #999'
          />
        </View>
      </View>
      <View className='courseList-grid'>
        {categories.map((courseList, index) => (
          <View
            key={index}
            className='courseList-item'
            onClick={() => handleCourseListClick(courseList)}
          >
            <View className='courseList-title'>{courseList.title}</View>
            <Image
              className='courseList-image'
              src={courseList.cover}
              lazyLoad
              mode='aspectFill'
            />
          </View>
        ))}
      </View>
    </View>
  );
};

export default courseListPage;
