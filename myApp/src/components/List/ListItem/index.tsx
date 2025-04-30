import { View, Image } from '@tarojs/components';

import React, { CSSProperties } from 'react';

import styles from './index.module.less';

import DefaultCover from '@/static/img/default-cover.png';

export interface ListItemProps {
  cover?: string;
  title: string;
  desc?: string;
  suffix?: () => React.ReactElement | null;
  descSuffix?: () => React.ReactElement | null;
  onCardClick?: (item: any) => void;
  customStyle?: CSSProperties;
}

const ListItem = ({
  cover,
  title,
  desc,
  suffix,
  descSuffix,
  onCardClick,
  customStyle
}: ListItemProps) => {
  return (
    <View
      className={styles['list-item-wrapper']}
      style={customStyle}
      onClick={onCardClick}
    >
      <View className={styles['list-item-main']}>
        <Image
          style={{ width: '50px', height: '50px', marginRight: '20px' }}
          src={cover ? cover : DefaultCover}
        />
        <View className={styles['list-item-text']}>
          <View className={styles['list-item-title']}>{title}</View>
          <View className={styles['list-item-desc']}>
            {desc}
            {descSuffix && <View>{descSuffix()}</View>}
          </View>
        </View>
      </View>
      {suffix && suffix()}
    </View>
  );
};

export default ListItem;
