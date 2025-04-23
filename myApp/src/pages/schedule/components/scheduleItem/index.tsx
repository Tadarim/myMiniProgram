import { View, Image, Text } from '@tarojs/components';

import { Del } from '@nutui/icons-react-taro';

import './index.less';

interface ScheduleItemProps {
  key?: string | number;
  item: {
    id: string | number;
    title: string;
    time: string;
  };
  onDeleteHandler?: (id: string | number) => void;
}

const iconUrl = 'https://img.icons8.com/color/48/000000/task.png';

export const ScheduleItem = ({ item, onDeleteHandler }: ScheduleItemProps) => {
  return (
    <View className='schedule-item'>
      <Image className='schedule-item-icon' src={iconUrl} />
      <View className='schedule-item-content'>
        <Text className='schedule-item-title'>{item.title}</Text>
        <Text className='schedule-item-time'>{item.time}</Text>
      </View>
      {onDeleteHandler && (
        <Del
          className='schedule-item-delete'
          onClick={() => {
            onDeleteHandler(item.id);
          }}
        />
      )}
    </View>
  );
};
