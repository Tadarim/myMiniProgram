import { ScrollView, View, Text } from '@tarojs/components';
import { getSystemInfoSync } from '@tarojs/taro';

import { Add } from '@nutui/icons-react-taro';
import React, { useState } from 'react';

import PostItem from './components/PostItem';

import NavigationBar from '@/components/NavigationBar';
import './index.less';
import { PopupRender } from './components/popup';

interface Post {
  id: number;
  avatar: string;
  username: string;
  timeAgo: string;
  content: string;
  backgroundImage?: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isCollected: boolean;
}

const initialPosts: Post[] = [
  {
    id: 1,
    avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
    username: 'Chen Kang',
    timeAgo: '2 days ago',
    content:
      '我在马路边捡到一分钱，把它交到警察叔叔手里边，叔叔夸奖有钱，我感到很开心...',
    backgroundImage:
      'https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?q=80&w=1000',
    likes: 24,
    comments: 12,
    isLiked: false,
    isCollected: false
  },
  {
    id: 2,
    avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
    username: 'Bob Tom',
    timeAgo: '3 days ago',
    content: '今天天气真好，适合出去走走...',
    backgroundImage:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000',
    likes: 18,
    comments: 8,
    isLiked: true,
    isCollected: true
  }
];

const ForumPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([
    ...initialPosts,
    ...initialPosts
  ]); // 暂时复制数据用于展示

  const [isPopupShow, setIsPopupShow] = useState(false);

  const systemInfo = getSystemInfoSync();
  const statusBarHeight = systemInfo.statusBarHeight ?? 44;

  const btnClickHandler = () => {
    setIsPopupShow(true);
  };

  const publishHandler = ({ content, image }) => {
    setPosts((prev) => [
      {
        id: posts.length + 1,
        avatar: '',
        username: '',
        timeAgo: '刚刚',
        content,
        backgroundImage: image,
        likes: 0,
        comments: 0,
        isLiked: false,
        isCollected: false
      },
      ...prev
    ]);
    setIsPopupShow(false);
  };

  return (
    <View className='forum-page'>
      <NavigationBar title='论坛' showBack={false} />
      <ScrollView
        scrollY
        scrollWithAnimation
        className='posts-container'
        style={{ paddingTop: `${statusBarHeight + 44}px` }}
      >
        {/* !! 修改 map：传递 isCollected 和 onToggleLike !! */}
        {posts.map((post) => (
          <PostItem
            key={post.id}
            {...post}
            // 确保传递正确的 prop 名称
            isLiked={post.isLiked} // 传递收藏状态
          />
        ))}
      </ScrollView>

      <View className='add-post-button' onClick={btnClickHandler}>
        <Add />
        <Text style={{ marginLeft: '6px' }}>发布帖子</Text>
      </View>

      <PopupRender
        visible={isPopupShow}
        onPublish={publishHandler}
        onClose={() => setIsPopupShow(false)}
      />
    </View>
  );
};

export default ForumPage;
