import { View, Text } from '@tarojs/components';

import React, { CSSProperties } from 'react';

import styles from './index.module.less';
import ListItem from './ListItem';

enum TagType {
  Primary = 0,
  Success = 1,
  Warning = 2,
  Danger = 3
}

interface ListProps {
  contentList?: Array<{
    title: string;
    description?: string;
    cover?: string;
    tag?: { content: string; type: TagType };
  }>;
  loading?: boolean;
  onItemClick?: (item: any) => void;
  itemSuffix?: () => React.ReactElement | null;
  itemStyle?: CSSProperties;
}
const List = ({
  contentList,
  loading = false,
  itemSuffix,
  itemStyle,
  onItemClick
}: ListProps) => {
  return (
    <View className={styles['list-wrapper']}>
      {loading ? (
        <View className={styles['loading-wrapper']}>
          <Text className={styles['loading-text']}>加载中...</Text>
        </View>
      ) : contentList?.length ? (
        contentList.map((item, index) => {
          const { title, description, cover } = item;
          return (
            <ListItem
              key={index}
              title={title}
              desc={description}
              cover={cover}
              customStyle={itemStyle}
              suffix={itemSuffix}
              onCardClick={() => onItemClick?.(item)}
            />
          );
        })
      ) : (
        <View className={styles['empty-wrapper']}>
          <Text className={styles['empty-text']}>暂无数据</Text>
        </View>
      )}
    </View>
  );
};

export default List;
