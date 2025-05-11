import { View, Text, Image } from '@tarojs/components'

import React from 'react'

import './index.less'

interface ChatItemProps {
  avatar: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isGroup?: boolean;
  onClick: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  avatar,
  name,
  lastMessage,
  time,
  unreadCount,
  isGroup = false,
  onClick
}) => {
  return (
    <View className='chat-item' onClick={onClick}>
      <View className='avatar-container'>
        <Image
          className={`avatar ${isGroup ? 'group-avatar' : ''}`}
          src={avatar || 'https://placekitten.com/100/100'}
          mode='aspectFill'
        />
        {isGroup && <View className='group-icon'>群</View>}
      </View>
      <View className='chat-info'>
        <View className='name-time'>
          <Text className='name'>{name}</Text>
          {time && <Text className='time'>{time}</Text>}
        </View>
        <View className='message-unread'>
          <Text className='message' numberOfLines={1}>{lastMessage}</Text>
          {unreadCount > 0 && (
            <View className='unread-badge'>
              <Text className='unread-count'>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

export default ChatItem
