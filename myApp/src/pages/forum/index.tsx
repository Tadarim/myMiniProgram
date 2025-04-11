import { ScrollView, View } from '@tarojs/components';
import { getSystemInfoSync } from '@tarojs/taro';

import NavigationBar from '@/components/NavigationBar';
import PostItem from '@/components/PostItem';
import './index.less';

const ForumPage: React.FC = () => {
  const posts = [
    {
      avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
      username: 'Chen Kang',
      timeAgo: '2 days ago',
      content:
        '我在马路边捡到一分钱，把它交到警察叔叔手里边，叔叔夸奖有钱，我感到很开心...',
      backgroundImage:
        'https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?q=80&w=1000',
      likes: 24,
      comments: 12
    },
    {
      avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
      username: 'Bob Tom',
      timeAgo: '3 days ago',
      content: '今天天气真好，适合出去走走...',
      backgroundImage:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000',
      likes: 18,
      comments: 8
    }
  ];

  const systemInfo = getSystemInfoSync();
  const statusBarHeight = systemInfo.statusBarHeight ?? 44;

  return (
    <View className='forum-page'>
      <NavigationBar title='论坛' showBack={false} />
      <ScrollView
        scrollY
        scrollWithAnimation
        className='posts-container'
        style={{ paddingTop: `${statusBarHeight + 44}px` }}
      >
        {[...posts, ...posts].map((post, index) => (
          <PostItem key={index} {...post} />
        ))}
      </ScrollView>
    </View>
  );
};

export default ForumPage;
