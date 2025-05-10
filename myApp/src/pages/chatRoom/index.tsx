import { View, ScrollView, Input, Image, Text } from '@tarojs/components';
import Taro, { useRouter, chooseImage, chooseMessageFile } from '@tarojs/taro'; // 引入上传 API

import {
  Add,
  Minus,
  Image as ImageIcon,
  List as ListIcon,
  Order
} from '@nutui/icons-react-taro';
import { useRef, useState, useEffect, FC } from 'react';

import {
  getChatMessages,
  sendMessage,
  uploadChatImage,
  uploadChatFile,
  getFileUrl
} from '@/api/chat';
import NavigationBar from '@/components/navigationBar';
import { ChatMessage } from '@/types/chat';

import './index.less';

interface Message {
  id: number;
  type: 'text' | 'image' | 'file';
  content: string;
  fileName?: string;
  fileSize?: number;
  time: string;
  isSelf: boolean;
  avatar: string;
  name: string;
  needs_url_fetch?: boolean;
}

const EMOJI_LIST = [
  {
    text: '[微笑]',
    url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/0.gif'
  },
  {
    text: '[撇嘴]',
    url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/1.gif'
  },
  {
    text: '[色]',
    url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/2.gif'
  },
  {
    text: '[发呆]',
    url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/3.gif'
  },
  {
    text: '[得意]',
    url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/4.gif'
  },
  {
    text: '[流泪]',
    url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/5.gif'
  },
  {
    text: '[害羞]',
    url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/6.gif'
  },
  {
    text: '[闭嘴]',
    url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/7.gif'
  },
  {
    text: '[睡]',
    url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/8.gif'
  },
  {
    text: '[大哭]',
    url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/9.gif'
  },
  {
    text: '[尴尬]',
    url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/10.gif'
  },
  {
    text: '[发怒]',
    url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/11.gif'
  },
  {
    text: '[调皮]',
    url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/12.gif'
  },
  {
    text: '[呲牙]',
    url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/13.gif'
  },
  {
    text: '[惊讶]',
    url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/14.gif'
  },
  {
    text: '[难过]',
    url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/15.gif'
  },
  {
    text: '[酷]',
    url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/16.gif'
  },
  {
    text: '[冷汗]',
    url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/17.gif'
  },
  {
    text: '[抓狂]',
    url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/18.gif'
  },
  {
    text: '[吐]',
    url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/19.gif'
  },
  {
    text: '[偷笑]',
    url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/20.gif'
  }
];

const ChatRoom: FC = () => {
  const router = useRouter();
  const { id: sessionId, name, type } = router.params;
  const scrollViewRef = useRef<any>(null);

  const [inputValue, setInputValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showExtraPanel, setShowExtraPanel] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [scrollTop, setScrollTop] = useState(0);
  const isGroupChat = type === 'group';

  const panelHeight = 260;
  const inputHeight = 60;
  const navHeight = 84;

  const fetchMessages = async (
    pageNum: number = 1,
    isLoadMore: boolean = false
  ) => {
    try {
      setLoading(true);
      const res = await getChatMessages(Number(sessionId), pageNum);
      if (res.statusCode === 200 && res.data.code === 200) {
        const formattedMessages = res.data.data.map((msg: ChatMessage) => ({
          id: msg.id,
          type: msg.type,
          content: msg.content,
          time: new Date(msg.created_at).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          isSelf: msg.sender_id === Number(Taro.getStorageSync('userInfo').id),
          avatar: msg.sender_avatar,
          name: msg.sender_name,
          fileName: msg.file_name,
          fileSize: msg.file_size,
          needs_url_fetch: msg.needs_url_fetch
        }));

        if (isLoadMore) {
          setMessages((prev) => [...formattedMessages, ...prev]);
        } else {
          setMessages(formattedMessages);
        }

        setHasMore(formattedMessages.length === 20);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('获取消息失败:', error);
      Taro.showToast({
        title: '获取消息失败',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [sessionId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      try {
        if (process.env.TARO_ENV === 'h5') {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTop =
              scrollViewRef.current.scrollHeight;
          }
        } else {
          setScrollTop(99999);
        }
      } catch (err) {
        console.error('滚动失败:', err);
      }
    }, 200);
  };

  useEffect(() => {
    if (messages.length > 0 && isFirstLoad) {
      scrollToBottom();
      setIsFirstLoad(false);
    }
  }, [messages.length, isFirstLoad]);

  const handleScroll = (e) => {
    const { scrollTop: currentScrollTop } = e.detail;
    if (currentScrollTop < 50 && hasMore && !loading) {
      fetchMessages(page + 1, true);
    }
  };

  const handleEmojiClick = (emoji) => {
    setInputValue((prev) => prev + emoji.text);
    setShowExtraPanel(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = bytes > 0 ? Math.floor(Math.log(bytes) / Math.log(k)) : 0;
    const index = Math.min(i, sizes.length - 1);
    return (
      parseFloat((bytes / Math.pow(k, index)).toFixed(2)) + ' ' + sizes[index]
    );
  };

  const handleOpenFile = async (fileUrl: string, fileName?: string) => {
    console.log('准备下载文件:', fileUrl);
    // 检查URL是否包含token，如果不包含，显示错误信息
    if (!fileUrl.includes('token=')) {
      Taro.showModal({
        title: '提示',
        content: '文件链接已过期，请刷新页面后重试',
        showCancel: false
      });
      return;
    }

    if (!fileName) {
      fileName = '未命名文件_' + new Date().getTime();
    }

    Taro.showLoading({ title: '正在下载...' });

    // 创建临时文件路径
    const filePath = `${Taro.env.USER_DATA_PATH}/${fileName}`;

    // 下载文件（设置较长的超时时间）
    Taro.downloadFile({
      url: fileUrl,
      filePath,
      timeout: 60000, // 设置60秒超时
      success: function(res) {
        console.log('文件下载成功:', res);
        Taro.hideLoading();

        if (res.statusCode === 200) {
          Taro.showToast({
            title: '下载成功',
            icon: 'success',
            duration: 1500
          });

          // 尝试打开文件
          Taro.openDocument({
            filePath: res.tempFilePath || filePath,
            showMenu: true,
            success: function() {
              console.log('打开文档成功');
            },
            fail: function(err) {
              console.error('无法打开文件:', err);
              // 如果无法打开，提示保存
              Taro.showModal({
                title: '无法预览',
                content: '该文件类型无法预览，是否保存到手机？',
                success: function(modalRes) {
                  if (modalRes.confirm) {
                    // 保存文件
                    handleSaveFile(fileUrl, fileName);
                  }
                }
              });
            }
          });
        } else {
          console.error('下载文件状态异常:', res.statusCode);
          Taro.showToast({
            title: '下载失败',
            icon: 'none'
          });
        }
      },
      fail: function(err) {
        console.error('文件下载失败:', err);
        Taro.hideLoading();

        Taro.showModal({
          title: '下载失败',
          content: '文件下载失败，请检查网络连接或刷新页面重试',
          confirmText: '刷新',
          success: function(modalRes) {
            if (modalRes.confirm) {
              // 刷新页面以获取新的URL
              fetchMessages();
            }
          }
        });
      }
    });
  };

  const handleSaveFile = (fileUrl: string, fileName?: string) => {
    console.log('准备保存文件:', fileUrl);
    // 检查URL是否包含token
    if (!fileUrl.includes('token=')) {
      Taro.showModal({
        title: '提示',
        content: '文件链接已过期，请刷新页面后重试',
        confirmText: '刷新',
        success: function(modalRes) {
          if (modalRes.confirm) {
            // 刷新页面以获取新的URL
            fetchMessages();
          }
        }
      });
      return;
    }

    if (!fileName) {
      fileName = '未命名文件_' + new Date().getTime();
    }

    Taro.showLoading({ title: '正在下载...' });

    // 下载文件到临时路径
    Taro.downloadFile({
      url: fileUrl,
      timeout: 60000, // 设置60秒超时
      success: function(res) {
        console.log('文件下载成功:', res);

        if (res.statusCode === 200) {
          // 保存临时文件到本地
          Taro.saveFile({
            tempFilePath: res.tempFilePath,
            success: function(saveRes) {
              Taro.hideLoading();
              Taro.showToast({
                title: '文件已保存',
                icon: 'success'
              });
              console.log('文件保存成功:', saveRes);
            },
            fail: function(saveErr) {
              console.error('文件保存失败:', saveErr);
              Taro.hideLoading();

              // 尝试使用其他方式保存
              if (process.env.TARO_ENV === 'h5') {
                try {
                  const a = document.createElement('a');
                  a.href = fileUrl;
                  a.download = fileName || '下载文件';
                  a.target = '_blank';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);

                  Taro.showToast({
                    title: '已打开下载链接',
                    icon: 'success'
                  });
                } catch (e) {
                  console.error('H5下载失败:', e);
                  Taro.showToast({
                    title: '保存失败',
                    icon: 'none'
                  });
                }
              } else {
                Taro.showToast({
                  title: '保存失败',
                  icon: 'none'
                });
              }
            }
          });
        } else {
          Taro.hideLoading();
          Taro.showToast({
            title: '下载失败',
            icon: 'none'
          });
        }
      },
      fail: function(err) {
        console.error('文件下载失败:', err);
        Taro.hideLoading();

        Taro.showModal({
          title: '下载失败',
          content: '文件下载失败，请检查网络连接或刷新页面重试',
          confirmText: '刷新',
          success: function(modalRes) {
            if (modalRes.confirm) {
              // 刷新页面以获取新的URL
              fetchMessages();
            }
          }
        });
      }
    });
  };

  // 懒加载图片组件，需要时才获取URL
  const LazyLoadImage = ({ messageId, fileName }) => {
    const [imgLoading, setImgLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [error, setError] = useState(false);

    const fetchImageUrl = async () => {
      try {
        setImgLoading(true);
        const res = await getFileUrl(messageId);
        if (res.statusCode === 200 && res.data.code === 200) {
          setImageUrl(res.data.data.url);
        } else {
          setError(true);
          console.error('获取图片URL失败:', res);
        }
      } catch (err) {
        setError(true);
        console.error('获取图片URL异常:', err);
      } finally {
        setImgLoading(false);
      }
    };

    useEffect(() => {
      fetchImageUrl();
    }, [messageId]);

    if (imgLoading) {
      return <View className='lazy-image loading'>加载中...</View>;
    }

    if (error || !imageUrl) {
      return (
        <View className='lazy-image error' onClick={fetchImageUrl}>
          <Text>图片加载失败，点击重试</Text>
        </View>
      );
    }

    return (
      <Image
        className='message-content-image'
        src={imageUrl}
        mode='widthFix'
        onClick={() => Taro.previewImage({ urls: [imageUrl] })}
      />
    );
  };

  // 文件附件组件，需要时才获取URL
  const FileAttachment = ({ messageId, fileName, fileSize }) => {
    const [fileLoading, setFileLoading] = useState(false);

    // 获取文件类型图标
    const fileExt = fileName?.split('.').pop()?.toLowerCase() || '';
    let fileIcon = '📄';

    if (['pdf'].includes(fileExt)) {
      fileIcon = '📕';
    } else if (['doc', 'docx'].includes(fileExt)) {
      fileIcon = '📘';
    } else if (['xls', 'xlsx'].includes(fileExt)) {
      fileIcon = '📗';
    } else if (['ppt', 'pptx'].includes(fileExt)) {
      fileIcon = '📙';
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
      fileIcon = '🖼️';
    } else if (['mp3', 'wav'].includes(fileExt)) {
      fileIcon = '🎵';
    } else if (['mp4', 'avi', 'mov'].includes(fileExt)) {
      fileIcon = '🎬';
    } else if (['zip', 'rar', '7z'].includes(fileExt)) {
      fileIcon = '📦';
    }

    // 格式化文件大小
    const formattedSize = fileSize ? formatFileSize(fileSize) : '';

    const handleFileOpen = async () => {
      try {
        setFileLoading(true);
        const res = await getFileUrl(messageId);
        if (res.statusCode === 200 && res.data.code === 200) {
          const fileUrl = res.data.data.url;
          handleOpenFile(fileUrl, fileName);
        } else {
          Taro.showToast({
            title: '获取文件链接失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('获取文件URL异常:', err);
        Taro.showToast({
          title: '获取文件链接失败',
          icon: 'none'
        });
      } finally {
        setFileLoading(false);
      }
    };

    const handleFileSave = async () => {
      try {
        setFileLoading(true);
        const res = await getFileUrl(messageId);
        if (res.statusCode === 200 && res.data.code === 200) {
          const fileUrl = res.data.data.url;
          handleSaveFile(fileUrl, fileName);
        } else {
          Taro.showToast({
            title: '获取文件链接失败',
            icon: 'none'
          });
        }
      } catch (err) {
        console.error('获取文件URL异常:', err);
        Taro.showToast({
          title: '获取文件链接失败',
          icon: 'none'
        });
      } finally {
        setFileLoading(false);
      }
    };

    return (
      <View className='file-card'>
        <View className='file-card-header'>
          <Text className='file-icon'>{fileIcon}</Text>
          <Text className='file-ext'>{fileExt.toUpperCase()}</Text>
        </View>
        <View className='file-card-content'>
          <Text className='file-name'>{fileName}</Text>
          {formattedSize && <Text className='file-size'>{formattedSize}</Text>}
        </View>
        <View className='file-card-actions'>
          <View
            className='file-download-btn'
            onClick={(e) => {
              e.stopPropagation();
              handleFileOpen();
            }}
          >
            <Text className='download-icon'>📄</Text>
            <Text>{fileLoading ? '加载中...' : '查看'}</Text>
          </View>
          <View
            className='file-save-btn'
            onClick={(e) => {
              e.stopPropagation();
              handleFileSave();
            }}
          >
            <Text className='save-icon'>💾</Text>
            <Text>{fileLoading ? '加载中...' : '保存'}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderMessageContent = (message: Message) => {
    if (message.type === 'image') {
      // 处理需要获取URL的图片
      if (message.needs_url_fetch) {
        return (
          <LazyLoadImage messageId={message.id} fileName={message.fileName} />
        );
      }

      return (
        <Image
          className='message-content-image'
          src={message.content}
          mode='widthFix'
          onClick={() => Taro.previewImage({ urls: [message.content] })}
        />
      );
    } else if (message.type === 'file') {
      // 处理需要获取URL的文件
      if (message.needs_url_fetch) {
        return (
          <FileAttachment
            messageId={message.id}
            fileName={message.fileName}
            fileSize={message.fileSize}
          />
        );
      }

      // 获取文件类型图标
      let fileIcon = '📄';
      const fileName = message.fileName || '文件';
      const fileExt = fileName.split('.').pop()?.toLowerCase() || '';

      if (['pdf'].includes(fileExt)) {
        fileIcon = '📕';
      } else if (['doc', 'docx'].includes(fileExt)) {
        fileIcon = '📘';
      } else if (['xls', 'xlsx'].includes(fileExt)) {
        fileIcon = '📗';
      } else if (['ppt', 'pptx'].includes(fileExt)) {
        fileIcon = '📙';
      } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
        fileIcon = '🖼️';
      } else if (['mp3', 'wav'].includes(fileExt)) {
        fileIcon = '🎵';
      } else if (['mp4', 'avi', 'mov'].includes(fileExt)) {
        fileIcon = '🎬';
      } else if (['zip', 'rar', '7z'].includes(fileExt)) {
        fileIcon = '📦';
      }

      // 格式化文件大小
      const fileSize = message.fileSize
        ? formatFileSize(message.fileSize)
        : '';

      return (
        <View className='file-card'>
          <View className='file-card-header'>
            <Text className='file-icon'>{fileIcon}</Text>
            <Text className='file-ext'>{fileExt.toUpperCase()}</Text>
          </View>
          <View className='file-card-content'>
            <Text className='file-name'>{fileName}</Text>
            {fileSize && <Text className='file-size'>{fileSize}</Text>}
          </View>
          <View className='file-card-actions'>
            <View
              className='file-download-btn'
              onClick={(e) => {
                e.stopPropagation();
                handleOpenFile(message.content, message.fileName);
              }}
            >
              <Text className='download-icon'>📄</Text>
              <Text>查看</Text>
            </View>
            <View
              className='file-save-btn'
              onClick={(e) => {
                e.stopPropagation();
                handleSaveFile(message.content, message.fileName);
              }}
            >
              <Text className='save-icon'>💾</Text>
              <Text>保存</Text>
            </View>
          </View>
        </View>
      );
    } else {
      let keyCounter = 0;
      return message.content
        .split(/(\[.*?\])/g)
        .filter((part) => part)
        .map((part) => {
          const emoji = EMOJI_LIST.find((e) => e.text === part);
          if (emoji) {
            return (
              <Image
                key={`emoji-${keyCounter++}`}
                className='message-emoji'
                src={emoji.url}
                mode='aspectFit'
              />
            );
          }
          return <Text key={`text-${keyCounter++}`}>{part}</Text>;
        });
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    try {
      const res = await sendMessage({
        sessionId: Number(sessionId),
        content: inputValue,
        type: 'text'
      });

      if (res.statusCode === 200 && res.data.code === 200) {
        fetchMessages();
        setInputValue('');
      } else {
        Taro.showToast({
          title: res.data.message || '发送失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      Taro.showToast({
        title: '发送失败',
        icon: 'none'
      });
    }
  };

  const toggleExtraPanel = () => {
    const nextState = !showExtraPanel;
    setShowExtraPanel(nextState);
    if (nextState) {
      setShowEmoji(false);
    }
    setTimeout(scrollToBottom, 300);
  };

  const toggleEmojiPanel = () => {
    const nextState = !showEmoji;
    setShowEmoji(nextState);
    if (nextState) {
      setShowExtraPanel(false);
    }
    setTimeout(scrollToBottom, 300);
  };

  const handleUploadImage = () => {
    chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        const tempFilePath = res.tempFilePaths[0];
        console.log('选择的图片:', tempFilePath);

        Taro.showLoading({ title: '上传中...' });

        uploadChatImage(tempFilePath, Number(sessionId))
          .then((uploadRes) => {
            console.log('图片上传结果:', uploadRes);

            if (uploadRes.statusCode !== 200) {
              throw new Error('上传失败');
            }

            let result;
            try {
              result = JSON.parse(uploadRes.data);
            } catch (e) {
              console.error('解析上传结果失败:', e);
              throw new Error('上传结果解析失败');
            }

            if (!result.success) {
              throw new Error(result.message || '上传失败');
            }

            // 图片上传成功后，消息已经在后端创建，只需刷新消息列表
            fetchMessages();
            Taro.hideLoading();
          })
          .catch((err) => {
            console.error('上传/发送图片失败:', err);
            Taro.hideLoading();
            Taro.showToast({
              title: err.message || '上传图片失败',
              icon: 'none'
            });
          });

        setShowExtraPanel(false);
      },
      fail: function (err) {
        console.error('选择图片失败:', err);
        setShowExtraPanel(false);
      }
    });
  };

  const handleUploadFile = () => {
    chooseMessageFile({
      count: 1,
      type: 'all',
      success: function (res) {
        const tempFile = res.tempFiles[0];
        console.log('选择的文件:', tempFile);

        if (!tempFile) {
          Taro.showToast({ title: '未选择文件', icon: 'none' });
          return;
        }

        if (tempFile.size === 0) {
          Taro.showToast({
            title: '文件大小为0，请选择有效文件',
            icon: 'none'
          });
          return;
        }

        Taro.showLoading({ title: '上传中...' });

        uploadChatFile(tempFile.path, tempFile.name, Number(sessionId))
          .then((uploadRes) => {
            console.log('文件上传结果:', uploadRes);

            if (uploadRes.statusCode !== 200) {
              throw new Error('上传失败');
            }

            let result;
            try {
              result = JSON.parse(uploadRes.data);
            } catch (e) {
              console.error('解析上传结果失败:', e);
              throw new Error('上传结果解析失败');
            }

            if (!result.success) {
              throw new Error(result.message || '上传失败');
            }

            // 文件上传成功后，消息已经在后端创建，只需刷新消息列表
            fetchMessages();
            Taro.hideLoading();
          })
          .catch((err) => {
            console.error('上传/发送文件失败:', err);
            Taro.hideLoading();
            Taro.showToast({
              title: err.message || '上传文件失败',
              icon: 'none'
            });
          });

        setShowExtraPanel(false);
      },
      fail: function (err) {
        console.error('选择文件失败:', err);
        setShowExtraPanel(false);
      }
    });
  };

  const handleLeaveGroup = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出该群聊吗？',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定，执行退出群聊逻辑');

          const currentChatId = parseInt(router.params.id || '0', 10);
          if (currentChatId) {
            Taro.setStorageSync('deletedChatId', currentChatId);
            console.log(
              `ChatRoom: Marked chat ID ${currentChatId} for deletion.`
            );
          }

          Taro.navigateBack();
        } else if (res.cancel) {
          console.log('用户点击取消');
          setShowExtraPanel(false);
        }
      },
      fail: function (err) {
        console.error('退出群聊操作失败:', err);
        Taro.showToast({ title: '操作失败', icon: 'none' });
        setShowExtraPanel(false);
      }
    });
  };

  return (
    <View className='chatroom-container'>
      <NavigationBar title={decodeURIComponent(name || '聊天')} showBack />

      <ScrollView
        enhanced
        scrollY
        scrollWithAnimation
        onScroll={handleScroll}
        showScrollbar={false}
        scrollTop={scrollTop}
        className='message-list'
        style={{
          bottom:
            showEmoji || showExtraPanel
              ? `${panelHeight + inputHeight}px`
              : `${inputHeight}px`
        }}
      >
        {loading && page > 1 && (
          <View className='loading-more'>加载更多...</View>
        )}

        {messages.map((msg) => (
          <View
            key={msg.id}
            className={`message-item-wrapper ${msg.isSelf ? 'self' : 'other'}`}
          >
            <View className={`message-item ${msg.isSelf ? 'self' : 'other'}`}>
              <Image className='avatar' src={msg.avatar} />
              <View className='message-content-area'>
                <View className='sender-info'>
                  {!msg.isSelf && <Text className='name'>{msg.name}</Text>}
                  {msg.isSelf && (
                    <Text className='name self-name'>{msg.name}</Text>
                  )}
                  <Text className='time'>{msg.time}</Text>
                </View>
                <View
                  className={`message-bubble ${
                    msg.type === 'text' ? '' : 'media'
                  }`}
                >
                  <View className='text'>{renderMessageContent(msg)}</View>
                </View>
              </View>
            </View>
          </View>
        ))}
        <View id='bottom' style={{ height: '30px', width: '100%' }} />
      </ScrollView>

      <View
        className='input-area'
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: showEmoji || showExtraPanel ? `${panelHeight}px` : 0,
          zIndex: 100,
          height: `${inputHeight}px`,
          boxSizing: 'border-box'
        }}
      >
        <View className='input-controls'>
          <View className='emoji-btn' onClick={toggleEmojiPanel}>
            {!showEmoji ? <Add /> : <Minus size={14} />}
          </View>
          <Input
            className='message-input'
            value={inputValue}
            onInput={(e) => setInputValue(e.detail.value)}
            placeholder='来吹吹水吧~'
            confirmType='send'
            onConfirm={handleSendMessage}
            onFocus={() => {
              setShowEmoji(false);
              setShowExtraPanel(false);
            }}
            adjustPosition={false}
            cursorSpacing={10}
          />
          {!inputValue.trim() && (
            <View className='extra-btn' onClick={toggleExtraPanel}>
              <ListIcon size={20} />
            </View>
          )}
          {inputValue.trim() ? (
            <View className='send-button active' onClick={handleSendMessage}>
              发送
            </View>
          ) : (
            !showExtraPanel && <View className='send-button'>发送</View>
          )}
        </View>
      </View>

      {showEmoji && (
        <View
          className='emoji-panel'
          style={{
            height: `${panelHeight}px`,
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100
          }}
        >
          {EMOJI_LIST.map((emoji) => (
            <View
              key={emoji.text}
              className='emoji-item'
              onClick={() => handleEmojiClick(emoji)}
            >
              <Image className='emoji-img' src={emoji.url} mode='aspectFit' />
            </View>
          ))}
        </View>
      )}

      {showExtraPanel && (
        <View
          className='extra-panel'
          style={{
            height: `${panelHeight}px`,
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100
          }}
        >
          <View className='extra-panel-item' onClick={handleUploadImage}>
            <View className='extra-panel-icon-wrapper'>
              <ImageIcon size={32} />
            </View>
            <Text className='extra-panel-text'>图片</Text>
          </View>
          <View className='extra-panel-item' onClick={handleUploadFile}>
            <View className='extra-panel-icon-wrapper'>
              <Order size={32} />
            </View>
            <Text className='extra-panel-text'>文件</Text>
          </View>
          {isGroupChat && (
            <View className='extra-panel-item' onClick={handleLeaveGroup}>
              <View className='extra-panel-icon-wrapper'>
                <Image
                  className='extra-panel-icon'
                  src={require('@/static/icon/leave.png')}
                />
              </View>
              <Text className='extra-panel-text'>退出群聊</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default ChatRoom;
