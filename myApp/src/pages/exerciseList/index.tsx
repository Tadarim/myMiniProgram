import { View, Input } from '@tarojs/components';
import { navigateTo } from '@tarojs/taro';

import { Edit, Search } from '@nutui/icons-react-taro';
import React from 'react';

import List from '@/components/List';
import NavigationBar from '@/components/NavigationBar';
import { genUrl } from '@/utils';

import './index.less';

const ExerciseList: React.FC = () => {
  const exercises = [
    {
      id: '111',
      title: '软件工程第一章',
      desc: '131人完成 共6题'
    },
    {
      id: '222',
      title: 'UML建模',
      desc: '23人完成 共14题'
    },
    {
      id: '333',
      title: '前端面试必备',
      desc: '45人完成 共8题'
    },
    {
      id: '444',
      title: 'Linux从入门到精通',
      desc: '664人完成 共12题'
    },
    {
      id: '555',
      title: '计算机网络',
      desc: '243人完成 共10题'
    },
    {
      id: '666',
      title: '计算机算法',
      desc: '78人完成 共22题'
    }
  ];

  const handleExerciseClick = (exercise) => {
    navigateTo({
      url: genUrl('/pages/exerciseDetail/index', {
        title: exercise.title,
        id: exercise.id,
        desc: exercise.desc,
        cover: exercise.cover ?? ''
      })
    });
  };

  return (
    <View className='exercise-list-page'>
      <NavigationBar title='习题列表' />
      <View className='search-bar'>
        <View className='search-input-wrapper'>
          <Search className='search-icon' />
          <Input
            className='search-input'
            type='text'
            placeholder='搜索习题'
            placeholderStyle='color: #999'
          />
        </View>
      </View>
      <List
        contentList={exercises}
        itemStyle={{
          margin: '0 15px',
          marginBottom: '8px',
          borderRadius: '8px'
        }}
        itemSuffix={() => (
          <View
            style={{
              paddingRight: '10px',
              height: '100%',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Edit color='#4A90E2' size={24} />
          </View>
        )}
        onItemClick={handleExerciseClick}
      />
    </View>
  );
};

export default ExerciseList;
