import { View, Input } from '@tarojs/components';
import { navigateTo } from '@tarojs/taro';

import { Edit, Search } from '@nutui/icons-react-taro';
import { InfiniteLoading } from '@nutui/nutui-react-taro';
import React, { useEffect, useState } from 'react';

import { exerciseService } from '@/api/exercise';
import { MyEmpty } from '@/components/empty';
import List from '@/components/list';
import NavigationBar from '@/components/navigationBar';
import { Exercise } from '@/types/exercise';
import { genUrl } from '@/utils';

import './index.less';

const ExerciseList: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const fetchExercises = async (isLoadMore = false) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const currentPage = isLoadMore ? page + 1 : 1;
      const res = await exerciseService.getExerciseList({
        page: currentPage,
        pageSize,
        keyword: searchKeyword ?? ''
      });

      if (res.code === 200 && res.data) {
        const newExercises = res.data;
        setExercises(isLoadMore ? [...exercises, ...newExercises] : res.data);
        setPage(currentPage);
        setTotal(res.total || 0);
      }
    } catch (error) {
      console.error('获取习题列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [searchKeyword]);

  const handleSearch = (e) => {
    setSearchKeyword(e.detail.value);
  };

  const loadMore = async () => {
    if (exercises.length < total && !isLoading) {
      await fetchExercises(true);
    }
  };

  const handleExerciseClick = (exercise) => {
    navigateTo({
      url: genUrl('/pages/exerciseDetail/index', {
        title: exercise.title,
        id: exercise.id,
        desc: exercise.description
      })
    });
  };

  if (!isLoading && exercises.length === 0) {
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
              onInput={handleSearch}
            />
          </View>
        </View>
        <MyEmpty title='暂无搜索结果' type='search' />
      </View>
    );
  }

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
            onInput={handleSearch}
          />
        </View>
      </View>
      <InfiniteLoading hasMore={exercises.length < total} onLoadMore={loadMore}>
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
      </InfiniteLoading>
    </View>
  );
};

export default ExerciseList;
