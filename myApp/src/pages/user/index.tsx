import { View } from '@tarojs/components';
import { useDidShow } from '@tarojs/taro';

import { Tabs } from '@nutui/nutui-react-taro';
import { useAtom } from 'jotai';
import { useState } from 'react';

import './index.less';
import { CourseTab } from './components/courseTab';
import { ExerciseTab } from './components/exerciseTab';
import { PostTab } from './components/postTab';
import ProfileBg from './components/ProfileBg';
import ProfileInfo from './components/ProfileInfo';

import { getFavorites } from '@/api/favorite';
import { getHistory } from '@/api/history';
import { getUserStats } from '@/api/user';
import { MyEmpty } from '@/components/empty';
import { userAtom } from '@/store/user';
import { Gender } from '@/types/user';

const Profile = () => {
  const [user, setUser] = useAtom(userAtom);

  const [tab1value, setTab1value] = useState<string | number>('0');
  const [tab2value, setTab2value] = useState<string | number>('0');

  const [collectData, setCollectData] = useState({
    courseList: [],
    exerciseList: [],
    postList: []
  });
  const [collectCount, setCollectCount] = useState(0);

  const [historyData, setHistoryData] = useState({
    courseList: [],
    exerciseList: [],
    postList: []
  });

  // 用户统计数据
  const [userStats, setUserStats] = useState({
    courseCount: 0,
    exerciseCount: 0,
    averageScore: 0
  });

  useDidShow(() => {
    const fetchFavorites = async () => {
      try {
        const res = await getFavorites();
        const courseList = res.data.data
          .filter((item) => item.target_type === 'course' && item.details)
          .map((item) => item.details);
        const exerciseList = res.data.data
          .filter((item) => item.target_type === 'exercise' && item.details)
          .map((item) => item.details);
        const postList = res.data.data
          .filter((item) => item.target_type === 'post' && item.details)
          .map((item) => item.details);
        setCollectData({
          courseList,
          exerciseList,
          postList
        });
        setCollectCount(
          courseList.length + exerciseList.length + postList.length
        );
      } catch (e) {
        setCollectData({
          courseList: [],
          exerciseList: [],
          postList: []
        });
        setCollectCount(0);
      }
    };

    const fetchHistory = async () => {
      try {
        const res = await getHistory();
        const courseList = res.data.data
          .filter((item) => item.target_type === 'course' && item.details)
          .map((item) => item.details);
        const exerciseList = res.data.data
          .filter((item) => item.target_type === 'exercise' && item.details)
          .map((item) => item.details);
        const postList = res.data.data
          .filter((item) => item.target_type === 'post' && item.details)
          .map((item) => item.details);
        setHistoryData({
          courseList,
          exerciseList,
          postList
        });
      } catch (e) {
        setHistoryData({
          courseList: [],
          exerciseList: [],
          postList: []
        });
      }
    };

    const fetchUserStats = async () => {
      try {
        const res = await getUserStats();
        if (res.code === 200 && res.success) {
          setUserStats({
            courseCount: res.data.courseCount || 0,
            exerciseCount: res.data.exerciseCount || 0,
            averageScore: res.data.averageScore || 0
          });
        }
      } catch (error) {
        console.error('获取用户统计数据失败:', error);
      }
    };

    fetchFavorites();
    fetchHistory();
    fetchUserStats();
  });

  // 计算标签
  const extraTags = [
    user?.extra?.age,
    user?.extra?.constellation,
    user?.extra?.gender === Gender.Unknown ? '' : Gender.Male ? '男' : '女',
    (user?.extra?.location ?? []).length > 0 && user?.extra?.location[0]
      ? user?.extra?.location
      : ''
  ].filter(Boolean) as string[];

  const tags = [...extraTags, '添加你的个性标签吧'];

  const records = [
    { count: userStats.courseCount, text: '学习课程' },
    { count: userStats.exerciseCount, text: '完成题库' },
    { count: collectCount, text: '收藏' }
  ];

  const handleBgChange = (newImageUrl: string) => {
    console.log('UserPage updating bg url to:', newImageUrl);
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        backgroundImage: newImageUrl
      };
    });
  };

  const handleAvatarChange = (newAvatarUrl: string) => {
    console.log('UserPage updating avatar url to:', newAvatarUrl);
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        avatar: newAvatarUrl
      };
    });
  };

  return (
    <View>
      <ProfileBg
        bgImgUrl={
          user?.backgroundImage ??
          'https://img12.360buyimg.com/imagetools/jfs/t1/143702/31/16654/116794/5fc6f541Edebf8a57/4138097748889987.png'
        }
        onBgChange={handleBgChange}
      />
      <ProfileInfo
        avatarUrl={
          user?.avatar ??
          'https://img12.360buyimg.com/imagetools/jfs/t1/143702/31/16654/116794/5fc6f541Edebf8a57/4138097748889987.png'
        }
        username={user?.username ?? '请输入用户名'}
        description={user?.desc ?? '输入你的介绍。'}
        tags={tags}
        records={records}
        onAvatarChange={handleAvatarChange}
      />
      <Tabs
        value={tab1value}
        onChange={(value) => {
          setTab1value(value);
        }}
        activeType='line'
        activeColor='#2c2c2c'
        duration={200}
        autoHeight
        tabStyle={{
          background: '#fff',
          padding: '0'
        }}
        style={{
          '--nutui-tabs-titles-font-size': '18px'
        }}
      >
        <Tabs.TabPane title='收藏'>
          <Tabs
            value={tab2value}
            onChange={(value) => {
              setTab2value(value);
            }}
            activeType='button'
            tabStyle={{
              background: '#fff'
            }}
            autoHeight
            align='left'
            style={{
              '--nutui-tabs-titles-font-size': '14px',
              '--nutui-tabs-tabpane-padding': '0px 0px'
            }}
          >
            <Tabs.TabPane title='课程'>
              {collectData.courseList.length ? (
                <CourseTab courseList={collectData.courseList} />
              ) : (
                <MyEmpty
                  title='暂无收藏课程'
                  showButton
                  style={{ height: '100%' }}
                />
              )}
            </Tabs.TabPane>
            <Tabs.TabPane title='习题'>
              {collectData.exerciseList.length ? (
                <ExerciseTab exerciseList={collectData.exerciseList} />
              ) : (
                <MyEmpty
                  title='暂无收藏习题'
                  showButton
                  style={{ height: '100%' }}
                />
              )}
            </Tabs.TabPane>
            <Tabs.TabPane title='帖子'>
              {collectData.postList.length ? (
                <PostTab postList={collectData.postList} />
              ) : (
                <MyEmpty
                  title='暂无收藏帖子'
                  showButton
                  style={{ height: '100%' }}
                />
              )}
            </Tabs.TabPane>
          </Tabs>
        </Tabs.TabPane>
        <Tabs.TabPane title='历史记录'>
          <Tabs
            value={tab2value}
            onChange={(value) => {
              setTab2value(value);
            }}
            activeType='button'
            tabStyle={{
              background: '#fff'
            }}
            autoHeight
            align='left'
            style={{
              '--nutui-tabs-titles-font-size': '14px',
              '--nutui-tabs-tabpane-padding': '0px 0px'
            }}
          >
            <Tabs.TabPane title='课程'>
              {historyData.courseList.length ? (
                <CourseTab courseList={historyData.courseList} />
              ) : (
                <MyEmpty
                  title='暂无历史课程'
                  showButton
                  style={{ height: '100%' }}
                />
              )}
            </Tabs.TabPane>
            <Tabs.TabPane title='习题'>
              {historyData.exerciseList.length ? (
                <ExerciseTab exerciseList={historyData.exerciseList} />
              ) : (
                <MyEmpty
                  title='暂无历史习题'
                  showButton
                  style={{ height: '100%' }}
                />
              )}
            </Tabs.TabPane>
            <Tabs.TabPane title='帖子'>
              {historyData.postList.length ? (
                <PostTab postList={historyData.postList} />
              ) : (
                <MyEmpty
                  title='暂无历史帖子'
                  showButton
                  style={{ height: '100%' }}
                />
              )}
            </Tabs.TabPane>
          </Tabs>
        </Tabs.TabPane>
      </Tabs>
    </View>
  );
};

export default Profile;
