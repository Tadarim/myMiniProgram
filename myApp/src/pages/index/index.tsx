import { View } from '@tarojs/components';
import Taro, { navigateTo, getStorageSync } from '@tarojs/taro';

import { Edit } from '@nutui/icons-react-taro';
import { useEffect, useState } from 'react';

import Course from './components/course';
import Navigation from './components/navigation';

import { courseService } from '@/api/course';
import { exerciseService } from '@/api/exercise';
import Banner from '@/components/banner';
import List from '@/components/list';
import NavigationBar from '@/components/navigationBar';
import Title from '@/components/title';
import { Course as CourseType } from '@/types/course';
import { genUrl } from '@/utils';

import './index.less';

function Index() {
  const [courseList, setCourseList] = useState<CourseType[]>([]);
  const [hotExerciseList, setHotExerciseList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleExerciseClick = (exercise) => {
    navigateTo({
      url: genUrl('/pages/exerciseDetail/index', {
        title: exercise.title,
        id: exercise.id
      })
    });
  };

  useEffect(() => {
    const token = getStorageSync('token');
    if (!token) {
      navigateTo({ url: '/pages/login/index' });
    }

    const fetchCourseList = async () => {
      const res = await courseService.getCourseList({
        page: 1,
        pageSize: 10
      });
      setCourseList(res.data.slice(0, 4));
    };

    const fetchHotExercises = async () => {
      try {
        setLoading(true);
        const res = await exerciseService.getPopularExercises(5);
        if (res.code === 200 && res.success) {
          setHotExerciseList(res.data);
        }
      } catch (error) {
        console.error('获取热门题库失败', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseList();
    fetchHotExercises();
  }, []);

  return (
    <View className='home'>
      <NavigationBar title='首页' showBack={false} useOpacity />
      <Banner />
      <Navigation />
      <View className='home-main'>
        <Title
          text='推荐课程'
          onMoreClick={() => {
            Taro.navigateTo({ url: '/pages/courseList/index' });
          }}
        />
        <Course courseList={courseList} />
        <Title
          text='热门题库'
          onMoreClick={() => {
            Taro.navigateTo({ url: '/pages/exerciseList/index' });
          }}
        />
        <List
          contentList={hotExerciseList}
          loading={loading}
          onItemClick={handleExerciseClick}
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
        />
      </View>
    </View>
  );
}

export default Index;
