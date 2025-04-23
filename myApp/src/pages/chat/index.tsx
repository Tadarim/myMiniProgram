import { View } from '@tarojs/components';
// !! 新增引入 useState 和 useDidShow !!
import { FC, useState, useEffect } from 'react';
// !! 修改引入 navigateTo 和 useDidShow !!
import Taro, { navigateTo, useDidShow } from '@tarojs/taro';
import NavigationBar from '@/components/NavigationBar';
import ChatItem from './components/ChatItem';
// !! 引入样式文件 (如果之前没有) !!
import './index.less';

// !! 模拟的聊天列表数据 (可以移到函数外部或内部) !!
const initialChatListData = [
  {
    id: 1,
    avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
    name: '前端交流群',
    lastMessage: '大家有遇到过这个问题吗？',
    time: '14:30',
    // !! 新增一个字段，用于模拟删除 !!
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
  // !! 使用 useState 管理聊天列表 !!
  const [chatList, setChatList] = useState(initialChatListData);

  // !! 模拟获取/刷新聊天列表的函数 !!
  // 在实际应用中，这里会调用 API
  // 为了模拟退出群聊后列表刷新（移除某一项），我们暂时在这里处理
  const fetchChatList = () => {
    console.log('ChatPage: onShow triggered, fetching/refreshing chat list.');
    // 实际应用:
    // Taro.request({ url: '/api/chats' }).then(res => {
    //   setChatList(res.data);
    // });

    // 模拟：每次显示时都重置为初始列表（或根据需要从全局状态/缓存读取）
    // 如果需要模拟“删除”，可以在 chatRoom 页面退出时设置一个全局标志或本地存储标志
    // 然后在这里读取标志，决定是否过滤掉某个聊天
    // 例如，假设我们用 Taro.setStorageSync('deletedChatId', chatId) 在退出时标记
    const deletedChatId = Taro.getStorageSync('deletedChatId');
    if (deletedChatId) {
      console.log(`ChatPage: Detected deleted chat ID: ${deletedChatId}, filtering list.`);
      setChatList(prevList => prevList.filter(chat => chat.id !== deletedChatId));
      // 清除标记，避免下次进入时重复过滤
      Taro.removeStorageSync('deletedChatId');
    } else {
      // 否则，加载完整的列表（或保持当前状态，取决于你的需求）
      // 这里我们暂时每次都重置为初始数据，以便观察效果
       setChatList(initialChatListData.filter(chat => !chat.deleted)); // 确保不显示已标记删除的
    }
  };

  useDidShow(() => {
    fetchChatList();
  });

  const handleChatClick = (chat) => {
    // !! 导航前清除可能存在的删除标记 !!
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
        {/* !! 确保这里使用的是 state 中的 chatList !! */}
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
