import { View, Text, Image } from '@tarojs/components';
import Taro, { showToast } from '@tarojs/taro';

import {
  More,
  StarFill,
  Star,
  Heart,
  HeartFill,
  Comment,
  Close
} from '@nutui/icons-react-taro';
import { Tag } from '@nutui/nutui-react-taro';
import { useAtom } from 'jotai';
import React, { useState, useEffect } from 'react';

import { Post, deletePost, toggleLike, toggleCollection } from '@/api/post';
import { postStatusMapAtom } from '@/store/post';

import './index.less';

interface PostItemProps extends Omit<Post, 'tags'> {
  tags: string | string[];
  onDelete?: (postId: number) => void;
}

const PostItem: React.FC<PostItemProps> = ({
  id,
  author_id,
  avatar,
  username,
  time_ago,
  content,
  attachments,
  likes_count,
  comments_count,
  is_liked,
  is_collected,
  type,
  tags,
  onDelete,
  ...rest
}) => {
  const [postStatusMap, setPostStatusMap] = useAtom(postStatusMapAtom);
  const postStatus = postStatusMap[id];
  // 优先用全局状态
  const currentUserLiked = postStatus?.is_liked ?? is_liked;
  const currentLikes = postStatus?.likes_count ?? likes_count;
  const currentComments = postStatus?.comments_count ?? comments_count;
  const currentCollected = postStatus?.is_collected ?? is_collected;
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  // 获取当前用户ID
  const currentUserId = Taro.getStorageSync('userInfo')?.id;

  // 处理tags，确保它是一个数组
  const tagList = Array.isArray(tags) ? tags : tags ? tags.split(',') : [];

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

  const handleCollectClick = async (e) => {
    e.stopPropagation();
    try {
      const res = await toggleCollection(id);
      setPostStatusMap((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          is_collected: res.data.is_collected
        }
      }));
      showToast({
        title: res.data.is_collected ? '收藏成功' : '取消收藏',
        icon: 'success',
        duration: 1500
      });
    } catch (error) {
      showToast({
        title: '操作失败',
        icon: 'error',
        duration: 1500
      });
    }
    setIsMenuVisible(false);
  };

  const handleLikeClick = async (e) => {
    e.stopPropagation();
    try {
      const res = await toggleLike(id);
      setPostStatusMap((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          is_liked: res.data.data.is_liked,
          likes_count: res.data.data.likes_count
        }
      }));
    } catch (error) {
      showToast({
        title: '操作失败',
        icon: 'error',
        duration: 1500
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost(id);
      showToast({
        title: '删除成功',
        icon: 'success',
        duration: 1500
      });
      // 设置删除状态
      setIsDeleted(true);
      // 触发父组件刷新列表
      if (onDelete) {
        onDelete(id);
      }
    } catch (error) {
      showToast({
        title: '删除失败',
        icon: 'error',
        duration: 1500
      });
    }
    setIsMenuVisible(false);
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

  // 如果帖子已删除，不渲染任何内容
  if (isDeleted) {
    return null;
  }

  return (
    <View className='post-item' onClick={navigateToDetail}>
      <View className='post-header'>
        <View className='user-info'>
          <Image className='avatar' src={avatar} />
          <Text className='username'>{username}</Text>
          <Text className='time-ago'>{time_ago}</Text>
          <View className='post-type'>
            {type === 'help' ? (
              <Tag type='primary'>求助</Tag>
            ) : (
              <Tag type='default' color='#333'>
                普通
              </Tag>
            )}
          </View>
        </View>
        <View className='options-button' onClick={toggleMenu}>
          <More />
          {isMenuVisible && (
            <View className='options-menu'>
              <View className='menu-item' onClick={handleCollectClick}>
                {currentCollected ? (
                  <>
                    <StarFill size={16} color='#FFEB3B' />
                    <Text className='menu-text'>取消收藏</Text>
                  </>
                ) : (
                  <>
                    <Star size={16} />
                    <Text className='menu-text'>收藏</Text>
                  </>
                )}
              </View>
              {currentUserId === author_id && (
                <View className='menu-item' onClick={handleDelete}>
                  <Close size={16} color='#ff4d4f' />
                  <Text className='menu-text' style={{ color: '#ff4d4f' }}>
                    删除
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      <View className='post-content'>
        <Text className='content-text'>{content}</Text>
        {attachments &&
          attachments
            .filter((att) => att.type === 'image')
            .map((img) => (
              <Image
                className='post-image'
                src={img.url}
                mode='widthFix'
                key={img.url}
              />
            ))}
        {attachments &&
          attachments
            .filter((att) => att.type === 'file')
            .map((file) => (
              <View className='post-file-block' key={file.url}>
                <View className='file-icon'>📄</View>
                <View className='file-info'>
                  <Text className='file-name'>{file.name || '附件'}</Text>
                  <Text
                    className='file-link'
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFileClick(file);
                    }}
                  >
                    查看/下载
                  </Text>
                </View>
              </View>
            ))}
      </View>

      {tagList.length > 0 && (
        <View className='tags-container'>
          {tagList.map((tag, index) => (
            <Tag key={index} type='default' plain>
              {tag}
            </Tag>
          ))}
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
            <Text className='interaction-text'>{currentComments}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PostItem;
