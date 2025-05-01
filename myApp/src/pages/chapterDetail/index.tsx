import { View, Text, Video, Button } from '@tarojs/components';
import {
  showLoading,
  hideLoading,
  showToast,
  openDocument,
  downloadFile,
  chooseMessageFile,
  useLoad,
  uploadFile,
  previewImage,
  getStorageSync,
  setNavigationBarTitle
} from '@tarojs/taro';

import { useState } from 'react';

import { BASE_URL, API_ROUTES } from '@/api/constant';
import NavigationBar from '@/components/navigationBar';
import { Chapter, Material, MaterialType } from '@/types/course';

import './index.less';

const ChapterDetail = () => {
  const [chapter, setChapter] = useState<Chapter | null>(null);

  useLoad((options) => {
    if (options.chapter) {
      console.log('options.chapter', decodeURIComponent(options.chapter));
      const chapterData = JSON.parse(decodeURIComponent(options.chapter));
      setChapter(chapterData);
      setNavigationBarTitle({
        title: chapterData.title
      });
    }
  });

  const handleDownload = async (material: Material) => {
    if (!material.url) {
      showToast({ title: '文件链接无效', icon: 'none' });
      return;
    }

    if (
      !material.url.startsWith('http://') &&
      !material.url.startsWith('https://')
    ) {
      showToast({ title: '文件链接格式不正确', icon: 'none' });
      return;
    }

    // 如果是视频，直接返回，因为视频已经在页面上播放了
    if (material.type === 'video') {
      return;
    }

    showLoading({ title: '下载中...' });
    try {
      console.log('开始下载文件:', material.url);

      // 添加超时设置
      const res = await downloadFile({
        url: material.url,
        header: {
          'Content-Type': 'application/octet-stream',
          Accept: '*/*',
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000 // 10秒超时
      });

      console.log('下载响应:', res);

      if (res.statusCode === 200) {
        hideLoading();
        showToast({ title: '下载成功', icon: 'success' });

        // 根据文件类型选择打开方式
        if (['pdf', 'doc', 'docx', 'txt'].includes(material.type)) {
          try {
            await openDocument({
              filePath: res.tempFilePath,
              showMenu: true
            });
          } catch (openErr) {
            console.error('打开文档失败:', openErr);
            showToast({
              title: '打开文档失败，请在文件管理器中查看',
              icon: 'none',
              duration: 2000
            });
          }
        } else if (['ppt', 'pptx'].includes(material.type)) {
          showToast({
            title: '请在文件管理器中查看',
            icon: 'none',
            duration: 2000
          });
        } else if (['image'].includes(material.type)) {
          try {
            await previewImage({
              urls: [material.url],
              current: material.url
            });
          } catch (previewErr) {
            console.error('预览图片失败:', previewErr);
            showToast({
              title: '预览图片失败',
              icon: 'none',
              duration: 2000
            });
          }
        }
      } else {
        throw new Error(`下载失败 (${res.statusCode})`);
      }
    } catch (err) {
      hideLoading();
      console.error('下载文件失败:', err);
      let errorMessage = '下载失败，请检查网络或链接';

      if (err.errMsg) {
        if (err.errMsg.includes('404')) {
          errorMessage = '文件不存在或已被删除';
        } else if (err.errMsg.includes('403')) {
          errorMessage = '没有权限访问该文件';
        } else if (err.errMsg.includes('500')) {
          errorMessage = '服务器错误，请稍后重试';
        } else if (err.errMsg.includes('timeout')) {
          errorMessage = '下载超时，请检查网络连接';
        }
      }

      showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000
      });
    }
  };

  const handleUploadFile = async () => {
    try {
      const res = await chooseMessageFile({
        count: 1,
        type: 'file',
        extension: ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'txt']
      });

      const tempFile = res.tempFiles[0];
      if (!tempFile) {
        showToast({
          title: '未选择文件',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      console.log('选择的文件信息:', {
        name: tempFile.name,
        size: tempFile.size,
        path: tempFile.path,
        type: tempFile.type
      });

      // 检查文件大小
      if (tempFile.size === 0) {
        showToast({
          title: '文件大小为0，请选择有效的文件',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      // 开始上传
      showLoading({ title: '上传中...' });

      try {
        // 直接上传文件到服务器
        const token = getStorageSync('token');
        if (!token) {
          showToast({
            title: '未登录或登录已过期',
            icon: 'none',
            duration: 2000
          });
          return;
        }

        const fileInfoRes = await uploadFile({
          url: `${BASE_URL}${API_ROUTES.UPLOAD}`,
          filePath: tempFile.path,
          name: 'file',
          formData: {
            fileName: tempFile.name,
            chapterId: chapter?.id || ''
          },
          header: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          timeout: 60000
        });

        console.log('文件上传响应:', fileInfoRes);

        if (fileInfoRes.statusCode !== 200) {
          throw new Error(`上传失败: ${fileInfoRes.errMsg}`);
        }

        let fileInfo;
        try {
          fileInfo = JSON.parse(fileInfoRes.data);
          console.log('解析后的响应数据:', fileInfo);
        } catch (e) {
          console.error('解析响应数据失败:', e);
          throw new Error('服务器响应格式错误');
        }

        if (!fileInfo.success) {
          throw new Error(fileInfo.error || '上传失败');
        }

        // 创建新的材料对象
        const newMaterial: Material = {
          id: fileInfo.data.id,
          title: fileInfo.data.fileName,
          type: fileInfo.data.fileType as MaterialType,
          url: fileInfo.data.url,
          upload_time: new Date().toISOString(),
          status: 'pending',
          is_system: false
        };

        // 更新章节材料列表
        if (chapter) {
          setChapter({
            ...chapter,
            materials: [...chapter.materials, newMaterial]
          });
          console.log('更新后的章节材料列表:', chapter.materials);
        }

        hideLoading();
        showToast({
          title: '上传成功，等待审核',
          icon: 'success',
          duration: 2000
        });
      } catch (err) {
        console.error('上传文件失败:', err);
        hideLoading();
        showToast({
          title: err.message || '上传失败，请重试',
          icon: 'error',
          duration: 2000
        });
      }
    } catch (err) {
      console.error('选择文件失败:', err);
      showToast({
        title: '选择文件失败',
        icon: 'none',
        duration: 2000
      });
    }
  };

  const getMaterialIconText = (type: MaterialType): string => {
    switch (type) {
      case 'ppt':
        return '[PPT]';
      case 'pdf':
        return '[PDF]';
      case 'doc':
        return '[DOC]';
      case 'txt':
        return '[TXT]';
      case 'image':
        return '[图片]';
      case 'audio':
        return '[音频]';
      default:
        return '';
    }
  };

  const getButtonText = (type: MaterialType): string => {
    switch (type) {
      case 'video':
        return '播放';
      case 'image':
        return '查看';
      default:
        return '下载';
    }
  };

  if (!chapter) {
    return <View>加载中...</View>;
  }

  return (
    <View className='chapter-detail page-container'>
      <NavigationBar title={chapter.title} />

      <View className='content-section'>
        <Text className='section-title'>学习材料</Text>
        {chapter.materials && chapter.materials.length > 0 ? (
          chapter.materials.map((material) => (
            <View key={material.id} className='material-section'>
              {material.type === 'video' ? (
                <View className='video-section'>
                  <Video
                    className='material-video'
                    src={material.url}
                    controls
                    autoplay={false}
                    initialTime={0}
                    onError={(e) => {
                      console.error('视频加载失败:', e);
                      showToast({
                        title: '视频加载失败，请检查网络或链接',
                        icon: 'none',
                        duration: 2000
                      });
                    }}
                  />
                </View>
              ) : (
                <View className='document-section'>
                  <View className='material-info'>
                    <View className='material-icon'>
                      {!material.is_system && (
                        <Text className='user-upload'>[用户]</Text>
                      )}
                      <Text className='file-type'>
                        {getMaterialIconText(material.type)}
                      </Text>

                      {material.status === 'pending' && (
                        <Text className='material-status'>(待审核)</Text>
                      )}
                    </View>
                    <Text className='material-name'>{material.title}</Text>
                  </View>
                  <View className='material-actions'>
                  <Button
                    className='download-button'
                    type='primary'
                    size='mini'
                    onClick={() => handleDownload(material)}
                      disabled={material.status !== 'approved' || !material.url}
                  >
                    {getButtonText(material.type)}
                  </Button>
                  </View>
                </View>
              )}
            </View>
          ))
        ) : (
          <Text className='placeholder-text'>暂无学习材料</Text>
        )}
        <View className='upload-section'>
          <Button
            className='upload-button'
            type='default'
            size='mini'
            onClick={handleUploadFile}
          >
            上传新材料
          </Button>
        </View>
      </View>
    </View>
  );
};

export default ChapterDetail;
