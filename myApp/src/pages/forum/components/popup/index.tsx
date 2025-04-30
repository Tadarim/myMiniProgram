import {
  Popup,
  Cell,
  Button,
  TextArea,
  Uploader,
  UploaderFileItem,
  Radio,
  Input,
  Tag
} from '@nutui/nutui-react-taro';
import { View } from '@tarojs/components';
import { useState } from 'react';

export const PopupRender = ({ visible, onPublish, onClose }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<UploaderFileItem[]>([]);
  const [postType, setPostType] = useState<'normal' | 'help'>('normal');
  const [rewardPoints, setRewardPoints] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const availableTags = ['学习问题', '生活求助', '情感咨询', '其他'];

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <Popup
      closeable
      visible={visible}
      title='发布帖子'
      description={
        <>
          <Cell
            title='帖子类型'
            description={
              <View className='post-type-selector'>
                <View
                  className={`type-option ${postType === 'normal' ? 'selected' : ''}`}
                  onClick={() => setPostType('normal')}
                >
                  普通帖子
                </View>
                <View
                  className={`type-option ${postType === 'help' ? 'selected' : ''}`}
                  onClick={() => setPostType('help')}
                >
                  求助帖子
                </View>
              </View>
            }
          />

          {postType === 'help' && (
            <>
              <Cell
                title='悬赏积分'
                description={
                  <Input
                    type='number'
                    value={rewardPoints}
                    onChange={(val) => setRewardPoints(Number(val))}
                    placeholder='请输入悬赏积分'
                  />
                }
              />
              <Cell
                title='问题标签'
                description={
                  <View className='tags-container'>
                    {availableTags.map(tag => (
                      <Tag
                        key={tag}
                        type={selectedTags.includes(tag) ? 'primary' : 'default'}
                        onClick={() => handleTagClick(tag)}
                      >
                        {tag}
                      </Tag>
                    ))}
                  </View>
                }
              />
            </>
          )}

          <Cell
            title='内容'
            description={
              <TextArea
                placeholder={postType === 'help' ? '请详细描述你的问题' : '请输入帖子内容'}
                value={content}
                onChange={(val) => setContent(val)}
                autoSize
                showCount
                maxLength={200}
              />
            }
          />

          <Cell
            title='图片'
            style={{ width: '100%' }}
            description={
              <Uploader
                value={image}
                onChange={setImage}
                maxCount={1}
              />
            }
          />

          <Button
            block
            type='primary'
            disabled={!content || (postType === 'help' && rewardPoints <= 0)}
            onClick={() => {
              onPublish({
                content,
                image,
                type: postType,
                rewardPoints,
                tags: selectedTags
              });
              setTimeout(() => onClose(), 100);
            }}
          >
            发布
          </Button>
        </>
      }
      position='bottom'
    />
  );
};
