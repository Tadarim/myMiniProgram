import { View, Text, Input } from '@tarojs/components'
import { Search, ArrowRight } from '@nutui/icons-react-taro'
import { useState } from 'react'
import './index.less'

interface ExerciseItem {
  id: number
  title: string
  students: number
  chapters: number
  difficulty: '简单' | '中等' | '困难'
  isFree: boolean
}

const ExercisePage = () => {
  const [exercises] = useState<ExerciseItem[]>([
    {
      id: 1,
      title: '软件工程第一章',
      students: 131,
      chapters: 6,
      difficulty: '简单',
      isFree: true
    },
    {
      id: 2,
      title: 'UML建模',
      students: 23,
      chapters: 14,
      difficulty: '中等',
      isFree: false
    },
    {
      id: 3,
      title: '前端面试必备',
      students: 45,
      chapters: 8,
      difficulty: '困难',
      isFree: true
    },
    {
      id: 4,
      title: 'Linux从入门到精通',
      students: 664,
      chapters: 12,
      difficulty: '简单',
      isFree: false
    },
    {
      id: 5,
      title: '计算机网络',
      students: 243,
      chapters: 10,
      difficulty: '困难',
      isFree: true
    },
    {
      id: 6,
      title: '计算机算法',
      students: 78,
      chapters: 23,
      difficulty: '中等',
      isFree: false
    }
  ])

  return (
    <View className='exercise-page'>
      <View className='page-header'>
        <View className='back-icon'>
          <Text>&lt;</Text>
        </View>
        <Text className='page-title'>习题库</Text>
        <View className='more-icon'>•••</View>
      </View>

      <View className='search-bar'>
        <Search size='16' />
        <Text className='search-placeholder'>搜索</Text>
      </View>

      <View className='exercise-list'>
        {exercises.map(exercise => (
          <View key={exercise.id} className='exercise-item'>
            <View className='exercise-content'>
              <Text className='title'>{exercise.title}</Text>
              <View className='info'>
                <Text>{exercise.students}人完成</Text>
                <Text>共{exercise.chapters}题</Text>
                <Text>-{exercise.difficulty}-</Text>
              </View>
            </View>
            <View className='right-section'>
              <Text className={`tag ${exercise.isFree ? 'free' : 'paid'}`}>
                {exercise.isFree ? '免费' : '会员'}
              </Text>
              <ArrowRight size='16' className='right-icon' />
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

export default ExercisePage
