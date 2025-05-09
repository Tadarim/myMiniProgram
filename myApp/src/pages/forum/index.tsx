import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

import { Add } from '@nutui/icons-react-taro';
import { InfiniteLoading } from '@nutui/nutui-react-taro';
import { useSetAtom } from 'jotai';
import React, { useState, useEffect } from 'react';

import { PopupRender } from './components/popup';
import PostItem from './components/PostItem';

import { Post, getPosts, createPost } from '@/api/post';
import NavigationBar from '@/components/navigationBar';
import { postStatusMapAtom } from '@/store/post';
import { PostStatus } from '@/types/post';

import './index.less';

const ForumPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'help' | 'normal'>(
    'all'
  );
  const [isPopupShow, setIsPopupShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const setPostStatusMap = useSetAtom(postStatusMapAtom);

  const fetchPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await getPosts({
        page: pageNum,
        pageSize,
        type: filterType
      });

      if (pageNum === 1) {
        setPosts(response.data);
        const statusMap: Record<number, PostStatus> = {};
        response.data.forEach((post) => {
          statusMap[post.id] = {
            id: post.id,
            is_liked: post.is_liked,
            likes_count: post.likes_count,
            comments_count: post.comments_count
          };
        });
        setPostStatusMap(statusMap);
      } else {
        setPosts((prev) => [...prev, ...response.data]);
        setPostStatusMap((prev) => {
          const newMap = { ...prev };
          response.data.forEach((post) => {
            newMap[post.id] = {
              id: post.id,
              is_liked: post.is_liked,
              likes_count: post.likes_count,
              comments_count: post.comments_count
            };
          });
          return newMap;
        });
      }
      setTotal(response.total || 0);
    } catch (error) {
      console.error('获取帖子失败:', error);
      Taro.showToast({
        title: '获取帖子失败',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, [filterType]);

  useEffect(() => {
    const handler = (data) => {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === data.postId
            ? {
                ...post,
                is_liked: data.is_liked,
                likes_count: data.likes_count
              }
            : post
        )
      );
    };
    Taro.eventCenter.on('updatePostLike', handler);
    return () => {
      Taro.eventCenter.off('updatePostLike', handler);
    };
  }, []);

  const btnClickHandler = () => {
    setIsPopupShow(true);
  };

  const publishHandler = async ({ content, type, tags, attachments }) => {
    try {
      const response = await createPost({
        content,
        type,
        tags,
        attachments
      });

      setPosts((prev) => [response.data, ...prev]);
      setIsPopupShow(false);
      Taro.showToast({
        title: '发布成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('发布帖子失败:', error);
      Taro.showToast({
        title: '发布失败',
        icon: 'none'
      });
    }
  };

  const loadMore = async () => {
    if (posts.length < total && !loading) {
      await fetchPosts(page + 1);
      setPage((prev) => prev + 1);
    }
  };

  return (
    <View className='forum-page'>
      <NavigationBar title='论坛' showBack={false} />

      <View className='filter-container'>
        <View
          className={`filter-item ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          全部
        </View>
        <View
          className={`filter-item ${filterType === 'normal' ? 'active' : ''}`}
          onClick={() => setFilterType('normal')}
        >
          普通帖
        </View>
        <View
          className={`filter-item ${filterType === 'help' ? 'active' : ''}`}
          onClick={() => setFilterType('help')}
        >
          求助帖
        </View>
      </View>

      <InfiniteLoading
        hasMore={posts.length < total}
        onLoadMore={loadMore}
        loadingText='加载中...'
        loadMoreText='没有更多了'
      >
        <View className='posts-container'>
          {posts.map((post) => (
            <PostItem key={post.id} {...post} />
          ))}
        </View>
      </InfiniteLoading>

      <View className='add-post-button' onClick={btnClickHandler}>
        <Add />
        <Text style={{ marginLeft: '6px' }}>发布帖子</Text>
      </View>

      <PopupRender
        key={isPopupShow ? 'open' : 'closed'}
        visible={isPopupShow}
        onPublish={publishHandler}
        onClose={() => setIsPopupShow(false)}
      />
    </View>
  );
};

export default ForumPage;
