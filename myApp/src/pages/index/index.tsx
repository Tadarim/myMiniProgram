import { View } from '@tarojs/components';
import Taro, { navigateTo, getStorageSync } from '@tarojs/taro';

import { Edit } from '@nutui/icons-react-taro';
import { useEffect, useState } from 'react';

import Course from './components/course';
import Navigation from './components/navigation';

import { getRecommendations } from '@/api/recommend';
import Banner from '@/components/banner';
import List from '@/components/list';
import RecommendModal from '@/components/modal';
import NavigationBar from '@/components/navigationBar';
import Title from '@/components/title';
import { Course as CourseType } from '@/types/course';
import { genUrl } from '@/utils';

import './index.less';

function Index() {
  const [courseList, setCourseList] = useState<CourseType[]>([]);
  const [exerciseList, setExerciseList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRecommendModal, setShowRecommendModal] = useState(false);

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

    const isFirstLogin = Taro.getStorageSync('isFirstLogin');
    if (isFirstLogin) {
      setShowRecommendModal(true);
    }
    Taro.setStorageSync('isFirstLogin', true);

    const fetchRecommendData = async () => {
      try {
        setLoading(true);
        const res = await getRecommendations();
        if (res.code === 200 && res.success) {
          setCourseList(res.data.courses.slice(0, 4));
          setExerciseList(res.data.exercises);
        } else {
          setCourseList([]);
          setExerciseList([]);
        }
      } catch (e) {
        console.error('获取推荐内容失败', e);
        setCourseList([]);
        setExerciseList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendData();
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
          text='推荐题库'
          onMoreClick={() => {
            Taro.navigateTo({ url: '/pages/exerciseList/index' });
          }}
        />
        <List
          contentList={exerciseList}
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
      <RecommendModal
        visible={showRecommendModal}
        onClose={() => setShowRecommendModal(false)}
      />
    </View>
  );
}

export default Index;
