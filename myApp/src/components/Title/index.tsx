import { View } from '@tarojs/components';

import React from 'react';
import './index.less';

interface TitleProps {
  text: string;
  onMoreClick?: () => void;
}

const Title: React.FC<TitleProps> = ({ text, onMoreClick }) => {
  return (
    <View className='title'>
      <View className='title-text'>{text}</View>
      <View className='title-link' onClick={onMoreClick}>更多</View>
    </View>
  );
};

export default Title
