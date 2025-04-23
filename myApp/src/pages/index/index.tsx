import { View } from '@tarojs/components';
import Taro, { navigateTo } from '@tarojs/taro';

import { Edit } from '@nutui/icons-react-taro';

import Course from './components/Course';
import Navigation from './components/Navigation';

import Banner from '@/components/Banner';
import List from '@/components/List';
import NavigationBar from '@/components/NavigationBar';
import Title from '@/components/Title';
import { genUrl } from '@/utils';

import './index.less';
import { useEffect } from 'react';
import { Gender, userAtom } from '@/store/user';
import { useAtom } from 'jotai';

function Index() {
  const handleExerciseClick = (exercise) => {
    navigateTo({
      url: genUrl('/pages/exerciseDetail/index', {
        title: exercise.title,
        id: exercise.id
      })
    });
  };

  const mockList = [
    {
      title: '软件工程第一章',
      desc: '这是软件工程的第一张题目喔~这是软件工程的第一张题目喔~',
      cover:
        'https://img20.360buyimg.com/openfeedback/jfs/t1/283794/20/8607/4775/67e17970Fdef6707f/af26052f0e9d5999.jpg'
    },
    {
      title: '软件工程第一章',
      desc: '这是软件工程的第一张题目喔~这是软件工程的第一张题目喔~'
    },
    {
      title: '软件工程第一章',
      desc: '这是软件工程的第一张题目喔~这是软件工程的第一张题目喔~'
    },
    {
      title: '软件工程第一章',
      desc: '这是软件工程的第一张题目喔~这是软件工程的第一张题目喔~'
    },
    {
      title: '软件工程第一章',
      desc: '这是软件工程的第一张题目喔~这是软件工程的第一张题目喔~'
    }
  ];

  const [user, setUser] = useAtom(userAtom);

  useEffect(() => {
    setUser({
      id: '20031219',
      username: '用户不存在',
      avatar:
        'https://img12.360buyimg.com/imagetools/jfs/t1/143702/31/16654/116794/5fc6f541Edebf8a57/4138097748889987.png',
      backgroundImage:
        'https://img20.360buyimg.com/openfeedback/jfs/t1/275753/36/25037/149784/68089586Ffe6bf8d7/ae8f30f33cc1694a.png',
      desc: '输入你的简介。',
      extra: {
        gender: Gender.Unknown,
        school: '',
        birthday: '',
        location: ''
      }
    });
  }, []);

  return (
    <View className='home'>
      <NavigationBar title='首页' showBack={false} useOpacity />
      <Banner />
      <Navigation />
      <View className='home-main'>
        <Title
          text='推荐课程'
          onMoreClick={() => {
            Taro.navigateTo({ url: '/pages/courseList/index' });
          }}
        />
        <Course />
        <Title
          text='热门题库'
          onMoreClick={() => {
            Taro.navigateTo({ url: '/pages/exerciseList/index' });
          }}
        />
        <List
          contentList={mockList}
          onItemClick={handleExerciseClick}
          itemSuffix={() => (
            <View
              style={{
                paddingRight: '10px',
                height: '100%',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Edit color='#4A90E2' size={24} />
            </View>
          )}
        />
      </View>
    </View>
  );
}

export default Index;
