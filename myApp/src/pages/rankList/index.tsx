import { View, Text, Image } from '@tarojs/components';

import { Tabs } from '@nutui/nutui-react-taro';
import { useState } from 'react';

import './index.less';
import NavigationBar from '@/components/NavigationBar';

interface CourseRankItem {
  id: number;
  title: string;
  enrollCount: number;
  rank: number;
}

// 添加习题榜数据接口
interface ExerciseRankItem {
  id: number;
  title: string;
  completeCount: number;
  rank: number;
}

const RankList = () => {
  const [activeTab, setActiveTab] = useState<'course' | 'exercise'>('course');

  const [courseRankList] = useState<CourseRankItem[]>([
    { id: 1, title: '软件工程导论', enrollCount: 2341, rank: 1 },
    { id: 2, title: 'Web前端开发实战', enrollCount: 1987, rank: 2 },
    { id: 3, title: '数据结构与算法', enrollCount: 1876, rank: 3 },
    { id: 4, title: '计算机网络基础', enrollCount: 1654, rank: 4 },
    { id: 5, title: '操作系统原理', enrollCount: 1432, rank: 5 }
  ]);

  // 添加习题榜数据
  const [exerciseRankList] = useState<ExerciseRankItem[]>([
    { id: 1, title: '软件工程第一章', completeCount: 1245, rank: 1 },
    { id: 2, title: 'UML建模基础', completeCount: 1123, rank: 2 },
    { id: 3, title: '前端面试必备题', completeCount: 987, rank: 3 },
    { id: 4, title: 'Linux命令练习', completeCount: 876, rank: 4 },
    { id: 5, title: '计算机网络选择题', completeCount: 765, rank: 5 }
  ]);

  return (
    <View className='rankList-page'>
      <NavigationBar title='排行榜' />

      <Tabs
        value={activeTab}
        onChange={(value) => setActiveTab(value as 'course' | 'exercise')}
        activeColor='#66a6ff'
        duration={200}
        autoHeight
        activeType='card'
      >
        <Tabs.TabPane title='课程榜' value='course' className='custom-tab-pane'>
          {/* 课程榜内容 */}
          <View className='course-rank-container'>
            <View className='course-list'>
              {courseRankList.map((course) => (
                <View key={course.id} className='course-item'>
                  <View
                    className={`rank-number ${
                      course.rank <= 3 ? `top-${course.rank}` : ''
                    }`}
                  >
                    {course.rank}
                  </View>
                  <View className='course-info'>
                    <Text className='course-title'>{course.title}</Text>
                    <Text className='course-count'>
                      已有 {course.enrollCount} 人学习
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Tabs.TabPane>

        <Tabs.TabPane
          title='习题榜'
          value='exercise'
          className='custom-tab-pane'
        >
          {/* 习题榜内容 */}
          <View className='exercise-rank-container'>
            <View className='exercise-list'>
              {exerciseRankList.map((exercise) => (
                <View key={exercise.id} className='exercise-item'>
                  <View
                    className={`rank-number ${
                      exercise.rank <= 3 ? `top-${exercise.rank}` : ''
                    }`}
                  >
                    {exercise.rank}
                  </View>
                  <View className='exercise-info'>
                    <Text className='exercise-title'>{exercise.title}</Text>
                    <Text className='exercise-count'>
                      已有 {exercise.completeCount} 人完成
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Tabs.TabPane>
      </Tabs>
    </View>
  );
};

export default RankList;
