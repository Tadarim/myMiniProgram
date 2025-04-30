import { View } from '@tarojs/components';

import List from '@/components/list';

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
  return (
    <View className='sub-tab-container'>
      <List contentList={exerciseList} />
    </View>
  );
};
