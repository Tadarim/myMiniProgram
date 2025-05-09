import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import {
  Popup,
  Cell,
  Button,
  TextArea,
  UploaderFileItem,
  Tag
} from '@nutui/nutui-react-taro';
import { useState } from 'react';

import './index.less';
import { API_ROUTES } from '@/api/constant';
import { API_BASE_URL } from '@/config';

interface Attachment {
  url: string;
  type: string;
  name: string;
}

export const PopupRender = ({ visible, onPublish, onClose }) => {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'normal' | 'help'>('normal');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [fileAttachments, setFileAttachments] = useState<Attachment[]>([]);

  const availableTags = ['学习问题', '组队邀请', '资源共享', '其他'];

  // 上传到后端（后端再转存七牛云）
  const handleUpload = async (
    fileObj: UploaderFileItem
  ): Promise<{ url: string; type: string; name: string }> => {
    return new Promise((resolve, reject) => {
      const token = Taro.getStorageSync('token');
      Taro.uploadFile({
        url: `${API_BASE_URL}${API_ROUTES.UPLOAD_POST}`,
        filePath: (fileObj.url || fileObj.path) as string,
        name: 'file',
        header: {
          Authorization: `Bearer ${token}`
        },
        formData: {
          fileName:
            fileObj.name ||
            (fileObj.url ? fileObj.url.split('/').pop() : '') ||
            'file'
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            if (data.success && data.data.url) {
              resolve({
                url: data.data.url as string,
                type: fileObj.type || 'file',
                name: fileObj.name || data.data.url.split('/').pop() || 'file'
              });
            } else {
              reject(data);
            }
          } catch (e) {
            reject(e);
          }
        },
        fail: reject
      });
    });
  };

  // 文件上传（微信小程序端）
  const handleChooseFile = async () => {
    const res = await Taro.chooseMessageFile({
      count: 1,
      type: 'file'
    });
    if (res.tempFiles && res.tempFiles.length > 0) {
      const file = res.tempFiles[0];

      try {
        // 显示上传中提示
        Taro.showLoading({
          title: '上传中...'
        });

        // 立即上传文件获取 url
        const result = await handleUpload({
          url: file.path,
          name: file.name,
          type: file.type
        });

        Taro.hideLoading();

        setFileAttachments((prev) => [
          ...prev,
          { url: result.url, name: file.name, type: file.type }
        ]);

        Taro.showToast({
          title: '上传成功',
          icon: 'success',
          duration: 2000
        });
      } catch (error) {
        Taro.hideLoading();

        console.error('上传文件失败:', error);
        Taro.showToast({
          title: '上传文件失败',
          icon: 'none',
          duration: 2000
        });
      }
    }
  };

  // 发布
  const handlePublish = async () => {
    onPublish({
      content,
      attachments: fileAttachments,
      type: postType,
      tags: selectedTags
    });
    setTimeout(() => onClose(), 100);
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
                <Tag
                  type={postType === 'normal' ? 'primary' : 'default'}
                  onClick={() => setPostType('normal')}
                  style={{ marginRight: '8px' }}
                  color={postType === 'normal' ? '#fff' : '#333'}
                >
                  普通帖子
                </Tag>
                <Tag
                  type={postType === 'help' ? 'primary' : 'default'}
                  onClick={() => setPostType('help')}
                  color={postType === 'normal' ? '#333' : '#fff'}
                >
                  求助帖子
                </Tag>
              </View>
            }
          />

          {postType === 'help' && (
            <Cell
              title='问题标签'
              description={
                <View className='tags-container'>
                  {availableTags.map((tag) => (
                    <Tag
                      key={tag}
                      type={selectedTags.includes(tag) ? 'primary' : 'default'}
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          setSelectedTags(
                            selectedTags.filter((t) => t !== tag)
                          );
                        } else {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                      style={{ marginRight: '8px', marginBottom: '8px' }}
                      color={!selectedTags.includes(tag) ? '#333' : '#fff'}
                    >
                      {tag}
                    </Tag>
                  ))}
                </View>
              }
            />
          )}

          <Cell
            title='内容'
            description={
              <TextArea
                placeholder={
                  postType === 'help' ? '请详细描述你的问题' : '请输入帖子内容'
                }
                value={content}
                onChange={(val) => setContent(val)}
                autoSize
                showCount
                maxLength={200}
              />
            }
          />

          <Cell
            title='附件'
            description={
              <Button type='primary' size='small' onClick={handleChooseFile}>
                上传文件
              </Button>
            }
          />
          {fileAttachments.map((file) => (
            <View key={file.url} style={{ margin: '8px 0', color: '#555' }}>
              {file.name}
            </View>
          ))}

          <Button
            block
            type='primary'
            disabled={!content}
            onClick={handlePublish}
          >
            发布
          </Button>
        </>
      }
      onClose={onClose}
      position='bottom'
    />
  );
};
