import { ScrollView, View, Image } from '@tarojs/components';
import { navigateTo } from '@tarojs/taro';

import { Course as CourseType } from '@/types/course';

import './index.less';

const Course = ({ courseList }: { courseList: CourseType[] }) => {
  const handleCourseClick = (course: {
    id: number;
    title: string;
    cover: string;
  }) => {
    navigateTo({
      url: `/pages/courseDetail/index?id=${
        course.id
      }&title=${encodeURIComponent(course.title)}&cover=${course.cover}`
    });
  };

  return (
    <ScrollView
      className='recommend-course'
      enableFlex
      enhanced
      showScrollbar={false}
      scrollX
      scrollWithAnimation
    >
      {courseList.map((item, index) => {
        const { id, title, cover } = item;
        return (
          <View
            className='recommend-course-item'
            key={id}
            onClick={() => handleCourseClick(item)}
          >
            <View className='recommend-course-item-title'>{title}</View>
            <Image
              className='recommend-course-item-image'
              src={cover}
              lazyLoad
              mode='aspectFill'
            />
          </View>
        );
      })}
    </ScrollView>
  );
};

export default Course;
