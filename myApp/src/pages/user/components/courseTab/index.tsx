import { View } from '@tarojs/components';

import List from '@/components/list';

interface CourseItem {
  id: number | string;
  title: string;
  cover: string;
  desc: string;
}

interface CourseTabProps {
  courseList: CourseItem[];
}

export const CourseTab = ({ courseList }: CourseTabProps) => {
  return (
    <View className='sub-tab-container'>
      <List contentList={courseList} />
    </View>
  );
};
