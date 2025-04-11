import { View, Image, Text } from '@tarojs/components';

import { Avatar, Tag, Button } from '@nutui/nutui-react-taro';

import './index.less';

const ProfileInfo = () => {
  return (
    <View className='profile-info'>
      <View className='profile-info-header'>
        <Avatar
          size='80'
          src='https://img12.360buyimg.com/imagetools/jfs/t1/143702/31/16654/116794/5fc6f541Edebf8a57/4138097748889987.png'
        />
        <Text className='username'>用户不存在</Text>
      </View>
      <View className='profile-info-main'>
        <Text className='profile-info-desc'>输入你的介绍。</Text>
        <View className='profile-info-tag'>
          <Tag
            className='profile-info-tag-item'
            round
            color='#8a8585'
            background='#eae5e5'
          >
            23岁
          </Tag>
          <Tag
            className='profile-info-tag-item'
            round
            color='#8a8585'
            background='#eae5e5'
          >
            摩羯座
          </Tag>
          <Tag
            className='profile-info-tag-item'
            round
            color='#8a8585'
            background='#eae5e5'
          >
            添加你的个性标签吧
          </Tag>
        </View>
        <View className='profile-info-record-container'>
          <View className='profile-info-record'>
            <View className='profile-info-record-item'>
              <Text className='profile-info-record-count'>10</Text>
              <Text className='profile-info-record-text'>通过课程</Text>
            </View>
            <View className='profile-info-record-item'>
              <Text className='profile-info-record-count'>0</Text>
              <Text className='profile-info-record-text'>完成题库</Text>
            </View>
            <View className='profile-info-record-item'>
              <Text className='profile-info-record-count'>12</Text>
              <Text className='profile-info-record-text'>收藏</Text>
            </View>
          </View>
          <Button
            type='primary'
            style={{ color: '#8a8585' }}
            fill='solid'
            color='#eae5e5'
            className='profile-info-btn'
          >
            编辑资料
          </Button>
        </View>
      </View>
    </View>
  );
};

export default ProfileInfo;
