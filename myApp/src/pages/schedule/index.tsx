import { View, Text } from '@tarojs/components';

import { Dialog } from '@nutui/nutui-react-taro';
import { useState, useEffect } from 'react';

import { PopupRender } from './components/popup';
import { ScheduleItem } from './components/scheduleItem';

import {
  getScheduleList,
  createSchedule,
  deleteSchedule
} from '@/api/schedule';
import { ScheduleItem as ScheduleItemType } from '@/api/types';
import { MyEmpty } from '@/components/empty';
import NavigationBar from '@/components/navigationBar';
import Title from '@/components/title';

import './index.less';

const Schedule: React.FC = () => {
  const [scheduleList, setScheduleList] = useState<ScheduleItemType[]>([]);
  const [showPopup, setShowPopup] = useState(false);

  // 获取日程列表
  const fetchScheduleList = async () => {
    try {
      const res = await getScheduleList();
      if (res.data.success && res.data.data) {
        setScheduleList(res.data.data);
      }
    } catch (error) {
      console.error('获取日程列表失败:', error);
    }
  };

  useEffect(() => {
    fetchScheduleList();
  }, []);

  const deleteHandler = (id: string | number) => {
    Dialog.open('dialog', {
      title: '确定要删除该计划么？',
      onConfirm: async () => {
        try {
          const res = await deleteSchedule(id);
          if (res.data.success) {
            setScheduleList((prevList) =>
              prevList.filter((item) => item.id !== id)
            );
          }
        } catch (error) {
          console.error('删除日程失败:', error);
        }
        setTimeout(() => {
          Dialog.close('dialog');
        }, 200);
      },
      onCancel: () => {
        Dialog.close('dialog');
      }
    });
  };

  const addHandler = async (item: ScheduleItemType) => {
    try {
      const res = await createSchedule({
        title: item.title,
        time: item.time,
        description: item.description
      });
      if (res.data.success && res.data.data) {
        setScheduleList((prevList) => [...prevList, res.data.data]);
      }
    } catch (error) {
      console.error('创建日程失败:', error);
    }
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
        <View>
          <MyEmpty title='暂时还没有计划~' />

          <View className='add-button' onClick={() => setShowPopup(true)}>
            <Text>添加计划</Text>
          </View>

          <Dialog id='dialog' />
        </View>
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
