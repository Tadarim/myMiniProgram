import { View } from '@tarojs/components';

import React from 'react';
import './index.less';

const Title = ({ text }) => {
  return (
    <View className='title'>
      <View className='title-text'>{text}</View>
      {/* <View className='link' onClick={() => Taro.navigateTo({ url: `/pages/${link}/index` })}>更多</View> */}
      <View className='title-link'>更多</View>
    </View>
  );
};

export default Title
