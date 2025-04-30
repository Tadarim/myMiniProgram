import { View, Input, Image } from '@tarojs/components';
import Taro, { switchTab } from '@tarojs/taro';

import { Search } from '@nutui/icons-react-taro';
import { InfiniteLoading } from '@nutui/nutui-react-taro';
import { useState, useEffect } from 'react';

import { courseService } from '@/api/course';
import NavigationBar from '@/components/navigationBar';
import { genUrl } from '@/utils';
import './index.less';

const CourseListPage: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  // 获取课程列表
  const fetchCourses = async (isLoadMore = false) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const currentPage = isLoadMore ? page + 1 : 1;
      const response = await courseService.getCourseList({
        page: currentPage,
        pageSize,
        keyword: searchKeyword ?? ''
      });

      if (response.code === 200) {
        const newCourses = response.data;
        setCourses(isLoadMore ? [...courses, ...newCourses] : newCourses);
        setPage(currentPage);
        setTotal(response.total || 0);
      }
    } catch (error) {
      console.error('获取课程列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(false);
  }, [searchKeyword]);

  const handleSearch = (e) => {
    setSearchKeyword(e.detail.value);
  };

  // 处理课程点击
  const handleCourseClick = (course) => {
    Taro.navigateTo({
      url: genUrl('/pages/courseDetail/index', {
        id: course.id,
        title: course.title,
        cover: course.cover
      })
    });
  };

  const loadMore = async () => {
    if (courses.length < total && !isLoading) {
      await fetchCourses(true);
    }
  };

  return (
    <View className='courseList-page'>
      <NavigationBar title='课程列表' />

      <View className='search-bar'>
        <View className='search-input-wrapper'>
          <Search className='search-icon' />
          <Input
            className='search-input'
            type='text'
            placeholder='搜索课程'
            placeholderStyle='color: #999'
            value={searchKeyword}
            onInput={handleSearch}
          />
        </View>
      </View>

      <InfiniteLoading
        isLoading={isLoading}
        hasMore={courses.length < total}
        loadMore={loadMore}
      >
        <View className='course-list'>
          {courses.map((course, index) => (
            <View
              key={index}
              className='course-item'
              onClick={() => handleCourseClick(course)}
            >
              <Image
                className='course-image'
                src={course.cover}
                lazyLoad
                mode='aspectFill'
              />
              <View className='course-info'>
                <View className='course-title'>{course.title}</View>
                <View className='course-desc'>{course.description}</View>
                <View className='course-meta'>
                  <View className='course-rating'>评分：{course.rating}</View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </InfiniteLoading>
    </View>
  );
};

export default CourseListPage;
