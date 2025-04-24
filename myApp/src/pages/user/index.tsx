import { View } from '@tarojs/components';

import { Tabs } from '@nutui/nutui-react-taro';
import { useAtom } from 'jotai';
import { useState } from 'react';

import './index.less';
import { CourseTab } from './components/courseTab';
import { ExerciseTab } from './components/exerciseTab';
import { PostTab } from './components/postTab';
import ProfileBg from './components/ProfileBg';
import ProfileInfo from './components/ProfileInfo';

import { MyEmpty } from '@/components/Empty';
import { Gender, userAtom } from '@/store/user';

const Profile = () => {
  const [user, setUser] = useAtom(userAtom);
  const [tab1value, setTab1value] = useState<string | number>('0');
  const [tab2value, setTab2value] = useState<string | number>('0');

  // 计算标签
  const extraTags = [
    user?.extra?.age,
    user?.extra?.constellation,
    user?.extra?.gender === Gender.Unknown ? '' : Gender.Male ? '男' : '女',
    user?.extra?.location
  ].filter(Boolean) as string[];

  const tags = [...extraTags, '添加你的个性标签吧'];

  const collectData = {
    courseList: [
      {
        id: 1,
        title: '软件工程',
        cover:
          'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&q=80',
        desc: '软件工程是一门研究软件系统开发、维护和运行的学科。软件工程是一门研究软件系统开发、维护和运行的学科。软件工程是一门研究软件系统开发、维护和运行的学科。 软件工程是一门研究软件系统开发、维护和运行的学科。软件工程是一门研究软件系统开发、维护和运行的学科。'
      }
    ],
    exerciseList: [
      {
        id: 1,
        title: '软件工程第一章',
        desc: '这是软件工程的第一张题目喔~这是软件工程的第一张题目喔~',
        cover:
          'https://img20.360buyimg.com/openfeedback/jfs/t1/283794/20/8607/4775/67e17970Fdef6707f/af26052f0e9d5999.jpg'
      },
      {
        id: 2,
        title: '软件工程第一章',
        desc: '这是软件工程的第一张题目喔~这是软件工程的第一张题目喔~'
      },
      {
        id: 3,
        title: '软件工程第一章',
        desc: '这是软件工程的第一张题目喔~这是软件工程的第一张题目喔~'
      },
      {
        id: 4,
        title: '软件工程第一章',
        desc: '这是软件工程的第一张题目喔~这是软件工程的第一张题目喔~'
      }
    ],
    postList: [
      {
        id: 1,
        title: '今天天气真好，适合出去走走',
        cover:
          'https://img20.360buyimg.com/openfeedback/jfs/t1/279196/32/23555/3950/68076ae7Fad3c3d68/01effe6bd1c51ce6.png'
      }
    ]
  };

  // 计算记录
  const records = [
    { count: 0, text: '通过课程' },
    { count: 0, text: '完成题库' },
    {
      count:
        collectData.postList.length +
        collectData.courseList.length +
        collectData.exerciseList.length,
      text: '收藏'
    }
  ];
  const historyData = {
    courseList: [
      {
        id: 1,
        title: '软件工程',
        cover:
          'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&q=80',
        desc: '软件工程是一门研究软件系统开发、维护和运行的学科。软件工程是一门研究软件系统开发、维护和运行的学科。软件工程是一门研究软件系统开发、维护和运行的学科。 软件工程是一门研究软件系统开发、维护和运行的学科。软件工程是一门研究软件系统开发、维护和运行的学科。'
      }
    ],
    exerciseList: [
      {
        id: 1,
        title: '软件工程第一章',
        desc: '这是软件工程的第一张题目喔~这是软件工程的第一张题目喔~',
        cover:
          'https://img20.360buyimg.com/openfeedback/jfs/t1/283794/20/8607/4775/67e17970Fdef6707f/af26052f0e9d5999.jpg'
      },
      {
        id: 2,
        title: '软件工程第一章',
        desc: '这是软件工程的第一张题目喔~这是软件工程的第一张题目喔~'
      },
      {
        id: 3,
        title: '软件工程第一章',
        desc: '这是软件工程的第一张题目喔~这是软件工程的第一张题目喔~'
      },
      {
        id: 4,
        title: '软件工程第一章',
        desc: '这是软件工程的第一张题目喔~这是软件工程的第一张题目喔~'
      }
    ],
    postList: [
      {
        id: 1,
        title: '今天天气真好，适合出去走走',
        cover:
          'https://img20.360buyimg.com/openfeedback/jfs/t1/279196/32/23555/3950/68076ae7Fad3c3d68/01effe6bd1c51ce6.png'
      }
    ]
  };

  const handleBgChange = (newImageUrl: string) => {
    console.log('UserPage updating bg url to:', newImageUrl);
    setUser((prev) => ({
      ...prev,
      backgroundImage: newImageUrl
    }));
  };

  const handleAvatarChange = (newAvatarUrl: string) => {
    console.log('UserPage updating avatar url to:', newAvatarUrl);
    setUser((prev) => ({
      ...prev,
      avatar: newAvatarUrl
    }));
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
                <CourseTab courseList={collectData.courseList} />
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
                <ExerciseTab exerciseList={collectData.exerciseList} />
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
                <PostTab postList={collectData.postList} />
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
