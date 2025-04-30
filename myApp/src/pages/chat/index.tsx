import { View } from '@tarojs/components';
import Taro, { navigateTo, useDidShow } from '@tarojs/taro';

import { FC, useState } from 'react';

import ChatItem from './components/ChatItem';

import NavigationBar from '@/components/navigationBar';

import './index.less';

const initialChatListData = [
  {
    id: 1,
    avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
    name: '前端交流群',
    lastMessage: '大家有遇到过这个问题吗？',
    time: '14:30',
    deleted: false
  },
  {
    id: 2,
    avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
    name: '产品设计群',
    lastMessage: '新版本的设计稿已经上传了',
    time: '12:45',
    deleted: false
  },
  {
    id: 3,
    avatar: 'https://avatars.githubusercontent.com/u/3?v=4',
    name: '项目开发群',
    lastMessage: '今天下午3点开会讨论进度',
    time: '10:20',
    deleted: false
  }
];

const ChatPage: FC = () => {
  const [chatList, setChatList] = useState(initialChatListData);

  const fetchChatList = () => {
    console.log('ChatPage: onShow triggered, fetching/refreshing chat list.');

    const deletedChatId = Taro.getStorageSync('deletedChatId');
    if (deletedChatId) {
      console.log(
        `ChatPage: Detected deleted chat ID: ${deletedChatId}, filtering list.`
      );
      setChatList((prevList) =>
        prevList.filter((chat) => chat.id !== deletedChatId)
      );
      Taro.removeStorageSync('deletedChatId');
    } else {
      setChatList(initialChatListData.filter((chat) => !chat.deleted)); // 确保不显示已标记删除的
    }
  };

  useDidShow(() => {
    fetchChatList();
  });

  const handleChatClick = (chat) => {
    Taro.removeStorageSync('deletedChatId');
    navigateTo({
      url: `/pages/chatRoom/index?id=${chat.id}&name=${encodeURIComponent(
        chat.name
      )}&avatar=${encodeURIComponent(chat.avatar)}`
    });
  };

  return (
    <View className='chat-page'>
      <NavigationBar title='聊天' showBack={false} />
      <View className='chat-list'>
        {chatList.map((chat) => (
          <ChatItem
            key={chat.id}
            avatar={chat.avatar}
            name={chat.name}
            lastMessage={chat.lastMessage}
            time={chat.time}
            onClick={() => handleChatClick(chat)}
          />
        ))}
      </View>
    </View>
  );
};

export default ChatPage;
