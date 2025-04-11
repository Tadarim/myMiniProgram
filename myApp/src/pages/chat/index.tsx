import { View } from '@tarojs/components';
import { FC, useMemo } from 'react';

import NavigationBar from '@/components/NavigationBar';
import ChatItem from './components/ChatItem';

import './index.less';

const ChatPage: FC = () => {
  const chatList = useMemo(
    () => [
      {
        id: 1,
        avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
        name: '前端交流群',
        lastMessage: '大家有遇到过这个问题吗？',
        time: '14:30'
      },
      {
        id: 2,
        avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
        name: '产品设计群',
        lastMessage: '新版本的设计稿已经上传了',
        time: '12:45'
      },
      {
        id: 3,
        avatar: 'https://avatars.githubusercontent.com/u/3?v=4',
        name: '项目开发群',
        lastMessage: '今天下午3点开会讨论进度',
        time: '10:20'
      }
    ],
    []
  );

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
          />
        ))}
      </View>
    </View>
  );
};

export default ChatPage;
