import { View } from '@tarojs/components';

import List from '@/components/List';

interface PostItem {
  id: number | string;
  title: string;
  cover: string;
}

interface PostTabProps {
  postList: PostItem[];
}

export const PostTab = ({ postList }: PostTabProps) => {
  return (
    <View className='sub-tab-container'>
      <List contentList={postList} />
    </View>
  );
};
