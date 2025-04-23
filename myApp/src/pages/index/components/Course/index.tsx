import { ScrollView, View, Image } from '@tarojs/components';
import { navigateTo } from '@tarojs/taro';
import './index.less';

const Course = () => {
  const handleCourseClick = (course: { id: number; courseName: string; cover: string }) => {
    navigateTo({
      url: `/pages/courseDetail/index?id=${course.id}&title=${encodeURIComponent(course.courseName)}&cover=${course.cover}`
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
      {[
        {
          id: 1,
          courseName: '软件工程',
          cover:
            'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&q=80'
        },
        {
          id: 2,
          courseName: '计算机导论',
          cover:
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80'
        },
        {
          id: 3,
          courseName: '数据结构',
          cover:
            'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=500&q=80'
        },
        {
          id: 4,
          courseName: '数据库原理与应用',
          cover:
            'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&q=80'
        }
      ].map((item, index) => {
        const { id, courseName, cover } = item;
        return (
          <View
            className='recommend-course-item'
            key={id}
            onClick={() => handleCourseClick(item)}
          >
            <View className='recommend-course-item-title'>{courseName}</View>
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
