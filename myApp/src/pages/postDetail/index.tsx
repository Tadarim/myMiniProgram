import { View, Text, Image, ScrollView, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';

import {
  Heart,
  HeartFill,
  Comment,
  Star,
  StarFill
} from '@nutui/icons-react-taro';
import { useSetAtom } from 'jotai';
import React, { useState, useEffect } from 'react';

import {
  Post,
  Comment as CommentType,
  getPostDetail,
  getComments,
  toggleLike,
  toggleCollection,
  addComment,
  toggleCommentLike
} from '@/api/post';
import NavigationBar from '@/components/navigationBar';
import { postStatusMapAtom } from '@/store/post';

import './index.less';

interface PostDetailData extends Post {
  comments: CommentType[];
}

const PostDetailPage: React.FC = () => {
  const router = useRouter();
  const [postData, setPostData] = useState<PostDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const setPostStatusMap = useSetAtom(postStatusMapAtom);

  const fetchPostDetail = async (postId: number) => {
    try {
      setLoading(true);
      const postResponse = await getPostDetail(postId);
      const commentsResponse = await getComments(postId, {
        page: 1,
        pageSize: 10
      });

      setPostData({
        ...postResponse.data,
        comments: commentsResponse.data
      });
      setHasMore(commentsResponse.data.length === 10);
    } catch (error) {
      console.error('获取帖子详情失败:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreComments = async () => {
    if (!postData || commentsLoading || !hasMore) return;

    try {
      setCommentsLoading(true);
      const commentsResponse = await getComments(postData.id, {
        page: page + 1,
        pageSize: 10
      });

      setPostData((prev) =>
        prev
          ? {
              ...prev,
              comments: [...prev.comments, ...commentsResponse.data]
            }
          : null
      );
      setPage((prev) => prev + 1);
      setHasMore(commentsResponse.data.length === 10);
    } catch (error) {
      console.error('获取更多评论失败:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    const postId = parseInt(router.params.id || '0', 10);
    if (postId) {
      fetchPostDetail(postId);
    } else {
      setLoading(false);
      Taro.showToast({ title: '无效的帖子 ID', icon: 'none' });
    }
  }, [router.params.id]);

  const handleLikeClick = async () => {
    if (!postData) return;
    try {
      const result = await toggleLike(postData.id);
      setPostData((prev) =>
        prev
          ? {
              ...prev,
              is_liked: result.data.is_liked,
              likes_count: result.data.likes_count
            }
          : null
      );
      setPostStatusMap((prev) => ({
        ...prev,
        [postData.id]: {
          ...prev[postData.id],
          is_liked: result.data.is_liked,
          likes_count: result.data.likes_count
        }
      }));
    } catch (error) {
      console.error('点赞失败:', error);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  const handleFavoriteClick = async () => {
    if (!postData) return;
    try {
      const result = await toggleCollection(postData.id);
      setPostData((prev) =>
        prev
          ? {
              ...prev,
              is_collected: result.data.is_collected,
              collections_count: result.data.collections_count
            }
          : null
      );
      Taro.showToast({
        title: result.data.is_collected ? '收藏成功' : '取消收藏',
        icon: 'success',
        duration: 1500
      });
    } catch (error) {
      console.error('收藏失败:', error);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  const handleCommentInputChange = (e) => {
    setCommentInput(e.detail.value);
  };

  const handleSendComment = async () => {
    if (!commentInput.trim() || !postData) {
      Taro.showToast({ title: '评论内容不能为空', icon: 'none' });
      return;
    }

    try {
      const result = await addComment(postData.id, commentInput.trim());
      setPostData((prev) =>
        prev
          ? {
              ...prev,
              comments: [result.data, ...prev.comments],
              comments_count: prev.comments_count + 1
            }
          : null
      );
      setCommentInput('');
      Taro.showToast({ title: '评论成功', icon: 'success' });
      Taro.hideKeyboard();
      setPostStatusMap((prev) => ({
        ...prev,
        [postData.id]: {
          ...prev[postData.id],
          comments_count:
            (prev[postData.id]?.comments_count ?? postData.comments_count) + 1
        }
      }));
    } catch (error) {
      console.error('评论失败:', error);
      Taro.showToast({ title: '评论失败', icon: 'none' });
    }
  };

  const handleCommentLike = async (commentId: number) => {
    try {
      const result = await toggleCommentLike(commentId);
      setPostData((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments.map((comment) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      is_liked: result.data.is_liked,
                      likes_count: result.data.likes_count
                    }
                  : comment
              )
            }
          : null
      );
    } catch (error) {
      console.error('点赞评论失败:', error);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  const getFileExt = (url) => {
    const cleanUrl = url.split('?')[0];
    return cleanUrl.split('.').pop().toLowerCase();
  };
  const supportedTypes = [
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'txt'
  ];
  const handleFileClick = (file) => {
    const ext = getFileExt(file.url);
    if (supportedTypes.includes(ext)) {
      Taro.showLoading({ title: '下载中...' });
      Taro.downloadFile({
        url: file.url,
        success: function (res) {
          Taro.hideLoading();
          if (res.statusCode === 200) {
            Taro.openDocument({
              filePath: res.tempFilePath,
              fileType: ext,
              showMenu: true
            });
          } else {
            Taro.showToast({ title: '文件下载失败', icon: 'none' });
          }
        },
        fail: function () {
          Taro.hideLoading();
          Taro.showToast({ title: '文件下载失败', icon: 'none' });
        }
      });
    } else {
      Taro.showToast({ title: '该文件类型暂不支持预览', icon: 'none' });
    }
  };

  if (loading) {
    return <View className='loading-placeholder'>加载中...</View>;
  }

  if (!postData) {
    return <View className='error-placeholder'>帖子不存在或加载失败</View>;
  }

  return (
    <View className='post-detail-page'>
      <NavigationBar title='帖子详情' showBack />

      <ScrollView
        scrollY
        className='content-scroll'
        onScrollToLower={fetchMoreComments}
      >
        <View className='author-info'>
          <Image className='avatar' src={postData.avatar} />
          <View className='name-time'>
            <Text className='username'>{postData.username}</Text>
            <Text className='time-ago'>{postData.time_ago}</Text>
          </View>
        </View>

        <View className='post-content-detail'>
          <Text className='content-text' selectable>
            {postData.content}
          </Text>
        </View>

        {postData.attachments &&
          postData.attachments
            .filter((att) => att.type === 'image')
            .map((img) => (
              <Image
                className='post-image'
                src={img.url}
                mode='widthFix'
                key={img.url}
              />
            ))}

        {postData.attachments &&
          postData.attachments
            .filter((att) => att.type === 'file')
            .map((file) => (
              <View className='post-file-block' key={file.url}>
                <View className='file-icon'>📄</View>
                <View className='file-info'>
                  <Text className='file-name'>{file.name || '附件'}</Text>
                  <Text
                    className='file-link'
                    onClick={() => handleFileClick(file)}
                  >
                    查看/下载
                  </Text>
                </View>
              </View>
            ))}

        <View className='action-bar'>
          <View className='action-item' onClick={handleLikeClick}>
            {postData.is_liked ? (
              <HeartFill size={20} color='red' />
            ) : (
              <Heart size={20} />
            )}
            <Text className='action-text'>{postData.likes_count}</Text>
          </View>
          <View className='action-item' onClick={handleFavoriteClick}>
            {postData.is_collected ? (
              <StarFill size={20} color='gold' />
            ) : (
              <Star size={20} />
            )}
            <Text className='action-text'>
              {postData.is_collected ? '已收藏' : '收藏'}
            </Text>
          </View>

          <View className='action-item'>
            <Comment size={20} />
            <Text className='action-text'>{postData.comments_count}</Text>
          </View>
        </View>

        <View className='divider' />

        <View className='comments-section'>
          <Text className='comments-title'>
            评论 ({postData.comments_count})
          </Text>
          {postData.comments.length > 0 ? (
            postData.comments.map((comment) => (
              <View key={comment.id} className='comment-item'>
                <Image className='comment-avatar' src={comment.avatar} />
                <View className='comment-body'>
                  <View className='comment-header'>
                    <Text className='comment-username'>{comment.username}</Text>
                    <Text className='comment-time'>{comment.time_ago}</Text>
                  </View>
                  <Text className='comment-content'>{comment.content}</Text>
                </View>
              </View>
            ))
          ) : (
            <View className='no-comments'>暂无评论，快来抢沙发吧！</View>
          )}
          {commentsLoading && <View className='loading'>加载中...</View>}
          {!hasMore && postData.comments_count > 0 && (
            <View className='no-more'>没有更多了</View>
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
