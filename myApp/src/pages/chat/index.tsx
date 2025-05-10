import { View, Image } from '@tarojs/components';
import Taro, { navigateTo, useDidShow } from '@tarojs/taro';

import { FC, useState, useEffect } from 'react';

import ChatItem from './components/ChatItem';

import { getChatSessions } from '@/api/chat';
import NavigationBar from '@/components/navigationBar';
import { ChatSession } from '@/types/chat';

import './index.less';

const ChatPage: FC = () => {
  const [chatList, setChatList] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchChatList();
  }, []);

  useDidShow(() => {
    fetchChatList();
  });

  const handleChatClick = (chat: ChatSession) => {
    navigateTo({
      url: `/pages/chatRoom/index?id=${chat.id}&targetId=${
        chat.target_id
      }&name=${encodeURIComponent(
        chat.target_name || ''
      )}&avatar=${encodeURIComponent(chat.target_avatar || '')}&type=${chat.type}`
    });
  };

  return (
    <View className='chat-page'>
      <NavigationBar title='聊天' showBack={false} />
      <View className='chat-list'>
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
      </View>
    </View>
  );
};

export default ChatPage;
