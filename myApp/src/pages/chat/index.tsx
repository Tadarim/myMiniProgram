import { View, Image, Text } from '@tarojs/components';
import Taro, { navigateTo, useDidShow } from '@tarojs/taro';

import { Add } from '@nutui/icons-react-taro';
import { FC, useState, useEffect } from 'react';

import ChatItem from './components/ChatItem';

import { getChatSessions, getMyGroups } from '@/api/chat';
import NavigationBar from '@/components/navigationBar';
import { ChatSession } from '@/types/chat';
import { StudyGroup } from '@/types/group';

import './index.less';

const ChatPage: FC = () => {
  const [chatList, setChatList] = useState<ChatSession[]>([]);
  const [groupList, setGroupList] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'single' | 'group'>('single');

  const fetchChatList = async () => {
    try {
      setLoading(true);
      const res = await getChatSessions();
      if (res.statusCode === 200 && res.data.code === 200) {
        setChatList(res.data.data || []);
      } else {
        setChatList([]);
        Taro.showToast({
          title: res.data.message || '获取聊天列表失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('获取聊天列表失败:', error);
      setChatList([]);
      Taro.showToast({
        title: '获取聊天列表失败',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupList = async () => {
    try {
      setLoading(true);
      const res = await getMyGroups();
      if (res.statusCode === 200 && res.data.code === 200) {
        setGroupList(res.data.data || []);
      } else {
        setGroupList([]);
        Taro.showToast({
          title: res.data.message || '获取群聊列表失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('获取群聊列表失败:', error);
      setGroupList([]);
      Taro.showToast({
        title: '获取群聊列表失败',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchData = () => {
    if (activeTab === 'single') {
      fetchChatList();
    } else {
      fetchGroupList();
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useDidShow(() => {
    fetchData();
  });

  const handleTabChange = (tab: 'single' | 'group') => {
    setActiveTab(tab);
  };

  const handleChatClick = (chat: ChatSession) => {
    // 更新聊天会话缓存
    const sessions = Taro.getStorageSync('chatSessions') || {};
    sessions[`user_${chat.target_id}`] = chat.id;
    Taro.setStorageSync('chatSessions', sessions);

    navigateTo({
      url: `/pages/chatRoom/index?id=${chat.id}&targetId=${
        chat.target_id
      }&name=${encodeURIComponent(
        chat.target_name || ''
      )}&avatar=${encodeURIComponent(chat.target_avatar || '')}&type=single&sessionId=${chat.id}`
    });
  };

  const handleGroupClick = (group: StudyGroup) => {
    const sessionId = group.session_id || group.id;

    navigateTo({
      url: `/pages/chatRoom/index?id=${group.id}&name=${encodeURIComponent(
        group.name || ''
      )}&type=group&sessionId=${sessionId}&avatar=${encodeURIComponent(group.avatar || '')}`
    });
  };

  const handleCreateGroup = () => {
    navigateTo({
      url: '/pages/groups/create/index'
    });
  };

  const handleJoinGroup = () => {
    navigateTo({
      url: '/pages/groups/discover/index'
    });
  };

  return (
    <View className='chat-page'>
      <NavigationBar title='聊天' showBack={false} />

      <View className='tab-header'>
        <View
          className={`tab-item ${activeTab === 'single' ? 'active' : ''}`}
          onClick={() => handleTabChange('single')}
        >
          <Text className='tab-text'>私聊</Text>
        </View>
        <View
          className={`tab-item ${activeTab === 'group' ? 'active' : ''}`}
          onClick={() => handleTabChange('group')}
        >
          <Text className='tab-text'>群聊</Text>
        </View>
      </View>

      <View className='chat-list'>
        {activeTab === 'single' && (
          <>
            {loading ? (
              <View className='loading'>加载中...</View>
            ) : chatList.length > 0 ? (
              chatList.map((chat) => (
                <ChatItem
                  key={chat.id}
                  avatar={chat.target_avatar || ''}
                  name={chat.target_name || '未知用户'}
                  lastMessage={chat.last_message || ''}
                  time={
                    chat.last_time
                      ? new Date(chat.last_time).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : ''
                  }
                  unreadCount={chat.unread_count || 0}
                  onClick={() => handleChatClick(chat)}
                />
              ))
            ) : (
              <View className='empty'>
                <Image
                  className='empty-image'
                  src='https://img20.360buyimg.com/openfeedback/jfs/t1/280339/9/23161/10217/6804adb8F8b2ec7b8/15b1e330f8422ec3.png'
                  mode='aspectFit'
                />
                <View className='empty-text'>暂无聊天记录</View>
              </View>
            )}
          </>
        )}

        {activeTab === 'group' && (
          <>
            <View className='group-actions'>
              <View className='action-button' onClick={handleCreateGroup}>
                <Add size={16} />
                <Text className='action-text'>创建群聊</Text>
              </View>
              <View className='action-button' onClick={handleJoinGroup}>
                <Text className='action-text'>加入群聊</Text>
              </View>
            </View>

            {loading ? (
              <View className='loading'>加载中...</View>
            ) : groupList.length > 0 ? (
              groupList.map((group) => (
                <ChatItem
                  key={group.id}
                  avatar={group.avatar || ''}
                  name={group.name || '未命名群组'}
                  lastMessage={
                    group.last_message ||
                    '群组成员: ' + group.member_count + '人'
                  }
                  time={
                    group.last_activity_time
                      ? new Date(group.last_activity_time).toLocaleTimeString(
                          'zh-CN',
                          {
                            hour: '2-digit',
                            minute: '2-digit'
                          }
                        )
                      : ''
                  }
                  unreadCount={group.unread_count || 0}
                  isGroup
                  onClick={() => handleGroupClick(group)}
                />
              ))
            ) : (
              <View className='empty'>
                <Image
                  className='empty-image'
                  src='https://img20.360buyimg.com/openfeedback/jfs/t1/280339/9/23161/10217/6804adb8F8b2ec7b8/15b1e330f8422ec3.png'
                  mode='aspectFit'
                />
                <View className='empty-text'>暂无群聊</View>
                <View className='empty-subtitle'>
                  创建或加入一个学习群组，开始互助学习吧
                </View>
                <View className='empty-action' onClick={handleCreateGroup}>
                  创建学习群组
                </View>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default ChatPage;
