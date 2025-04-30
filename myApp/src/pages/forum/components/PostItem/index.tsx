import { View, Text, Image } from '@tarojs/components';
import Taro, { showToast } from '@tarojs/taro';

import {
  More,
  StarFill,
  Star,
  Heart,
  HeartFill,
  Comment
} from '@nutui/icons-react-taro';
import { Tag } from '@nutui/nutui-react-taro';
import React, { useState } from 'react';

import { Post } from '@/types/post';

import './index.less';

interface PostItemProps extends Post {}

const PostItem: React.FC<PostItemProps> = ({
  id,
  authorId,
  avatar,
  username,
  timeAgo,
  content,
  backgroundImage: postImage,
  likes,
  comments,
  isLiked,
  isCollected,
  type,
  rewardPoints,
  status,
  tags
}) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [currentUserLiked, setCurrentUserLiked] = useState(isLiked);
  const [currentCollected, setCurrentCollected] = useState(isCollected);
  const [currentLikes, setCurrentLikes] = useState(likes);

  const navigateToDetail = () => {
    if (isMenuVisible) {
      setIsMenuVisible(false);
      return;
    }

    Taro.navigateTo({
      url: `/pages/postDetail/index?id=${id}`
    });
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuVisible(!isMenuVisible);
  };

  const handleCollectClick = (e) => {
    e.stopPropagation();

    setCurrentCollected(!currentCollected);

    showToast({
      title: !currentCollected ? '收藏成功' : '取消收藏',
      icon: 'success',
      duration: 1500
    });

    setTimeout(() => {
      setIsMenuVisible(false);
    }, 200);
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    const newLikedStatus = !currentUserLiked;
    setCurrentUserLiked(newLikedStatus);

    setCurrentLikes((prevLikes) =>
      newLikedStatus ? prevLikes + 1 : prevLikes - 1
    );
  };

  return (
    <View className='post-item' onClick={navigateToDetail}>
      <View className='post-header'>
        <View className='user-info'>
          <Image className='avatar' src={avatar} />
          <View className='name-time'>
            <Text className='username'>{username}</Text>
            <Text className='time-ago'>{timeAgo}</Text>
          </View>
        </View>
        {type === 'help' && (
          <View className='help-badge'>
            <Text className='help-status'>{status === 'open' ? '求助中' : '已解决'}</Text>
            <Text className='reward-points'>{rewardPoints}积分</Text>
          </View>
        )}
        <View className='options-button' onClick={toggleMenu}>
          <More size={20} />
          {isMenuVisible && (
            <View className='options-menu'>
              <View className='menu-item' onClick={handleCollectClick}>
                {currentCollected ? <StarFill size={16} /> : <Star size={16} />}
                <Text className='menu-text'>
                  {currentCollected ? '取消收藏' : '收藏'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View className='post-content'>
        <Text className='content-text'>{content}</Text>
      </View>

      {tags && tags.length > 0 && (
        <View className='post-tags'>
          {tags.map(tag => (
            <Tag key={tag} type='primary'>{tag}</Tag>
          ))}
        </View>
      )}

      {postImage && (
        <View className='post-image-container'>
          <Image
            className='post-image'
            src={postImage}
            mode='aspectFill'
          />
        </View>
      )}

      <View className='post-footer'>
        <View className='interaction'>
          <View className='interaction-item' onClick={handleLikeClick}>
            {currentUserLiked ? (
              <HeartFill size={18} color='red' />
            ) : (
              <Heart size={18} />
            )}
            <Text className='interaction-text'>{currentLikes}</Text>
          </View>
          <View className='interaction-item'>
            <Comment size={18} />
            <Text className='interaction-text'>{comments}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PostItem;
