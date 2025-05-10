import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import List from '@/components/list';
import { genUrl } from '@/utils';

interface PostItem {
  id: number | string;
  title: string;
  cover: string;
  content?: string;
}

interface PostTabProps {
  postList: PostItem[];
}

const DEFAULT_POST_COVER = 'https://img20.360buyimg.com/openfeedback/jfs/t1/279196/32/23555/3950/68076ae7Fad3c3d68/01effe6bd1c51ce6.png';

export const PostTab = ({ postList }: PostTabProps) => {
  // 转换数据结构以匹配 List 组件
  const formattedList = postList.map(post => ({
    title: post.content || post.title,
    cover: post.cover || DEFAULT_POST_COVER,
    id: post.id  // 保留 id 用于跳转
  }));

  const handleItemClick = (item: any) => {
    Taro.navigateTo({
      url: genUrl('/pages/postDetail/index', { id: item.id })
    });
  };

  return (
    <View className='sub-tab-container'>
      <List contentList={formattedList} onItemClick={handleItemClick} />
    </View>
  );
};
