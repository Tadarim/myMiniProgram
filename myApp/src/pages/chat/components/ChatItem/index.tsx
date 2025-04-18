import { View, Image } from '@tarojs/components'
import { FC } from 'react'

import './index.less'

interface ChatItemProps {
  avatar: string
  name: string
  lastMessage: string
  time: string
}

const ChatItem: FC<ChatItemProps> = ({ avatar, name, lastMessage, time }) => {
  return (
    <View className='chat-item'>
      <Image className='chat-item-avatar' src={avatar} />
      <View className='chat-item-content'>
        <View className='chat-item-header'>
          <View className='chat-item-name'>{name}</View>
          <View className='chat-item-time'>{time}</View>
        </View>
        <View className='chat-item-message'>{lastMessage}</View>
      </View>
    </View>
  )
}

export default ChatItem
