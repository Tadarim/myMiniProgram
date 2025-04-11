import { View, Image, Text } from '@tarojs/components';

import './index.less';
import defaultAvatar from '../../static/img/default-avatar.svg';

interface PostItemProps {
  avatar: string;
  username: string;
  timeAgo: string;
  content: string;
  backgroundImage?: string;
  likes: number;
  comments: number;
}

const PostItem: React.FC<PostItemProps> = ({
  avatar,
  username,
  timeAgo,
  content,
  backgroundImage,
  likes,
  comments
}) => {
  const handleImageError = (e: any) => {
    const target = e.target as HTMLImageElement;
    target.src = defaultAvatar;
  };
  return (
    <View className='post-item'>
      <View className='post-header'>
        <View className='user-info'>
          <Image className='avatar' src={avatar || defaultAvatar} mode='aspectFill' onError={handleImageError} />
          <View className='user-meta'>
            <Text className='username'>{username}</Text>
            <Text className='time-ago'>{timeAgo}</Text>
          </View>
        </View>
        <View className='more-actions'>...</View>
      </View>
      <View className='post-content'>
        {backgroundImage && (
          <Image className='content-image' src={backgroundImage} mode='aspectFill' />
        )}
        <Text className='content-text'>{content}</Text>
      </View>
      <View className='post-footer'>
        <View className='interaction-item'>
          <Text className='icon'>👍</Text>
          <Text className='count'>{likes}</Text>
        </View>
        <View className='interaction-item'>
          <Text className='icon'>💬</Text>
          <Text className='count'>{comments}</Text>
        </View>
      </View>
    </View>
  );
};

export default PostItem;
