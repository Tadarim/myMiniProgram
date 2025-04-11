import { View, Image } from '@tarojs/components';

import React, { CSSProperties, ReactElement } from 'react';

import styles from './index.module.less';
import ListItem from './ListItem';

// 枚举类型
enum TagType {
  Primary = 0,
  Success = 1,
  Warning = 2,
  Danger = 3
}

enum SuffixIconType {
  Edit = 0,
  Delete = 1,
  More = 2,
  Settings = 3
}

export enum SceneType {
  EditMode = 0,
  ViewMode = 1,
  DeleteMode = 2
}

// 映射关系
const tagTypeToClassMap: Record<TagType, string> = {
  [TagType.Primary]: 'primary',
  [TagType.Success]: 'success',
  [TagType.Warning]: 'warning',
  [TagType.Danger]: 'danger'
};

const sceneToIconMap: Record<SceneType, SuffixIconType> = {
  [SceneType.EditMode]: SuffixIconType.Edit,
  [SceneType.ViewMode]: SuffixIconType.More,
  [SceneType.DeleteMode]: SuffixIconType.Delete
};

const iconMap: Record<SuffixIconType, string> = {
  [SuffixIconType.Edit]: '✏️',
  [SuffixIconType.Delete]: '🗑️',
  [SuffixIconType.More]: '➡️',
  [SuffixIconType.Settings]: '⚙️'
};

interface ListProps {
  contentList?: Array<{
    title: string;
    desc?: string;
    cover?: string;
    tag?: { content: string; type: TagType };
    prefix?: () => React.ReactElement | null;
    suffix?: () => React.ReactElement | null;
  }>;
  scene: SceneType;
  itemStyle?: CSSProperties;
}
const List = ({ contentList, scene, itemStyle }: ListProps) => {
  return (
    <View className={styles['list-wrapper']}>
      {contentList?.map((item, index) => {
        const { title, desc, prefix } = item;
        return (
          <ListItem
            key={index}
            title={title}
            desc={desc}
            prefix={prefix}
            customStyle={itemStyle}
          />
        );
      })}
    </View>
  );
};

export default List;
