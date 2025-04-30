import { ScrollView, View, Text } from '@tarojs/components';
import { getSystemInfoSync } from '@tarojs/taro';

import { Add } from '@nutui/icons-react-taro';
import React, { useState } from 'react';

import { PopupRender } from './components/popup';
import PostItem from './components/PostItem';

import NavigationBar from '@/components/navigationBar';
import { Post } from '@/types/post';

import './index.less';

const initialPosts: Post[] = [
  {
    id: 1,
    authorId: 1,
    avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
    username: 'Chen Kang',
    timeAgo: '2 days ago',
    content: '我在学习React时遇到了一些问题，希望能得到帮助...',
    backgroundImage: 'https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?q=80&w=1000',
    likes: 24,
    comments: 12,
    isLiked: false,
    isCollected: false,
    type: 'help',
    rewardPoints: 50,
    status: 'open',
    tags: ['学习问题', 'React']
  },
  {
    id: 2,
    authorId: 2,
    avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
    username: 'Bob Tom',
    timeAgo: '3 days ago',
    content: '今天天气真好，适合出去走走...',
    backgroundImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000',
    likes: 18,
    comments: 8,
    isLiked: true,
    isCollected: true,
    type: 'normal',
    rewardPoints: 0,
    status: 'open',
    tags: []
  }
];

const ForumPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([...initialPosts]);

  const [isPopupShow, setIsPopupShow] = useState(false);

  const systemInfo = getSystemInfoSync();
  const statusBarHeight = systemInfo.statusBarHeight ?? 44;

  const btnClickHandler = () => {
    setIsPopupShow(true);
  };

  const publishHandler = ({ content, image, type, rewardPoints, tags }) => {
    setPosts((prev) => [
      {
        id: posts.length + 1,
        authorId: 1, // 这里应该是当前登录用户的ID
        avatar: 'https://avatars.githubusercontent.com/u/1?v=4', // 这里应该是当前登录用户的头像
        username: 'Current User', // 这里应该是当前登录用户的用户名
        timeAgo: '刚刚',
        content,
        backgroundImage: image?.[0]?.url,
        likes: 0,
        comments: 0,
        isLiked: false,
        isCollected: false,
        type,
        rewardPoints,
        status: 'open',
        tags
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
        {posts.map((post) => (
          <PostItem
            key={post.id}
            {...post}
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
