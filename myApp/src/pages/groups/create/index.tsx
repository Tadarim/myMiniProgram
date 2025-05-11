import { View, Input, Textarea, Image, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

import { useState, useEffect } from 'react';

import { createGroup } from '@/api/chat';
import NavigationBar from '@/components/navigationBar';

import './index.less';

const CreateGroupPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // 获取当前用户信息
    const userInfo = Taro.getStorageSync('userInfo');
    if (userInfo) {
      setCurrentUser(userInfo);
    }
  }, []);

  const handleNameChange = (e) => {
    setName(e.detail.value.trim());
    // 当名称改变时，自动更新头像
    if (e.detail.value.trim()) {
      generateAvatar(e.detail.value.trim());
    } else {
      setAvatar('');
    }
  };

  const handleDescriptionChange = (e) => {
    const value = e.detail.value;
    if (value.length <= 200) {
      setDescription(value);
    }
  };

  // 生成Dicebear头像
  const generateAvatar = (groupName) => {
    // 生成一个基于组名的唯一种子
    const seed = groupName.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);
    const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`;
    setAvatar(avatarUrl);
  };

  const handleCreateGroup = async () => {
    if (!name) {
      Taro.showToast({
        title: '请输入群组名称',
        icon: 'none'
      });
      return;
    }

    // 如果没有头像，根据名称生成一个
    if (!avatar && name) {
      generateAvatar(name);
    }

    try {
      setLoading(true);

      // 获取当前用户ID
      const userId = currentUser?.id || Taro.getStorageSync('userId');

      // 设置请求参数，确保avatar字段名正确
      const params = {
        name,
        description,
        avatar: avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${name.toLowerCase().replace(/\s+/g, '')}`,
        // 如果需要，可以添加其他字段，比如使用当前用户作为target_id
        target_id: userId // 添加target_id字段，确保外键约束能够满足
      };

      console.log('创建群组参数:', params);

      const res = await createGroup(params);

      if (res.statusCode === 200 && res.data.code === 200) {
        Taro.showToast({
          title: '创建成功',
          icon: 'success'
        });

        // 创建成功后，跳转到聊天页面
        setTimeout(() => {
          const groupId = res.data.data.id;
          const sessionId = res.data.data.sessionId;

          Taro.navigateTo({
            url: `/pages/chatRoom/index?id=${groupId}&name=${encodeURIComponent(name)}&type=group&sessionId=${sessionId}`
          });
        }, 1500);
      } else {
        throw new Error(res.data.message || '创建失败');
      }
    } catch (error) {
      console.error('创建群组失败:', error);
      Taro.showToast({
        title: error.message || '创建失败',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='create-group-page'>
      <NavigationBar title='创建学习小组' showBack />

      <View className='avatar-display'>
        <View className='avatar-wrapper'>
          {avatar ? (
            <Image className='avatar-image' src={avatar} mode='aspectFill' />
          ) : (
            <Text className='avatar-placeholder'>头像</Text>
          )}
        </View>
        <Text className='avatar-text'>系统会根据群组名称自动生成头像</Text>
      </View>

      <View className='form-item'>
        <View className='label'>小组名称</View>
        <View className='input-wrapper'>
          <Input
            value={name}
            onInput={handleNameChange}
            placeholder='请输入小组名称(必填)'
            maxlength={20}
          />
        </View>
      </View>

      <View className='form-item'>
        <View className='label'>小组简介</View>
        <View className='input-wrapper'>
          <Textarea
            value={description}
            onInput={handleDescriptionChange}
            placeholder='请输入小组简介，让更多人了解你的小组(选填)'
            maxlength={200}
          />
          <View className='char-count'>{description.length}/200</View>
        </View>
      </View>

      <View className='button-wrapper'>
        <View
          className={`create-button ${loading ? 'disabled' : ''}`}
          onClick={loading ? undefined : handleCreateGroup}
        >
          {loading ? '创建中...' : '创建学习小组'}
        </View>
      </View>
    </View>
  );
};

export default CreateGroupPage;
