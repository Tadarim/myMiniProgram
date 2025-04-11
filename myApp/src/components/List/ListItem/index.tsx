import { View } from '@tarojs/components';

import React, { CSSProperties } from 'react';

import styles from './index.module.less';

export interface ListItemProps {
  prefix?: () => React.ReactElement | null;
  title: string;
  desc?: string;
  suffix?: () => React.ReactElement | null;
  descSuffix?: () => React.ReactElement | null;
  customStyle?: CSSProperties;
}

const ListItem = ({
  prefix,
  title,
  desc,
  suffix,
  descSuffix,
  customStyle
}: ListItemProps) => {
  return (
    <View className={styles['list-item-wrapper']} style={customStyle}>
      <View className={styles['list-item-main']}>
        {prefix && prefix()}
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
