import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import List from '@/components/list';
import { genUrl } from '@/utils';

interface ExerciseItem {
  id: number | string;
  title: string;
  cover?: string;
  desc: string;
}

interface ExerciseTabProps {
  exerciseList: ExerciseItem[];
}

export const ExerciseTab = ({ exerciseList }: ExerciseTabProps) => {
  const handleItemClick = (item: ExerciseItem) => {
    Taro.navigateTo({
      url: genUrl('/pages/exerciseDetail/index', { id: item.id })
    });
  };

  return (
    <View className='sub-tab-container'>
      <List contentList={exerciseList} onItemClick={handleItemClick} />
    </View>
  );
};
