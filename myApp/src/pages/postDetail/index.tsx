import { View, Text, Image, ScrollView, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';

import {
  Heart,
  HeartFill,
  Comment,
  Star,
  StarFill
} from '@nutui/icons-react-taro';
import React, { useState, useEffect } from 'react';

import NavigationBar from '@/components/navigationBar';

import './index.less';

interface PostDetailData {
  id: number;
  avatar: string;
  username: string;
  timeAgo: string;
  content: string;
  postImage?: string;
  likes: number;
  commentsCount: number;
  isLiked: boolean;
  isCollected: boolean;
  comments: CommentData[];
}

interface CommentData {
  id: number;
  userAvatar: string;
  username: string;
  commentTime: string;
  commentContent: string;
  replies?: CommentData[];
}

const fetchPostDetail = async (
  postId: number
): Promise<PostDetailData | null> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (postId === 1) {
    return {
      id: 1,
      avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
      username: 'Chen Kang',
      timeAgo: '2 days ago',
      content:
        '我在马路边捡到一分钱，把它交到警察叔叔手里边，叔叔夸奖有钱，我感到很开心...\n这是帖子的详细内容，可能会比较长。\n可以包含换行符。\n\n这是另一段。',
      postImage:
        'https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?q=80&w=1000',
      likes: 24,
      commentsCount: 2,
      isLiked: false,
      isCollected: false,
      comments: [
        {
          id: 101,
          userAvatar: 'https://avatars.githubusercontent.com/u/3?v=4',
          username: 'Alice',
          commentTime: '1 day ago',
          commentContent: '写得真好！'
        },
        {
          id: 102,
          userAvatar: 'https://avatars.githubusercontent.com/u/4?v=4',
          username: 'Bob',
          commentTime: '1 day ago',
          commentContent: '确实有意思。'
        }
      ]
    };
  } else if (postId === 2) {
    return {
      id: 2,
      avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
      username: 'Bob Tom',
      timeAgo: '3 days ago',
      content: '今天天气真好，适合出去走走...',
      likes: 18,
      commentsCount: 1,
      isLiked: true,
      isCollected: true,
      comments: [
        {
          id: 201,
          userAvatar: 'https://avatars.githubusercontent.com/u/5?v=4',
          username: 'Charlie',
          commentTime: '2 days ago',
          commentContent: '同感！'
        }
      ]
    };
  }
  return null;
};

const PostDetailPage: React.FC = () => {
  const router = useRouter();
  const [postData, setPostData] = useState<PostDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentUserLiked, setCurrentUserLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(0);
  const [isCollected, setIsCollected] = useState(false);

  const [commentInput, setCommentInput] = useState('');

  useEffect(() => {
    const postId = parseInt(router.params.id || '0', 10);
    if (postId) {
      setLoading(true);
      fetchPostDetail(postId)
        .then((data) => {
          setPostData(data);
          if (data) {
            setCurrentUserLiked(data.isLiked);
            setCurrentLikes(data.likes);
            setIsCollected(data.isCollected);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch post details:', error);
          setLoading(false);
          Taro.showToast({ title: '加载失败', icon: 'none' });
        });
    } else {
      setLoading(false);
      Taro.showToast({ title: '无效的帖子 ID', icon: 'none' });
    }
  }, [router.params.id]);

  // --- 事件处理 ---
  const handleLikeClick = () => {
    if (!postData) return;
    const newLikedStatus = !currentUserLiked;
    setCurrentUserLiked(newLikedStatus);
    setCurrentLikes((prev) => (newLikedStatus ? prev + 1 : prev - 1));
    console.log(
      `Post ${postData.id} like status toggled to: ${newLikedStatus}`
    );
  };

  const handleFavoriteClick = () => {
    if (!postData) return;
    const newFavoriteStatus = !isCollected;
    setIsCollected(newFavoriteStatus);
    Taro.showToast({
      title: newFavoriteStatus ? '收藏成功' : '取消收藏',
      icon: 'success',
      duration: 1500
    });
    console.log(
      `Post ${postData.id} favorite status toggled to: ${newFavoriteStatus}`
    );
  };

  const handleCommentInputChange = (e) => {
    setCommentInput(e.detail.value);
  };

  const handleSendComment = () => {
    if (!commentInput.trim() || !postData) {
      Taro.showToast({ title: '评论内容不能为空', icon: 'none' });
      return;
    }

    const currentUser = {
      avatar: 'https://avatars.githubusercontent.com/u/99?v=4',
      username: 'CurrentUser'
    };

    const newComment: CommentData = {
      id: Date.now(),
      userAvatar: currentUser.avatar,
      username: currentUser.username,
      commentTime: '刚刚',
      commentContent: commentInput.trim()
    };

    setPostData((prevData) => {
      if (!prevData) return null;
      return {
        ...prevData,
        comments: [newComment, ...prevData.comments],
        commentsCount: prevData.commentsCount + 1
      };
    });

    setCommentInput('');

    console.log('Sending comment:', newComment);
    Taro.showToast({ title: '评论成功', icon: 'success' });

    Taro.hideKeyboard();
  };

  if (loading) {
    return <View className='loading-placeholder'>加载中...</View>;
  }

  if (!postData) {
    return <View className='error-placeholder'>帖子不存在或加载失败</View>;
  }

  return (
    <View className='post-detail-page page-container'>
      <NavigationBar title='帖子详情' showBack />

      <ScrollView scrollY className='content-scroll'>
        <View className='author-info'>
          <Image className='avatar' src={postData.avatar} />
          <View className='name-time'>
            <Text className='username'>{postData.username}</Text>
            <Text className='time-ago'>{postData.timeAgo}</Text>
          </View>
        </View>

        <View className='post-content-detail'>
          <Text className='content-text' selectable>
            {postData.content}
          </Text>
        </View>

        {postData.postImage && (
          <View className='post-image-container-detail'>
            <Image
              className='post-image-detail'
              src={postData.postImage}
              mode='widthFix'
              showMenuByLongpress
            />
          </View>
        )}

        <View className='action-bar'>
          <View className='action-item' onClick={handleLikeClick}>
            {currentUserLiked ? (
              <HeartFill size={20} color='red' />
            ) : (
              <Heart size={20} />
            )}
            <Text className='action-text'>{currentLikes}</Text>
          </View>
          <View className='action-item' onClick={handleFavoriteClick}>
            {isCollected ? (
              <StarFill size={20} color='gold' />
            ) : (
              <Star size={20} />
            )}
            <Text className='action-text'>
              {isCollected ? '已收藏' : '收藏'}
            </Text>
          </View>

          <View className='action-item'>
            <Comment size={20} />
            <Text className='action-text'>{postData.commentsCount}</Text>
          </View>
        </View>

        <View className='divider' />

        <View className='comments-section'>
          <Text className='comments-title'>
            评论 ({postData.commentsCount})
          </Text>
          {postData.comments.length > 0 ? (
            postData.comments.map((comment) => (
              <View key={comment.id} className='comment-item'>
                <Image className='comment-avatar' src={comment.userAvatar} />
                <View className='comment-body'>
                  <View className='comment-header'>
                    <Text className='comment-username'>{comment.username}</Text>
                    <Text className='comment-time'>{comment.commentTime}</Text>
                  </View>
                  <Text className='comment-content'>
                    {comment.commentContent}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View className='no-comments'>暂无评论，快来抢沙发吧！</View>
          )}
        </View>
      </ScrollView>

      <View className='comment-input-bar'>
        <Input
          className='comment-input'
          placeholder='说点什么...'
          value={commentInput}
          onInput={handleCommentInputChange}
          confirmType='send'
          onConfirm={handleSendComment}
          adjustPosition
          cursorSpacing={10}
        />
        <View
          className={`send-button ${commentInput.trim() ? 'active' : ''}`}
          onClick={handleSendComment}
        >
          发送
        </View>
      </View>
    </View>
  );
};

export default PostDetailPage;
