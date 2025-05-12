import { View, Input, Image, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';

import { Search } from '@nutui/icons-react-taro';
import { useState, useEffect } from 'react';

import { searchGroups, joinGroup } from '@/api/chat';
import { getRecommendedGroups as getRecommendedGroupsApi } from '@/api/recommend';
import NavigationBar from '@/components/navigationBar';

import './index.less';

interface GroupItem {
  id: number;
  name: string;
  description: string;
  avatar: string;
  member_count: number;
  created_at: string;
  is_member: boolean;
  session_id?: number; // 添加会话ID字段
}

const DiscoverGroupPage = () => {
  const [searchValue, setSearchValue] = useState('');
  const [groupList, setGroupList] = useState<GroupItem[]>([]);
  const [recommendedGroups, setRecommendedGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // 获取推荐群组
  const fetchRecommendedGroups = async () => {
    try {
      setRecommendLoading(true);
      const res = await getRecommendedGroupsApi();
      if (res.code === 200 && res.success) {
        setRecommendedGroups(res.data || []);
      } else {
        setRecommendedGroups([]);
        console.error('获取推荐群组失败:', res.message);
      }
    } catch (error) {
      console.error('获取推荐群组失败:', error);
      setRecommendedGroups([]);
    } finally {
      setRecommendLoading(false);
    }
  };

  // 获取全部或搜索群组
  const fetchGroups = async (keyword = '') => {
    try {
      setLoading(true);
      const res = await searchGroups(keyword);
      if (res.statusCode === 200 && res.data.code === 200) {
        setGroupList(res.data.data || []);
      } else {
        setGroupList([]);
        Taro.showToast({
          title: res.data.message || '获取群组失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('获取群组失败:', error);
      setGroupList([]);
      Taro.showToast({
        title: '获取群组失败',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  // 搜索群组
  const handleSearch = () => {
    const trimmedValue = searchValue.trim();
    fetchGroups(trimmedValue);

    // 更新搜索历史
    if (trimmedValue && !searchHistory.includes(trimmedValue)) {
      const newHistory = [trimmedValue, ...searchHistory.slice(0, 4)];
      setSearchHistory(newHistory);
      Taro.setStorageSync('groupSearchHistory', newHistory);
    }
  };

  // 加入群组
  const handleJoinGroup = async (group: GroupItem) => {
    if (group.is_member) {
      // 如果已经是成员，直接跳转到聊天页面
      Taro.navigateTo({
        url: `/pages/chatRoom/index?id=${group.id}&name=${encodeURIComponent(
          group.name
        )}&type=group&sessionId=${
          group.session_id || group.id
        }&avatar=${encodeURIComponent(group.avatar || '')}`
      });
      return;
    }

    try {
      setJoiningId(group.id);
      const res = await joinGroup(group.id);
      if (res.statusCode === 200 && res.data.code === 200) {
        Taro.showToast({
          title: '加入成功',
          icon: 'success'
        });

        // 更新列表中的状态
        setGroupList((prev) =>
          prev.map((g) => (g.id === group.id ? { ...g, is_member: true } : g))
        );

        setRecommendedGroups((prev) =>
          prev.map((g) => (g.id === group.id ? { ...g, is_member: true } : g))
        );

        // 跳转到聊天页面
        setTimeout(() => {
          // 使用API返回的sessionId
          const sessionId = res.data.data.sessionId;
          Taro.navigateTo({
            url: `/pages/chatRoom/index?id=${
              group.id
            }&name=${encodeURIComponent(
              group.name
            )}&type=group&sessionId=${sessionId}&avatar=${encodeURIComponent(
              group.avatar || ''
            )}`
          });
        }, 1000);
      } else {
        throw new Error(res.data.message || '加入失败');
      }
    } catch (error) {
      console.error('加入群组失败:', error);
      Taro.showToast({
        title: error.message || '加入失败',
        icon: 'none'
      });
    } finally {
      setJoiningId(null);
    }
  };

  useEffect(() => {
    // 获取历史搜索记录
    const history = Taro.getStorageSync('groupSearchHistory');
    if (history) {
      setSearchHistory(history);
    }

    // 获取推荐群组
    fetchRecommendedGroups();

    // 获取全部群组列表
    fetchGroups();
  }, []);

  const handleInputChange = (e) => {
    setSearchValue(e.detail.value);
  };

  const handleInputConfirm = () => {
    handleSearch();
  };

  const handleHistoryItemClick = (keyword: string) => {
    setSearchValue(keyword);
    fetchGroups(keyword);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    Taro.removeStorageSync('groupSearchHistory');
  };

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // 渲染群组卡片
  const renderGroupCard = (group: GroupItem) => (
    <View className='group-card' key={group.id}>
      <View className='group-avatar'>
        {group.avatar ? (
          <Image
            className='avatar-image'
            src={group.avatar}
            mode='aspectFill'
            lazyLoad
          />
        ) : (
          <Text className='avatar-placeholder'>
            {group.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <View className='group-info'>
        <View className='group-name'>{group.name}</View>
        <View className='group-description'>
          {group.description || '这个群组没有简介'}
        </View>
        <View className='group-meta'>
          <View className='member-count'>
            <Text className='meta-text'>{group.member_count}人</Text>
          </View>
          <View className='create-time'>
            <Text className='meta-text'>{formatTime(group.created_at)}</Text>
          </View>
        </View>
      </View>
      <View
        className={`join-button ${group.is_member ? 'joined' : ''}`}
        onClick={() => handleJoinGroup(group)}
      >
        {joiningId === group.id
          ? '加入中...'
          : group.is_member
          ? '进入'
          : '加入'}
      </View>
    </View>
  );

  return (
    <View className='discover-group-page'>
      <NavigationBar title='发现学习小组' showBack />

      <View className='search-bar'>
        <View className='search-icon'>
          <Search size={18} />
        </View>
        <Input
          className='search-input'
          value={searchValue}
          onInput={handleInputChange}
          onConfirm={handleInputConfirm}
          placeholder='搜索学习小组'
          confirmType='search'
        />
        {searchValue.trim() && (
          <View className='search-button' onClick={handleSearch}>
            搜索
          </View>
        )}
      </View>

      {/* 搜索历史 */}
      {searchHistory.length > 0 && !searchValue && (
        <View className='search-history'>
          <View className='history-header'>
            <Text className='history-title'>搜索历史</Text>
            <Text className='clear-history' onClick={handleClearHistory}>
              清空
            </Text>
          </View>
          <View className='history-list'>
            {searchHistory.map((item, index) => (
              <View
                key={index}
                className='history-item'
                onClick={() => handleHistoryItemClick(item)}
              >
                {item}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 推荐群组 */}
      {!loading && recommendedGroups.length > 0 && (
        <View className='recommend-section'>
          <View className='section-title'>
            <Text>推荐学习小组</Text>
          </View>
          <ScrollView
            scrollX
            enhanced
            className='recommend-scroll'
            showScrollbar={false}
          >
            {recommendedGroups.map((group) => (
              <View
                key={group.id}
                className='recommend-card'
                onClick={() => handleJoinGroup(group)}
              >
                <View className='recommend-avatar'>
                  {group.avatar ? (
                    <Image
                      className='avatar-image'
                      src={group.avatar}
                      mode='aspectFill'
                      lazyLoad
                    />
                  ) : (
                    <Text className='avatar-placeholder'>
                      {group.name.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
                <View className='recommend-name'>{group.name}</View>
                <View className='recommend-count'>{group.member_count}人</View>
                <View
                  className={`recommend-status ${
                    group.is_member ? 'joined' : ''
                  }`}
                >
                  {group.is_member ? '已加入' : '加入'}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 群组列表 */}
      <View className='group-list-container'>
        <View className='section-title'>
          <Text>所有学习小组</Text>
        </View>

        <View className='group-list'>
          {loading ? (
            <View className='loading'>加载中...</View>
          ) : groupList.length > 0 ? (
            groupList.map(renderGroupCard)
          ) : (
            <View className='empty-state'>
              <Image
                className='empty-image'
                src='https://img20.360buyimg.com/openfeedback/jfs/t1/280339/9/23161/10217/6804adb8F8b2ec7b8/15b1e330f8422ec3.png'
                mode='aspectFit'
              />
              <View className='empty-text'>
                {searchValue
                  ? `没有找到与"${searchValue}"相关的学习小组`
                  : '暂无学习小组'}
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default DiscoverGroupPage;
