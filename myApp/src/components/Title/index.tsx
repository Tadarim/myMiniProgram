import { View, Text } from '@tarojs/components';

import React from 'react';
import './index.less';

interface TitleProps {
  text: string;
  onMoreClick?: () => void;
}

const Title: React.FC<TitleProps> = ({ text, onMoreClick }) => {
  return (
    <View className='title'>
      <Text className='title-text'>{text}</Text>
      {onMoreClick && (
        <View className='title-link' onClick={onMoreClick}>
          更多
        </View>
      )}
    </View>
  );
};

export default Title;
