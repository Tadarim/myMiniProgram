import { View, Text, Button } from '@tarojs/components';
import { navigateTo } from '@tarojs/taro';

import { Avatar, Tag } from '@nutui/nutui-react-taro';

import { genUrl } from '@/utils';

import './index.less';

interface ProfileInfoProps {
  avatarUrl: string;
  username: string;
  description: string;
  tags: string[];
  records: { count: number | string; text: string }[];
  onAvatarChange: (newAvatarUrl: string) => void;
}

const ProfileInfo = ({
  avatarUrl,
  username,
  description,
  tags,
  records,
  onAvatarChange
}: ProfileInfoProps) => {
  const handleAvatarClick = () => {
    navigateTo({
      url: genUrl('/pages/pinchPage/index', {
        imageUrl: avatarUrl,
        eventType: 'updateAvatar'
      }),
      events: {
        updateAvatar: function (data: { newImageUrl: string }) {
          console.log('ProfileInfo received new avatar url:', data.newImageUrl);

          if (data.newImageUrl && onAvatarChange) {
            onAvatarChange(data.newImageUrl);
          }
        }
      },
      success: function (res) {
        console.log('Navigated to pinchPage for avatar successfully');
      },
      fail: function (err) {
        console.error('Failed to navigate to pinchPage for avatar:', err);
      }
    });
  };

  const handleEditProfile = () => {
    navigateTo({
      url: '/pages/editProfile/index'
    });
  };

  return (
    <View className='profile-info'>
      <View className='profile-info-header'>
        <Avatar size='80' src={avatarUrl} onClick={handleAvatarClick} />
        <Text className='username'>{username}</Text>
      </View>
      <View className='profile-info-main'>
        <Text className='profile-info-desc'>{description}</Text>
        <View className='profile-info-tag'>
          {tags.map((tag, index) => (
            <Tag
              key={index} // 添加 key
              className='profile-info-tag-item'
              round
              color='#8a8585'
              background='#eae5e5'
              onClick={handleEditProfile}
            >
              {tag}
            </Tag>
          ))}
        </View>
        <View className='profile-info-record-container'>
          <View className='profile-info-record'>
            {records.map((record, index) => (
              <View key={index} className='profile-info-record-item'>
                <Text className='profile-info-record-count'>
                  {record.count}
                </Text>
                <Text className='profile-info-record-text'>{record.text}</Text>
              </View>
            ))}
          </View>
          <Button
            type='primary'
            style={{ color: '#8a8585', background: '#eae5e5' }}
            className='profile-info-btn'
            onClick={handleEditProfile}
          >
            编辑资料
          </Button>
        </View>
      </View>
    </View>
  );
};

export default ProfileInfo;
