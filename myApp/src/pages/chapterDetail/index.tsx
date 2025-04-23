import { View, Text, Video, Button } from '@tarojs/components';
import {
  useRouter,
  showLoading,
  hideLoading,
  showToast,
  openDocument,
  downloadFile,
  chooseMessageFile,
  uploadFile
} from '@tarojs/taro';

import { useState } from 'react';

import NavigationBar from '@/components/NavigationBar';
import './index.less';

const ChapterDetail = () => {
  // 将文档信息改为数组结构
  const [chapterData, setChapterData] = useState({
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4', // 示例视频 URL
    documents: [ // 使用 documents 数组
      {
        id: 1, // 添加唯一标识符
        name: '课程讲义.pdf',
        url: 'https://www.africau.edu/images/default/sample.pdf', // 初始文档 URL
        status: 'approved' // 初始文档状态为已批准
      }
    ]
  });

  // 模拟获取数据函数
  // const fetchChapterData = async (identifier) => {
  //   showLoading({ title: '加载中...' });
  //   try {
  //     // const res = await api.getChapterDetails(identifier);
  //     // setChapterData(res.data);
  //   } catch (error) {
  //     showToast({ title: '加载失败', icon: 'none' });
  //   } finally {
  //     hideLoading();
  //   }
  // };

  // 修改 handleDownload 以接受文档对象
  const handleDownload = (document: { name: string; url: string | null }) => {
    if (!document.url || document.url.startsWith('wxfile://')) {
       showToast({ title: '文件无法下载或查看', icon: 'none' });
       return;
    }
    showLoading({ title: '下载中...' });
    downloadFile({
      url: document.url, // 使用传入的文档 URL
      success: (res) => {
        hideLoading();
        if (res.statusCode === 200) {
          const filePath = res.tempFilePath;
          showToast({ title: '下载成功', icon: 'success' });
          openDocument({
            filePath: filePath,
            showMenu: true,
            fail: (err) => {
              console.error('打开文档失败:', err);
              showToast({
                title: '打开文档失败，请在文件管理器中查看',
                icon: 'none',
                duration: 2000
              });
            }
          });
        } else {
          showToast({ title: `下载失败 (${res.statusCode})`, icon: 'none' });
        }
      },
      fail: (err) => {
        hideLoading();
        console.error('下载文件失败:', err);
        showToast({ title: '下载失败，请检查网络或链接', icon: 'none' });
      }
    });
  };

  // 修改：处理文件上传，添加到列表
  const handleUploadFile = () => {
    chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
      success: (res) => {
        const tempFile = res.tempFiles[0];
        if (tempFile) {
          console.log('选择的文件信息:', tempFile);
          // 修改提示信息
          showToast({ title: '上传成功，等待审核', icon: 'none', duration: 2000 });

          // 创建新的文档对象
          const newDocument = {
            id: Date.now(), // 使用时间戳作为临时 ID
            name: tempFile.name,
            url: null, // 初始 URL 为 null，表示不可下载
            status: 'pending' // 状态为待审核
          };

          // 将新文档添加到 documents 数组
          setChapterData((prev) => ({
            ...prev,
            documents: [...prev.documents, newDocument] // 追加到数组末尾
          }));

          /*  // 注释掉实际上传的部分
          showLoading({ title: '上传中...' });
          // 调用 Taro.uploadFile 将文件上传到你的服务器
          uploadFile({
            url: 'YOUR_BACKEND_UPLOAD_API_ENDPOINT', // <--- 替换成你的后端上传接口地址
            filePath: tempFile.path,
            name: 'file', // 后端接收文件的字段名
            // 可以添加 formData 来传递额外参数，例如章节 ID
            // formData: {
            //   chapterId: router.params.id, // 假设你有章节 ID
            // },
            success: (uploadRes) => {
              hideLoading();
              // 这里需要检查后端返回的数据格式来判断是否上传成功
              // 通常后端会返回 JSON 字符串，需要解析
              try {
                const data = JSON.parse(uploadRes.data);
                if (data.success) {
                  // 假设后端返回 { success: true, fileUrl: '...', fileName: '...' }
                  showToast({ title: '上传成功', icon: 'success' });
                  // 可选：更新当前页面的文档信息
                  setChapterData((prev) => ({
                    ...prev,
                    documentUrl: data.fileUrl,
                    documentName: data.fileName || tempFile.name
                  }));
                } else {
                  showToast({
                    title: data.message || '上传失败',
                    icon: 'none'
                  });
                }
              } catch (e) {
                // 如果后端直接返回非 JSON 字符串或者状态码不是 2xx，也算失败
                if (uploadRes.statusCode >= 200 && uploadRes.statusCode < 300) {
                  // 可能是后端未按约定返回 JSON
                  showToast({ title: '上传成功，但响应异常', icon: 'none' });
                } else {
                  showToast({
                    title: `上传失败 (${uploadRes.statusCode})`,
                    icon: 'none'
                  });
                }
              }
            },
            fail: (err) => {
              hideLoading();
              console.error('上传文件失败:', err);
              showToast({ title: '上传接口调用失败', icon: 'none' });
            }
          });
          */ // 结束注释
        }
      },
      fail: (err) => {
        console.log('选择文件失败:', err);
      }
    });
  };

  // 新增：根据文件名获取简单文本图标
  const getDocumentIconText = (fileName: string): string => {
    if (!fileName) return '';
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '[PDF]';
      case 'ppt':
      case 'pptx':
        return '[PPT]';
      case 'doc':
      case 'docx':
        return '[DOC]';
      case 'xls':
      case 'xlsx':
        return '[XLS]';
      case 'txt':
        return '[TXT]';
      default:
        return '[文件]'; // 默认图标
    }
  };


  return (
    <View className='chapter-detail'>
      <NavigationBar title={'章节详情'} />

      <View className='content-section'>
        <Text className='section-title'>章节视频</Text>
        {chapterData.videoUrl ? (
          <Video
            className='chapter-video'
            src={chapterData.videoUrl}
            controls
            autoplay={false}
            // 可以添加 poster 等属性
          />
        ) : (
          <Text className='placeholder-text'>暂无视频</Text>
        )}
      </View>

      <View className='content-section'>
        <Text className='section-title'>课程文档</Text>
        {/* 遍历 documents 数组 */}
        {chapterData.documents && chapterData.documents.length > 0 ? (
          chapterData.documents.map((doc) => (
            <View key={doc.id} className='document-section'>
              <View className='document-info'>
                <Text className='document-icon'>{getDocumentIconText(doc.name)}</Text>
                <Text className='document-name'>{doc.name}</Text>
                {/* 显示待审核状态 */}
                {doc.status === 'pending' && (
                   <Text className='document-status'>(待审核)</Text>
                )}
              </View>
              <Button
                className='download-button'
                type='primary'
                size='mini'
                // onClick 需要传递当前文档对象
                onClick={() => handleDownload(doc)}
                // 禁用条件：状态不是 approved 或者 URL 不存在
                disabled={doc.status !== 'approved' || !doc.url}
              >
                下载/查看
              </Button>
            </View>
          ))
        ) : (
          <Text className='placeholder-text'>暂无文档</Text>
        )}
        {/* 上传按钮 */}
        <View className='upload-section'>
          <Button
            className='upload-button'
            type='default'
            size='mini'
            onClick={handleUploadFile}
          >
            上传新文档
          </Button>
        </View>
      </View>
    </View>
  );
};

export default ChapterDetail;
