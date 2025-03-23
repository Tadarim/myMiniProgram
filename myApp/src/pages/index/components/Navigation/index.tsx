import { View, Image } from '@tarojs/components';

import React from 'react';
import './index.less';

const Navigation = () => {
  const navigationList = [
    { title: '课程', icon: 'icon-course', link: '/pages/courseList/index' },
    { title: '做题', icon: 'icon-exam', link: '/pages/exerciseList/index' },
    { title: '分类', icon: 'icon-type', link: '' },
    { title: '排行', icon: 'icon-rank', link: '/pages/rankList/index' }
  ];

  return (
    <View className='navigation-wrapper'>
      <View className='navigation'>
        {navigationList.map((item, index) => {
          const { title, icon, link } = item;
          return (
            <View className='navigation-item' key={index}>
              <Image className='navigation-icon' src='' />
              <View className='navigation-title'>{title}</View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default Navigation;
