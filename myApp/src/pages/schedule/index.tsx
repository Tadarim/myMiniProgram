import { View, Text, Image } from '@tarojs/components';
import { useState } from 'react';
import { CalendarCard } from '@nutui/nutui-react-taro';
import NavigationBar from '@/components/NavigationBar';
import './index.less';

interface ScheduleItem {
  id: number;
  title: string;
  time: string;
  icon: string;
}

const Schedule: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const scheduleList: ScheduleItem[] = [
    {
      id: 1,
      title: '完成web大作业',
      time: '14:00-16:00',
      icon: 'https://img.icons8.com/color/48/000000/task.png'
    },
    {
      id: 2,
      title: '准备期末考试',
      time: '19:00-21:00',
      icon: 'https://img.icons8.com/color/48/000000/exam.png'
    }
  ];

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <View className='schedule-page'>
      <NavigationBar title='学习计划' useOpacity />
      <View className='calendar'>
        <CalendarCard
          defaultValue={selectedDate}
          onClick={handleDayClick}
          showToday
          showTitle
          autoBackfill
        />
      </View>

      <View className='schedule-list'>
        <Text className='schedule-list-title'>今日计划</Text>
        {scheduleList.map((item) => (
          <View key={item.id} className='schedule-list-item'>
            <Image className='schedule-list-item-icon' src={item.icon} />
            <View className='schedule-list-item-content'>
              <Text className='schedule-list-item-content-title'>{item.title}</Text>
              <Text className='schedule-list-item-content-time'>{item.time}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className='add-button'>
        <Text>添加计划</Text>
      </View>
    </View>
  );
};

export default Schedule;
