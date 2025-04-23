import { View, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './index.less';

const Navigation = () => {
  const navigationList = [
    {
      title: '课程',
      icon: require('../../../../static/img/icon-course.svg'),
      link: '/pages/courseList/index'
    },
    {
      title: '做题',
      icon: require('../../../../static/img/icon-exam.svg'),
      link: '/pages/exerciseList/index'
    },
    {
      title: '计划',
      icon: require('../../../../static/img/icon-type.svg'),
      link: '/pages/schedule/index'
    },
    {
      title: '排行',
      icon: require('../../../../static/img/icon-rank.svg'),
      link: '/pages/rankList/index'
    }
  ];

  const handleNavigation = (link: string) => {
    Taro.navigateTo({
      url: link
    });
  };

  return (
    <View className='navigation-wrapper'>
      <View className='navigation'>
        {navigationList.map((item, index) => {
          const { title, icon, link } = item;
          return (
            <View className='navigation-item' key={index} onClick={() => handleNavigation(link)}>
              <Image className='navigation-icon' src={icon} />
              <View className='navigation-title'>{title}</View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default Navigation;
