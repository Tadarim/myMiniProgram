import { Image, View } from '@tarojs/components';
import { navigateTo } from '@tarojs/taro';

import debounce from 'lodash/debounce';

import { genUrl } from '@/utils';

import './index.less';

interface ProfileBgProps {
  bgImgUrl: string;
  onBgChange: (newImageUrl: string) => void;
}

const ProfileBg = ({ bgImgUrl, onBgChange }: ProfileBgProps) => {
  const handleClick = debounce(() => {
    navigateTo({
      url: genUrl('/pages/pinchPage/index', { imageUrl: bgImgUrl }),
      events: {
        updateBgImage: function (data: { newImageUrl: string }) {
          if (data.newImageUrl && onBgChange) {
            onBgChange(data.newImageUrl);
          }
        }
      },
      success: function (res) {
        console.log('Navigated to pinchPage successfully');
      },
      fail: function (err) {
        console.error('Failed to navigate to pinchPage:', err);
      }
    });
  }, 200);

  return (
    <View className='profile-bg' onClick={handleClick}>
      <Image className='profile-bg-img' src={bgImgUrl} mode='aspectFill' />
      <View className='profile-bg-mask' />
    </View>
  );
};

export default ProfileBg;
