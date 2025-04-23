import { View } from '@tarojs/components';

import {
  Button,
  Popup,
  Cell,
  Calendar,
  DatePicker,
  Input,
  PickerValue,
  PickerOptions,
  TextArea
} from '@nutui/nutui-react-taro';
import { useState, useRef } from 'react';

interface PopupProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (params: any) => void;
}

export const PopupRender = ({ visible, onClose, onConfirm }: PopupProps) => {
  const [date, setDate] = useState<string[]>([]);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [datePickershow, setDatePickerShow] = useState(false);
  const [dpAbled, setDatePickerAbled] = useState([false, false]);
  const [startTime, setStartTime] = useState('10:00:00');
  const [endTime, setEndTime] = useState('20:00:00');
  const desc = useRef(0);

  const setChooseValue = (chooseData: any) => {
    const dateArr = [...[chooseData[0][3], chooseData[1][3]]];
    setDate([...dateArr]);
  };

  const padZero = (num: number | string, targetLength = 2) => {
    let str = `${num}`;
    while (str.length < targetLength) {
      str = `0${str}`;
    }
    return str;
  };

  const confirm = (values: PickerValue[], options: PickerOptions) => {
    if (desc.current === 1) {
      setStartTime(
        options
          .map((option) => padZero(parseInt(option.label as string)))
          .join(':')
      );
    } else {
      setEndTime(
        options
          .map((option) => padZero(parseInt(option.label as string)))
          .join(':')
      );
    }
  };

  const showDatePicker = (e: any, index: number) => {
    if (dpAbled[index - 1]) {
      e.stopPropagation();
      setDatePickerShow(true);
      desc.current = index;
    }
  };

  const openSwitch = () => {
    setIsCalendarVisible(true);
  };

  const closeSwitch = () => {
    setIsCalendarVisible(false);
  };

  return (
    <Popup
      closeable
      visible={visible}
      title='添加计划'
      description={
        <>
          <Cell
            title='日期区间'
            description={
              <View className='desc-box'>
                <View className='desc' onClick={openSwitch}>
                  {date && date.length
                    ? `${date[0]} ${startTime}`
                    : '请选择起始时间'}
                </View>
                <View className='desc1'>-</View>
                <View className='desc' onClick={openSwitch}>
                  {date && date.length
                    ? `${date[1]} ${endTime}`
                    : '请选择截止时间'}
                </View>
              </View>
            }
            style={{ width: '100%' }}
          />
          <Cell
            title='计划名称'
            description={
              <Input
                placeholder='请输入计划标题'
                value={title}
                onChange={(val) => setTitle(val)}
              />
            }
            style={{ width: '100%' }}
          />
          <Cell
            title='计划详情'
            description={
              <TextArea
                placeholder='请输入计划详情'
                value={description}
                onChange={(val) => setDescription(val)}
                showCount
                maxLength={200}
              />
            }
            style={{ width: '100%' }}
          />
          <Button
            block
            type='primary'
            disabled={!(title && description && date)}
            onClick={() => {
              onConfirm({
                title,
                desc: description,
                time: `${date[0]} ${startTime} - ${date[1]} ${endTime}`,
                id: Date.now()
              });
              setTimeout(() => onClose(), 100);
            }}
          >
            添加
          </Button>
          <Calendar
            visible={isCalendarVisible}
            defaultValue={date}
            type='range'
            startDate='2025-01-01'
            endDate='2026-01-10'
            firstDayOfWeek={1}
            onDayClick={(date) => {
              let d = [false, false];
              if (date.length > 1) {
                d = [true, true];
              } else if (date.length > 0) {
                d = [true, false];
              }
              setDatePickerAbled(d);
            }}
            onClose={closeSwitch}
            onConfirm={setChooseValue}
          >
            <View className='time-btn-container'>
              <View
                className={`time-btn ${dpAbled[0] ? '' : 'disabled'}`}
                onClick={(e) => {
                  showDatePicker(e, 1);
                }}
              >
                开始时间：{startTime}
              </View>
              -
              <View
                className={`time-btn ${dpAbled[1] ? '' : 'disabled'}`}
                onClick={(e) => {
                  showDatePicker(e, 2);
                }}
              >
                结束时间：{endTime}
              </View>
            </View>
            <DatePicker
              title='时间选择'
              type='time'
              visible={datePickershow}
              showChinese
              onClose={() => setDatePickerShow(false)}
              onConfirm={(options, values) => confirm(values, options)}
            />
          </Calendar>
        </>
      }
      position='bottom'
      onClose={onClose}
    />
  );
};
