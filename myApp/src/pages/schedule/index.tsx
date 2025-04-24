import { View, Text } from '@tarojs/components';

import { Dialog } from '@nutui/nutui-react-taro';
import { useState } from 'react';

import { PopupRender } from './components/popup';
import { ScheduleItem } from './components/scheduleItem';

import { MyEmpty } from '@/components/Empty';
import NavigationBar from '@/components/NavigationBar';
import Title from '@/components/Title';

import './index.less';

interface ScheduleItem {
  id: number | string;
  title: string;
  time: string;
  desc: string;
}

const Schedule: React.FC = () => {
  const mockScheduleList: ScheduleItem[] = [
    {
      id: '1',
      title: '完成web大作业',
      time: '4.19 | 14:00-16:00',
      desc: '完成web大作业'
    },
    {
      id: '2',
      title: '准备期末考试',
      time: '4.19 | 19:00-21:00',
      desc: '准备期末考试'
    }
  ];

  const [scheduleList, setScheduleList] = useState(mockScheduleList);
  const [showPopup, setShowPopup] = useState(false);

  const deleteHandler = (id: string | number) => {
    Dialog.open('dialog', {
      title: '确定要删除该计划么？',
      onConfirm: () => {
        setScheduleList((prevList) =>
          prevList.filter((item) => item.id !== id)
        );
        setTimeout(() => {
          Dialog.close('dialog');
        }, 200);
      },
      onCancel: () => {
        Dialog.close('dialog');
      }
    });
  };

  const addHandler = (item: ScheduleItem) => {
    setScheduleList((prevList) => [...prevList, item]);
  };

  return (
    <View className='page-container'>
      <NavigationBar title='学习计划' useOpacity={false} />

      {scheduleList.length ? (
        <View className='schedule-container'>
          <Title text='本周计划' />
          {scheduleList.map((item) => (
            <ScheduleItem
              key={item.id}
              item={item}
              onDeleteHandler={deleteHandler}
            />
          ))}

          <View className='add-button' onClick={() => setShowPopup(true)}>
            <Text>添加计划</Text>
          </View>

          <Dialog id='dialog' />
        </View>
      ) : (
        <MyEmpty title='暂时还没有计划~' />
      )}

      <PopupRender
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        onConfirm={addHandler}
      />
    </View>
  );
};

export default Schedule;
