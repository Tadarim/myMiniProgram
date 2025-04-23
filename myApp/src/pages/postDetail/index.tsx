import React, { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, Image, ScrollView, Input } from '@tarojs/components';
import NavigationBar from '@/components/NavigationBar';
import {
  Heart,
  HeartFill,
  Comment,
  Star,
  StarFill
} from '@nutui/icons-react-taro';
import './index.less';

// 假设的帖子详情数据结构
interface PostDetailData {
  id: number;
  avatar: string;
  username: string;
  timeAgo: string;
  content: string;
  postImage?: string;
  likes: number;
  commentsCount: number; // 评论总数
  isLiked: boolean; // 当前用户是否点赞
  isCollected: boolean; // 当前用户是否收藏
  comments: CommentData[]; // 评论列表
}

// 假设的评论数据结构
interface CommentData {
  id: number;
  userAvatar: string;
  username: string;
  commentTime: string;
  commentContent: string;
  replies?: CommentData[]; // 子评论/回复
}

// 模拟的帖子详情数据获取函数
const fetchPostDetail = async (
  postId: number
): Promise<PostDetailData | null> => {
  await new Promise((resolve) => setTimeout(resolve, 500)); // 模拟网络延迟
  // 实际应用中，这里会根据 postId 请求后端 API
  // 返回模拟数据：
  if (postId === 1) {
    // 假设 ID 为 1 的帖子数据
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
    // 假设 ID 为 2 的帖子数据
    return {
      id: 2,
      avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
      username: 'Bob Tom',
      timeAgo: '3 days ago',
      content: '今天天气真好，适合出去走走...',
      // postImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000', // 假设这个帖子没有图片
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
  return null; // 未找到帖子
};

const PostDetailPage: React.FC = () => {
  const router = useRouter();
  const [postData, setPostData] = useState<PostDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  // --- 状态管理 (点赞/收藏) ---
  // 使用 postData 中的状态作为初始值，并允许本地修改以提供即时反馈
  const [currentUserLiked, setCurrentUserLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(0);
  const [isCollected, setIsCollected] = useState(false);

  // !! 新增：评论输入框状态 !!
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
    // TODO: 调用 API 更新后端点赞状态
    console.log(
      `Post ${postData.id} like status toggled to: ${newLikedStatus}`
    );
  };

  const handleFavoriteClick = () => {
    if (!postData) return;
    const newFavoriteStatus = !isCollected;
    setIsCollected(newFavoriteStatus);
    // TODO: 调用 API 更新后端收藏状态
    Taro.showToast({
      title: newFavoriteStatus ? '收藏成功' : '取消收藏',
      icon: 'success',
      duration: 1500
    });
    console.log(
      `Post ${postData.id} favorite status toggled to: ${newFavoriteStatus}`
    );
  };

  // !! 新增：处理评论输入变化 !!
  const handleCommentInputChange = (e) => {
    setCommentInput(e.detail.value);
  };

  // !! 新增：处理发送评论 !!
  const handleSendComment = () => {
    if (!commentInput.trim() || !postData) {
      Taro.showToast({ title: '评论内容不能为空', icon: 'none' });
      return;
    }

    // 模拟当前用户信息 (实际应用中应从全局状态或本地存储获取)
    const currentUser = {
      avatar: 'https://avatars.githubusercontent.com/u/99?v=4', // 假设当前用户头像
      username: 'CurrentUser' // 假设当前用户名
    };

    // 创建新的评论对象
    const newComment: CommentData = {
      id: Date.now(), // 使用时间戳作为临时 ID
      userAvatar: currentUser.avatar,
      username: currentUser.username,
      commentTime: '刚刚', // 实际应格式化当前时间
      commentContent: commentInput.trim()
    };

    // 更新 postData 状态，将新评论添加到列表开头，并增加评论数
    setPostData((prevData) => {
      if (!prevData) return null;
      return {
        ...prevData,
        comments: [newComment, ...prevData.comments],
        commentsCount: prevData.commentsCount + 1
      };
    });

    // 清空输入框
    setCommentInput('');

    // TODO: 调用 API 将评论发送到后端
    console.log('Sending comment:', newComment);
    Taro.showToast({ title: '评论成功', icon: 'success' });

    // 可以选择隐藏键盘
    Taro.hideKeyboard();
  };

  // --- 渲染逻辑 ---
  if (loading) {
    return <View className='loading-placeholder'>加载中...</View>; // 或者使用骨架屏
  }

  if (!postData) {
    return <View className='error-placeholder'>帖子不存在或加载失败</View>;
  }

  return (
    <View className='post-detail-page page-container'>
      <NavigationBar title='帖子详情' showBack />

      <ScrollView scrollY className='content-scroll'>
        {/* 帖子作者信息 */}
        <View className='author-info'>
          <Image className='avatar' src={postData.avatar} />
          <View className='name-time'>
            <Text className='username'>{postData.username}</Text>
            <Text className='time-ago'>{postData.timeAgo}</Text>
          </View>
          {/* 可以放一个关注按钮等 */}
        </View>

        {/* 帖子内容 */}
        <View className='post-content-detail'>
          <Text className='content-text' selectable>
            {postData.content}
          </Text>
        </View>

        {/* 帖子图片 */}
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

        {/* 操作栏：点赞、收藏 */}
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
          {/* 可以添加评论图标和数量 */}
          <View className='action-item'>
            <Comment size={20} />
            <Text className='action-text'>{postData.commentsCount}</Text>
          </View>
        </View>

        {/* 分隔线 */}
        <View className='divider' />

        {/* 评论区 */}
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
            <View className='no-comments'>暂无评论，快来抢沙发吧！</View> // 修改无评论提示
          )}
        </View>
      </ScrollView>

      {/* !! 修改：底部评论输入框 !! */}
      <View className='comment-input-bar'>
        <Input
          className='comment-input' // 使用新的 class
          placeholder='说点什么...'
          value={commentInput}
          onInput={handleCommentInputChange}
          confirmType='send' // 键盘确认按钮类型设为发送
          onConfirm={handleSendComment} // 点击键盘发送按钮也触发发送
          adjustPosition // 键盘弹起时自动上推页面
          cursorSpacing={10} // 输入框距离键盘的间距
        />
        {/* 发送按钮，只有在输入内容后才更明显或可点击 (可选样式) */}
        <View
          className={`send-button ${commentInput.trim() ? 'active' : ''}`} // 根据输入内容添加 active 类
          onClick={handleSendComment}
        >
          发送
        </View>
      </View>
    </View>
  );
};

export default PostDetailPage;
