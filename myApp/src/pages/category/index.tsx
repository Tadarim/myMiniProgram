import { View, Input, Image } from '@tarojs/components';
import React from 'react';

import NavigationBar from '@/components/NavigationBar';
import { Search } from '@nutui/icons-react-taro';

import './index.less';

const CategoryPage: React.FC = () => {
  const categories = [
    {
      title: '软件工程',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&q=80'
    },
    {
      title: 'web前端',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80'
    },
    {
      title: '计算机网络',
      image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=500&q=80'
    },
    {
      title: '数据库',
      image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&q=80'
    },
    {
      title: '软件测试',
      image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=500&q=80'
    },
    {
      title: '计算机算法',
      image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&q=80'
    },
    {
      title: 'Java高级',
      image: 'https://images.unsplash.com/photo-1623479322729-28b25c16b011?w=500&q=80'
    }
  ];

  const handleCategoryClick = (category) => {
    // 处理分类点击事件
    console.log('Clicked category:', category.title);
  };

  return (
    <View className='category-page'>
      <NavigationBar title='课程分类' />
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
      <View className='category-grid'>
        {categories.map((category, index) => (
          <View
            key={index}
            className='category-item'
            onClick={() => handleCategoryClick(category)}
          >
            <View className='category-title'>{category.title}</View>
            <Image
              className='category-image'
              src={category.image}
              lazyLoad
              mode='aspectFill'
            />
          </View>
        ))}
      </View>
    </View>
  );
};

export default CategoryPage;
