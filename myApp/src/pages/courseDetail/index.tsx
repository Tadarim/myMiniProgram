import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter, showToast } from '@tarojs/taro';

import { Star, StarFill } from '@nutui/icons-react-taro';
import { Rate } from '@nutui/nutui-react-taro';
import { useEffect, useState } from 'react';

import List from '@/components/List';
import NavigationBar from '@/components/NavigationBar';
import Title from '@/components/Title';

import './index.less';

const CourseDetail = () => {
  const router = useRouter();
  const [courseInfo, setCourseInfo] = useState({
    title: '',
    cover: '',
    description:
      '能说出这种话的男人，确实给了我朋友答案！但是这个话男友突然放松对我朋友说出 "现在答你" 四个字，这就有点尴尬了人了，不想男友答案的话就过了这山万水，穿过恶鬼绕路，都是想来到朋友面前说的吗？下次就不要了哦，还在分手中什么都还要你说，答案给了下个朋友回应。',
    chapters: [
      { title: '第一章：软件工程概述', desc: '思考，感悟' },
      { title: '第二章：软件过程', desc: '实践，敬业' },
      { title: '第三章：软件需求', desc: '思考，感悟' },
      { title: '第四章：软件设计', desc: '思考，感悟' }
    ],
    rating: 4.5, // 课程的平均/初始评分
    isCollected: false,
    chatId: parseInt(router.params.id || '1', 10) + 100
  });

  const [isCollected, setIsCollected] = useState(courseInfo.isCollected);
  const [userRating, setUserRating] = useState<number | null>(null);

  useEffect(() => {
    const courseId = router.params.id; // 获取课程 ID
    const title = router.params.title;
    const cover = router.params.cover;

    if (title && cover) {
      setCourseInfo((prev) => ({
        ...prev,
        title: decodeURIComponent(title),
        cover: decodeURIComponent(cover),
        // !! 在这里根据 courseId 设置 chatId !!
        chatId: parseInt(courseId || '1', 10) + 100 // 确保 chatId 更新
      }));
    }
    // !! 初始化 isCollected 状态 !!
    // 假设 courseInfo.isCollected 是从 API 获取的初始状态
    // setIsCollected(fetchedCourseInfo.isCollected);
  }, [router.params]);

  const handleFavoriteToggle = () => {
    const newFavoriteStatus = !isCollected;
    setIsCollected(newFavoriteStatus);

    showToast({
      title: newFavoriteStatus ? '收藏成功' : '取消收藏',
      icon: 'success',
      duration: 1500
    });
  };

  const handleRatingChange = (value: number) => {
    setUserRating(value);
  };

  const handleChapterClick = (chapter: { title: string; desc?: string }) => {
    // 跳转到章节详情页，传递章节标题作为参数
    Taro.navigateTo({
      url: `/pages/chapterDetail/index?title=${encodeURIComponent(
        chapter.title
      )}`
    });
  };

  // !! 新增：处理进入群聊的函数 !!
  const handleGoToGroupChat = () => {
    // 确保 courseInfo 和 chatId 存在
    if (courseInfo && courseInfo.chatId) {
      Taro.navigateTo({
        // 跳转到聊天室页面，传递群聊 ID 和名称
        url: `/pages/chatRoom/index?id=${
          courseInfo.chatId
        }&name=${encodeURIComponent(courseInfo.title + ' 交流群')}`
      });
    } else {
      showToast({ title: '无法找到课程群聊信息', icon: 'none' });
    }
  };

  return (
    <View className='course-detail'>
      <View className='course-header'>
        <Image
          className='course-cover'
          src={courseInfo.cover}
          mode='aspectFill'
        />
        <NavigationBar
          title={decodeURIComponent(router.params.title || '课程详情')}
          useOpacity
        />
        <View className='course-info'>
          <Text className='course-title'>{courseInfo.title}</Text>
          <View className='favorite-button' onClick={handleFavoriteToggle}>
            {isCollected ? (
              <StarFill color='gold' size={24} /> // 已收藏
            ) : (
              <Star color='#fff' size={24} /> // 未收藏
            )}
          </View>
        </View>
      </View>

      <View className='course-description'>
        <View className='description-header'>
          <Title text='课程简介' />
          <View className='rating-section'>
            <Rate
              count={5}
              value={userRating ?? courseInfo.rating}
              allowHalf
              size={18}
              color='gold'
              onChange={handleRatingChange}
            />
          </View>
        </View>
        <Text className='description-text'>{courseInfo.description}</Text>
      </View>

      <View className='course-chapters'>
        <Title text='课程大纲' />
        <List
          contentList={courseInfo.chapters}
          onItemClick={handleChapterClick}
        />
      </View>

      <View className='group-chat-entry' onClick={handleGoToGroupChat}>
        <Text className='group-chat-text'>进入课程群聊</Text>
        <Text className='group-chat-arrow'>&gt;</Text>
      </View>
    </View>
  );
};

export default CourseDetail;
