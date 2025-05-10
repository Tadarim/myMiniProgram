import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import List from '@/components/list';
import { genUrl } from '@/utils';

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
  const handleItemClick = (item: CourseItem) => {
    Taro.navigateTo({
      url: genUrl('/pages/courseDetail/index', { id: item.id })
    });
  };

  return (
    <View className='sub-tab-container'>
      <List contentList={courseList} onItemClick={handleItemClick} />
    </View>
  );
};
