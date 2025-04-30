import { View } from '@tarojs/components';

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
    desc?: string;
    cover?: string;
    tag?: { content: string; type: TagType };
  }>;
  onItemClick?: (item: any) => void;
  itemSuffix?: () => React.ReactElement | null;
  itemStyle?: CSSProperties;
}
const List = ({
  contentList,
  itemSuffix,
  itemStyle,
  onItemClick
}: ListProps) => {
  return (
    <View className={styles['list-wrapper']}>
      {contentList?.map((item, index) => {
        const { title, desc, cover } = item;
        return (
          <ListItem
            key={index}
            title={title}
            desc={desc}
            cover={cover}
            customStyle={itemStyle}
            suffix={itemSuffix}
            onCardClick={() => onItemClick(item)}
          />
        );
      })}
    </View>
  );
};

export default List;
