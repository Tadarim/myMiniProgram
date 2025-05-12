import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';

import { Tag } from '@nutui/nutui-react-taro';
import { useState, useEffect } from 'react';

import { getRecommendedGroups, getRecommendedPosts } from '@/api/recommend';
import './index.less';

interface RecommendModalProps {
  visible: boolean;
  onClose: () => void;
}

const RecommendModal: React.FC<RecommendModalProps> = ({
  visible,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'groups' | 'posts' | 'users' | null>(null);
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      fetchRecommend();
    }
  }, [visible]);

  const fetchRecommend = async () => {
    setLoading(true);
    try {
      const groupsRes = await getRecommendedGroups();
      if (
        groupsRes.code === 200 &&
        groupsRes.success &&
        groupsRes.data.length
      ) {
        setType('groups');
        setList(groupsRes.data);
        setLoading(false);
        return;
      }
      const postsRes = await getRecommendedPosts();
      if (postsRes.code === 200 && postsRes.success && postsRes.data.length) {
        setType('posts');
        setList(postsRes.data);
        setLoading(false);
        return;
      }
      setType(null);
      setList([]);
    } catch (e) {
      setType(null);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  const renderGroupCard = (item: any) => (
    <View
      className='recommend-group-card'
      key={item.id}
      onClick={async () => {
        try {
          const { joinGroup } = await import('@/api/chat');
          const res = await joinGroup(item.id);
          if (res.statusCode === 200 && res.data.code === 200) {
            Taro.navigateTo({
              url: `/pages/chatRoom/index?id=${
                item.id
              }&name=${encodeURIComponent(item.name)}&type=group&sessionId=${
                res.data.data.sessionId || item.session_id || item.id
              }&avatar=${encodeURIComponent(item.avatar || '')}`
            });
          } else {
            Taro.showToast({
              title: res.data.message || '加入群组失败',
              icon: 'none'
            });
          }
        } catch (error) {
          Taro.showToast({
            title: '加入群组失败',
            icon: 'none'
          });
        }
      }}
    >
      <View className='avatar-container'>
        <Image
          className='avatar group-avatar'
          src={item.avatar || 'https://placekitten.com/100/100'}
          mode='aspectFill'
        />
        <View className='group-icon'>群</View>
      </View>
      <View className='group-info'>
        <View className='name'>{item.name}</View>
        <View className='desc'>{item.description || '暂无简介'}</View>
        <View className='extra'>{item.member_count || 0} 成员</View>
      </View>
    </View>
  );

  const renderPostCard = (item: any) => {
    const tagList = Array.isArray(item.tags)
      ? item.tags
      : item.tags
      ? item.tags.split(',')
      : [];
    return (
      <View
        className='recommend-post-card'
        key={item.id}
        onClick={() =>
          Taro.navigateTo({ url: `/pages/postDetail/index?id=${item.id}` })
        }
      >
        <View className='post-header'>
          <Image className='avatar' src={item.avatar} />
          <Text className='username'>{item.username}</Text>
          <Text className='time-ago'>{item.time_ago}</Text>
          <View className='post-type'>
            {item.type === 'help' ? (
              <Tag type='primary'>求助</Tag>
            ) : (
              <Tag type='default' color='#333'>
                普通
              </Tag>
            )}
          </View>
        </View>
        <View className='post-content'>
          <Text className='content-text'>
            {item.content?.slice(0, 40) || '暂无内容'}
          </Text>
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
            <View className='interaction-item'>
              <Text>👍 {item.likes_count}</Text>
            </View>
            <View className='interaction-item'>
              <Text>💬 {item.comments_count}</Text>
            </View>
            <View className='interaction-item'>
              <Text>⭐ {item.collections_count}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const getTitle = () => {
    switch (type) {
      case 'groups':
        return '可能感兴趣的学习小组';
      case 'posts':
        return '可能感兴趣的帖子';
      default:
        return '为你推荐';
    }
  };

  return (
    <View className='recommend-modal-center'>
      <View className='modal-mask' onClick={onClose} />
      <View className='modal-content-center'>
        <View className='modal-header-center'>
          <Text className='title'>{getTitle()}</Text>
          <View className='close' onClick={onClose}>
            ×
          </View>
        </View>
        <View className='modal-body-center'>
          {loading ? (
            <View className='loading'>加载中...</View>
          ) : list.length ? (
            type === 'groups' ? (
              list.map(renderGroupCard)
            ) : (
              list.map(renderPostCard)
            )
          ) : (
            <View className='empty'>暂无推荐内容</View>
          )}
        </View>
      </View>
    </View>
  );
};

export default RecommendModal;
