import { Image, View } from '@tarojs/components';

import React from 'react';

import './index.less';

const ProfileBg = ({ bgImgUrl }) => {
  return (
    <View className='profile-bg'>
      <Image className='profile-bg-img' src={bgImgUrl} mode='aspectFill' />
      <View className='profile-bg-mask' />
    </View>
  );
};

export default ProfileBg;
