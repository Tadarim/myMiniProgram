import { View } from '@tarojs/components';

import { Tabs } from '@nutui/nutui-react-taro';
import { useState } from 'react';

import './index.less';
import ProfileBg from './components/ProfileBg';
import ProfileInfo from './components/ProfileInfo';

const Profile = () => {
  const [tab1value, setTab1value] = useState<string | number>('0');

  return (
    <View>
      <ProfileBg bgImgUrl='https://img20.360buyimg.com/openfeedback/jfs/t1/271475/20/10105/30568/67e3f73cF2b9f9da3/dcd44662c5bbc8e7.jpg' />
      <ProfileInfo />
      <Tabs
        value={tab1value}
        onChange={(value) => {
          setTab1value(value);
        }}
        activeType='line'
        activeColor='#2c2c2c'
        tabStyle={{
          background: '#fff',
          fontSize: '28rpx'
        }}
        style={{ '--nutui-tabs-titles-font-size': '18px' }}
      >
        <Tabs.TabPane title='收藏'>收藏</Tabs.TabPane>
        <Tabs.TabPane title='学习计划'>计划</Tabs.TabPane>
        <Tabs.TabPane title='历史记录'>历史记录</Tabs.TabPane>
      </Tabs>
    </View>
  );
};

export default Profile;
