import { ScrollView, View, Image } from '@tarojs/components'

import React from 'react'

import './index.less'

const Course = () => {
  return (
    <ScrollView className='recommend-course' scrollX scrollWithAnimation>
      {[
        { id: 1, courseName: '软件工程' },
        { id: 2, courseName: '计算机导论' },
        { id: 3, courseName: '数据结构' },
        { id: 4, courseName: '数据库原理与应用' }
      ].map((item, index) => {
        const { id, courseName } = item
        return (
          <View className='recommend-course-item' key={id}>
            <View className='recommend-course-item-title'>{courseName}</View>
            <Image className='recommend-course-item-image' src='' lazyLoad />
          </View>
        )
      })}
    </ScrollView>
  )
}

export default Course
