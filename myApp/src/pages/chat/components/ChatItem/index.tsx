import { View, Text, Image } from '@tarojs/components'

import { FC } from 'react'

import './index.less'

export interface ChatItemProps {
  avatar: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  onClick?: () => void;
}

const ChatItem: FC<ChatItemProps> = ({
  avatar,
  name,
  lastMessage,
  time,
  unreadCount = 0,
  onClick
}) => {
  return (
    <View className='chat-item' onClick={onClick}>
      <Image className='avatar' src={avatar} mode='aspectFill' />
      <View className='content'>
        <View className='header'>
          <Text className='name'>{name}</Text>
          <Text className='time'>{time}</Text>
        </View>
        <View className='footer'>
          <Text className='message'>{lastMessage}</Text>
          {unreadCount > 0 && (
            <View className='unread-badge'>
              <Text className='unread-count'>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

export default ChatItem
