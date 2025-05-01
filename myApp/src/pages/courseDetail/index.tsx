import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter, showToast } from '@tarojs/taro';

import { Star, StarFill } from '@nutui/icons-react-taro';
import { Rate } from '@nutui/nutui-react-taro';
import { useEffect, useState } from 'react';

import { courseService } from '@/api/course';
import List from '@/components/list';
import NavigationBar from '@/components/navigationBar';
import Title from '@/components/title';
import { Course, Chapter } from '@/types/course';
import { genUrl } from '@/utils';

import './index.less';

const CourseDetail = () => {
  const router = useRouter();
  const [courseInfo, setCourseInfo] = useState<Course>({
    id: 0,
    title: '',
    cover: '',
    description: '',
    chapters: [],
    rating: 0,
    is_collected: false
  });

  const [isCollected, setIsCollected] = useState(courseInfo.is_collected);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const courseId = router.params.id;
        if (!courseId) return;

        const response = await courseService.getCourseDetail(Number(courseId));
        if (response.code === 200 && response.data) {
          setCourseInfo((prev) => ({
            ...prev,
            ...response.data
          }));
        }
      } catch (error) {
        console.error('获取课程详情失败:', error);
        showToast({
          title: '获取课程详情失败',
          icon: 'none'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetail();
  }, [router.params.id]);

  const handleFavoriteToggle = () => {
    const newFavoriteStatus = !isCollected;
    setIsCollected(newFavoriteStatus);

    showToast({
      title: newFavoriteStatus ? '收藏成功' : '取消收藏',
      icon: 'success',
      duration: 1500
    });
  };

  const handleRatingChange = async (value: number) => {
    try {
      const courseId = router.params.id;
      if (!courseId) return;

      const response = await courseService.rateCourse(Number(courseId), {
        rating: value,
        comment: '' // 暂时不添加评论
      });

      if (response.code === 200) {
        setUserRating(value);
        showToast({
          title: '评分成功',
          icon: 'success',
          duration: 1500
        });
      } else {
        showToast({
          title: response.message || '评分失败',
          icon: 'none',
          duration: 1500
        });
      }
    } catch (error) {
      console.error('评分失败:', error);
      showToast({
        title: '评分失败',
        icon: 'none',
        duration: 1500
      });
    }
  };

  const handleChapterClick = (chapter: Chapter) => {
    Taro.navigateTo({
      url: genUrl('/pages/chapterDetail/index', {
        chapter: JSON.stringify(chapter)
      })
    });
  };

  if (isLoading) {
    return (
      <View className='course-detail'>
        <NavigationBar title='课程详情' />
        <View className='loading'>加载中...</View>
      </View>
    );
  }

  return (
    <View className='course-detail'>
      <View className='course-header'>
        <Image
          className='course-cover'
          src={courseInfo.cover}
          mode='aspectFill'
        />
        <NavigationBar title={courseInfo.title || '课程详情'} useOpacity />
        <View className='course-info'>
          <Text className='course-title'>{courseInfo.title}</Text>
          <View className='favorite-button' onClick={handleFavoriteToggle}>
            {isCollected ? (
              <StarFill color='gold' size={24} />
            ) : (
              <Star color='#fff' size={24} />
            )}
          </View>
        </View>
      </View>

      <View className='course-description'>
        <View className='description-header'>
          <Title text='课程简介' />
          <View className='rating-section'>
            <Rate
              count={5}
              value={userRating ?? courseInfo.rating}
              allowHalf
              onChange={handleRatingChange}
            />
          </View>
        </View>
        <Text className='description-text'>{courseInfo.description}</Text>
      </View>

      <View className='course-chapters'>
        <Title text='课程大纲' />
        <List
          contentList={courseInfo.chapters}
          onItemClick={handleChapterClick}
        />
      </View>
    </View>
  );
};

export default CourseDetail;
