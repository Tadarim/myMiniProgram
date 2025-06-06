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
  getOrCreateSession,
  leaveGroup,
  dissolveGroup
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
  isSystem?: boolean;
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

let ws: WebSocket | null = null;

const ChatRoom: FC = () => {
  const router = useRouter();
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
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [targetName, setTargetName] = useState<string>('聊天'); // 添加目标用户名状态
  const isGroupChat = router.params.type === 'group';
  const [isGroupAdmin, setIsGroupAdmin] = useState(false); // 添加是否是群主的状态

  const panelHeight = 260;
  const inputHeight = 60;

  const createOrGetSession = async () => {
    try {
      Taro.showLoading({ title: '加载中...' });

      let targetUserId;

      if (router.params.targetId) {
        targetUserId = parseInt(router.params.targetId, 10);
      } else if (router.params.id && router.params.type === 'single') {
        targetUserId = parseInt(router.params.id, 10);
      } else {
        throw new Error('缺少目标用户ID');
      }

      if (Number.isNaN(targetUserId) || targetUserId <= 0) {
        throw new Error('无效的用户ID');
      }

      const res = await getOrCreateSession(targetUserId);
      if (res.statusCode === 200 && res.data.code === 200) {
        const newSessionId = res.data.data.id;

        if (res.data.data.target_name) {
          setTargetName(res.data.data.target_name);
        }

        return newSessionId;
      } else {
        throw new Error(`创建会话失败: ${res.data.message || '未知错误'}`);
      }
    } catch (error) {
      console.error('创建/获取会话失败:', error);
      Taro.showToast({
        title: '创建会话失败',
        icon: 'none'
      });
      return null;
    } finally {
      Taro.hideLoading();
    }
  };

  const fetchMessages = async (
    pageNum: number = 1,
    isLoadMore: boolean = false,
    providedSessionId?: number | null
  ) => {
    try {
      setLoading(true);

      const chatSessionId =
        providedSessionId !== undefined ? providedSessionId : sessionId;

      if (
        !chatSessionId ||
        typeof chatSessionId !== 'number' ||
        chatSessionId <= 0
      ) {
        console.error('没有有效的会话ID，无法获取消息');
        Taro.showToast({
          title: '无法获取消息',
          icon: 'none'
        });
        return;
      }

      console.log(`获取会话[${chatSessionId}]的消息，页码:${pageNum}`);

      const res = await getChatMessages(chatSessionId, pageNum);
      if (res.statusCode === 200 && res.data.code === 200) {
        // 验证消息属于当前会话
        const currentSessionId = sessionId;
        if (currentSessionId && currentSessionId !== chatSessionId) {
          console.warn(
            '会话ID不匹配，期望:',
            currentSessionId,
            '实际:',
            chatSessionId
          );
          // 如果当前会话ID已经改变，忽略这次请求的结果
          return;
        }

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
          needs_url_fetch: msg.needs_url_fetch,
          isSystem: msg.message_type === 'system'
        }));

        if (isLoadMore) {
          setMessages((prev) => [...formattedMessages, ...prev]);
        } else {
          setMessages(formattedMessages);
        }

        setHasMore(formattedMessages.length === 20);
        setPage(pageNum);
      } else {
        console.error('获取消息失败:', res.data.message || '未知错误');
        Taro.showToast({
          title: '获取消息失败',
          icon: 'none'
        });
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

  const initChat = async () => {
    if (router.params.name) {
      try {
        const decodedName = decodeURIComponent(router.params.name);
        setTargetName(decodedName);
      } catch (e) {
        setTargetName(router.params.name);
      }
    }

    // 处理群聊
    if (router.params.type === 'group') {
      const groupId = parseInt(router.params.id || '0', 10);
      const sessionIdFromParams = parseInt(router.params.sessionId || '0', 10);

      if (!Number.isNaN(groupId) && groupId > 0) {
        // 优先使用传入的sessionId，否则根据规则计算
        const actualSessionId =
          !Number.isNaN(sessionIdFromParams) && sessionIdFromParams > 0
            ? sessionIdFromParams
            : groupId + 29; // 群组会话ID规则：群组ID+29

        setSessionId(actualSessionId);
        fetchGroupMessages(groupId, 1, false, actualSessionId);
      } else {
        Taro.showToast({
          title: '无效的群组ID',
          icon: 'none'
        });
        setTimeout(() => Taro.navigateBack(), 1500);
      }
      return;
    }

    // 处理单聊（私聊）
    // 优先使用sessionId参数（从帖子详情页跳转时使用）
    if (router.params.sessionId) {
      // 使用多种方法尝试解析sessionId
      let sessionIdValue;
      try {
        // 直接从URL获取原始值
        const rawSessionId = router.params.sessionId;

        // 尝试直接转换为数字
        sessionIdValue = parseInt(String(rawSessionId).trim(), 10);

        if (Number.isNaN(sessionIdValue) || sessionIdValue <= 0) {
          throw new Error('无效的会话ID值');
        }

        // 设置会话ID状态
        setSessionId(sessionIdValue);

        // 获取消息（等待状态更新后再获取）
        setTimeout(() => {
          fetchMessages(1, false, sessionIdValue);
        }, 100);
      } catch (error) {
        Taro.showToast({
          title: '无效的会话',
          icon: 'none'
        });
        setTimeout(() => Taro.navigateBack(), 1500);
      }
    }
    // 从消息列表页面跳转时使用id作为会话ID
    else if (router.params.id && router.params.type !== 'single') {
      try {
        // 直接使用id作为会话ID
        const sessionIdValue = parseInt(String(router.params.id).trim(), 10);

        if (Number.isNaN(sessionIdValue) || sessionIdValue <= 0) {
          throw new Error('无效的会话ID值');
        }

        // 设置会话ID状态
        setSessionId(sessionIdValue);

        // 获取消息（等待状态更新后再获取）
        setTimeout(() => {
          fetchMessages(1, false, sessionIdValue);
        }, 100);
      } catch (error) {
        Taro.showToast({
          title: '无效的会话',
          icon: 'none'
        });
        setTimeout(() => Taro.navigateBack(), 1500);
      }
    }
    // 尝试创建会话（从用户主页或需要新建会话的地方跳转）
    else if (
      router.params.needCreate === 'true' ||
      router.params.targetId ||
      (router.params.id && router.params.type === 'single')
    ) {
      console.log('尝试创建会话');

      // 获取targetId - 目标用户ID
      let targetUserId;

      // 优先从targetId参数获取（从帖子详情页等跳转）
      if (router.params.targetId) {
        targetUserId = parseInt(router.params.targetId, 10);
      }
      // 其次从id参数获取（从用户列表页等跳转，且type是'single'）
      else if (router.params.id && router.params.type === 'single') {
        targetUserId = parseInt(router.params.id, 10);
      }

      if (!targetUserId || Number.isNaN(targetUserId) || targetUserId <= 0) {
        console.error('无效的目标用户ID:', targetUserId);
        Taro.showToast({
          title: '无法创建会话',
          icon: 'none'
        });
        setTimeout(() => Taro.navigateBack(), 1500);
        return;
      }

      // 首先从本地缓存中查找会话ID
      const chatSessionsCache = Taro.getStorageSync('chatSessionsCache') || {};
      const cachedSession = chatSessionsCache[`user_${targetUserId}`];

      // 检查会话缓存是否有效（30分钟内）
      if (
        cachedSession &&
        Date.now() - cachedSession.timestamp < 30 * 60 * 1000
      ) {
        console.log('从缓存获取会话信息:', cachedSession);

        // 设置会话ID
        const newSessionId = cachedSession.data.id;
        setSessionId(newSessionId);

        // 设置目标用户名（如果有）
        if (cachedSession.data.target_name) {
          setTargetName(cachedSession.data.target_name);
        }

        // 获取消息
        fetchMessages(1, false, newSessionId);

        return;
      }

      // 没有有效缓存，创建新会话
      const newSessionId = await createOrGetSession();

      console.log('会话创建成功:', newSessionId);

      if (newSessionId) {
        // 缓存会话ID
        if (targetUserId) {
          // 更新chatSessionsCache
          chatSessionsCache[`user_${targetUserId}`] = {
            data: {
              id: newSessionId,
              target_id: targetUserId,
              target_name: targetName
            },
            timestamp: Date.now()
          };
          Taro.setStorageSync('chatSessionsCache', chatSessionsCache);

          // 兼容旧缓存
          const sessions = Taro.getStorageSync('chatSessions') || {};
          sessions[`user_${targetUserId}`] = newSessionId;
          Taro.setStorageSync('chatSessions', sessions);
        }

        // 重要：先设置状态，然后直接使用newSessionId获取消息，避免状态更新不及时的问题
        setSessionId(newSessionId);
        fetchMessages(1, false, newSessionId);
      } else {
        console.error('会话创建失败');
        Taro.navigateBack();
      }
    } else {
      console.error('缺少必要参数，无法初始化聊天');
      Taro.showToast({
        title: '无法开始聊天',
        icon: 'none'
      });
      setTimeout(() => Taro.navigateBack(), 1500);
    }
  };

  // 获取群组信息并检查当前用户是否是群主
  useEffect(() => {
    if (isGroupChat && router.params.id) {
      const groupId = parseInt(router.params.id, 10);

      // 获取用户信息
      const userInfo = Taro.getStorageSync('userInfo');
      const userId = userInfo?.id;

      // 发起API请求获取群组信息
      Taro.request({
        url: `/chat/group/${groupId}`,
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Taro.getStorageSync('token')}`
        }
      })
        .then((res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            const groupInfo = res.data.data;
            // 检查当前用户是否是群主
            setIsGroupAdmin(groupInfo.creator_id === userId);
          }
        })
        .catch((err) => {
          console.error('获取群组信息失败:', err);
        });
    }
  }, [isGroupChat, router.params.id]);

  useEffect(() => {
    initChat();

    // 组件卸载时清理
    return () => {
      // 清除消息状态
      setMessages([]);
      // 重置会话ID
      setSessionId(null);
    };
  }, []);

  // 使用缓存的会话ID
  useEffect(() => {
    // 当会话ID变化时，更新本地存储
    if (
      sessionId &&
      router.params.targetId &&
      router.params.type === 'single'
    ) {
      const targetId = parseInt(router.params.targetId, 10);
      if (!Number.isNaN(targetId) && targetId > 0) {
        const sessions = Taro.getStorageSync('chatSessions') || {};
        sessions[`user_${targetId}`] = sessionId;
        Taro.setStorageSync('chatSessions', sessions);
      }
    }
  }, [sessionId]);

  useEffect(() => {
    const token = Taro.getStorageSync('token');
    Taro.connectSocket({
      url: `ws://192.168.42.147:3000?token=${token}`
    });
    Taro.onSocketOpen(() => {
      console.log('WebSocket 连接已建立');
    });

    Taro.onSocketMessage((event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'chat') {
        if (msg.data.sessionId == sessionId) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              type: msg.data.type,
              content: msg.data.content,
              fileName: msg.data.fileName,
              fileSize: msg.data.fileSize,
              time: msg.data.created_at,
              isSelf: false,
              avatar: '', // 可补充
              name: '' // 可补充
            }
          ]);
        }
      }
    });

    Taro.onSocketClose(() => {
      console.log('WebSocket 连接已关闭');
    });

    return () => {
      Taro.closeSocket();
    };
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
      // 使用状态中的sessionId
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
      success: function (res) {
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
            success: function () {
              console.log('打开文档成功');
            },
            fail: function (err) {
              console.error('无法打开文件:', err);
              // 如果无法打开，提示保存
              Taro.showModal({
                title: '无法预览',
                content: '该文件类型无法预览，是否保存到手机？',
                success: function (modalRes) {
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
      fail: function (err) {
        console.error('文件下载失败:', err);
        Taro.hideLoading();

        Taro.showModal({
          title: '下载失败',
          content: '文件下载失败，请检查网络连接或刷新页面重试',
          confirmText: '刷新',
          success: function (modalRes) {
            if (modalRes.confirm) {
              // 刷新页面以获取新的URL
              fetchMessages(page, false);
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
        success: function (modalRes) {
          if (modalRes.confirm) {
            // 刷新页面以获取新的URL
            fetchMessages(page, false);
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
      success: function (res) {
        console.log('文件下载成功:', res);

        if (res.statusCode === 200) {
          // 保存临时文件到本地
          Taro.saveFile({
            tempFilePath: res.tempFilePath,
            success: function (saveRes) {
              Taro.hideLoading();
              Taro.showToast({
                title: '文件已保存',
                icon: 'success'
              });
              console.log('文件保存成功:', saveRes);
            },
            fail: function (saveErr) {
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
      fail: function (err) {
        console.error('文件下载失败:', err);
        Taro.hideLoading();

        Taro.showModal({
          title: '下载失败',
          content: '文件下载失败，请检查网络连接或刷新页面重试',
          confirmText: '刷新',
          success: function (modalRes) {
            if (modalRes.confirm) {
              // 刷新页面以获取新的URL
              fetchMessages(page, false);
            }
          }
        });
      }
    });
  };

  // 懒加载图片组件，需要时才获取URL
  const LazyLoadImage = ({ messageId, fileName, content }) => {
    // 直接使用传入的content作为图片URL
    if (!content || !content.includes('http')) {
      return (
        <View className='lazy-image error'>
          <Text>图片链接无效</Text>
        </View>
      );
    }

    return (
      <Image
        className='message-content-image'
        src={content}
        mode='widthFix'
        onClick={() => Taro.previewImage({ urls: [content] })}
      />
    );
  };

  // 文件附件组件
  const FileAttachment = ({ messageId, fileName, fileSize, content }) => {
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

    const handleFileOpen = () => {
      if (!content || !content.includes('http')) {
        Taro.showToast({
          title: '文件链接无效',
          icon: 'none'
        });
        return;
      }

      handleOpenFile(content, fileName);
    };

    const handleFileSave = () => {
      if (!content || !content.includes('http')) {
        Taro.showToast({
          title: '文件链接无效',
          icon: 'none'
        });
        return;
      }

      handleSaveFile(content, fileName);
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
            <Text>查看</Text>
          </View>
          <View
            className='file-save-btn'
            onClick={(e) => {
              e.stopPropagation();
              handleFileSave();
            }}
          >
            <Text className='save-icon'>💾</Text>
            <Text>保存</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderMessageContent = (message: Message) => {
    if (message.type === 'image') {
      // 处理图片
      return (
        <LazyLoadImage
          messageId={message.id}
          fileName={message.fileName}
          content={message.content}
        />
      );
    } else if (message.type === 'file') {
      // 处理文件
      return (
        <FileAttachment
          messageId={message.id}
          fileName={message.fileName}
          fileSize={message.fileSize}
          content={message.content}
        />
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

    // 确保有有效的会话ID
    const chatSessionId = sessionId;

    if (
      !chatSessionId ||
      typeof chatSessionId !== 'number' ||
      chatSessionId <= 0
    ) {
      console.error('没有有效的会话ID，无法发送消息');
      Taro.showToast({
        title: '发送失败，无效会话',
        icon: 'none'
      });
      return;
    }

    try {
      const currentUserInfo = Taro.getStorageSync('userInfo');
      const tempMessage: Message = {
        id: Date.now(), // 临时ID
        type: 'text',
        content: inputValue,
        time: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        isSelf: true,
        avatar: currentUserInfo.avatar,
        name: currentUserInfo.username
      };

      // 先将消息添加到本地
      setMessages((prev) => [...prev, tempMessage]);
      scrollToBottom();
      setInputValue('');

      console.log(`发送消息到会话[${chatSessionId}]:`, inputValue);

      // 发送消息 - 群聊和私聊现在统一使用sendMessage API
      const res = await sendMessage({
        sessionId: chatSessionId,
        content: inputValue,
        type: 'text'
      });

      if (res.statusCode !== 200 || res.data.code !== 200) {
        console.error('服务器返回发送失败:', res.data.message || '未知错误');
        throw new Error('发送消息失败');
      } else {
        console.log('消息发送成功, ID:', res.data.data.id);
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
    // 确保有有效的会话ID
    const chatSessionId = sessionId;
    console.log(
      '上传图片使用的会话ID:',
      chatSessionId,
      '类型:',
      typeof chatSessionId
    );

    if (
      !chatSessionId ||
      typeof chatSessionId !== 'number' ||
      chatSessionId <= 0
    ) {
      console.error('没有有效的会话ID，无法上传图片');
      Taro.showToast({
        title: '上传失败，无效会话',
        icon: 'none'
      });
      return;
    }

    chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        try {
          setShowExtraPanel(false);
          const filePath = res.tempFilePaths[0];
          Taro.showLoading({ title: '上传中...' });

          // 先添加一个临时消息
          const currentUserInfo = Taro.getStorageSync('userInfo');
          const tempMessage: Message = {
            id: Date.now(), // 临时ID
            type: 'image',
            content: filePath, // 先用本地路径
            time: new Date().toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            isSelf: true,
            avatar: currentUserInfo.avatar,
            name: currentUserInfo.username
          };

          setMessages((prev) => [...prev, tempMessage]);
          scrollToBottom();

          // 上传图片
          const uploadRes = await uploadChatImage(filePath, chatSessionId);
          Taro.hideLoading();

          if (uploadRes.statusCode === 200) {
            const data = JSON.parse(uploadRes.data);
            if (data.code === 200) {
              // 成功上传，刷新消息列表
              fetchMessages(page, false);
            } else {
              throw new Error(data.message || '上传失败');
            }
          } else {
            throw new Error('上传失败，服务器错误');
          }
        } catch (error) {
          console.error('上传图片失败:', error);
          Taro.hideLoading();
          Taro.showToast({
            title: '上传失败',
            icon: 'none'
          });
        }
      }
    });
  };

  const handleUploadFile = () => {
    // 确保有有效的会话ID
    const chatSessionId = sessionId;
    console.log(
      '上传文件使用的会话ID:',
      chatSessionId,
      '类型:',
      typeof chatSessionId
    );

    if (
      !chatSessionId ||
      typeof chatSessionId !== 'number' ||
      chatSessionId <= 0
    ) {
      console.error('没有有效的会话ID，无法上传文件');
      Taro.showToast({
        title: '上传失败，无效会话',
        icon: 'none'
      });
      return;
    }

    chooseMessageFile({
      count: 1,
      success: async (res) => {
        try {
          setShowExtraPanel(false);
          const file = res.tempFiles[0];
          const filePath = file.path;
          const fileName = file.name;

          Taro.showLoading({ title: '上传中...' });

          // 先添加一个临时消息
          const currentUserInfo = Taro.getStorageSync('userInfo');
          const tempMessage: Message = {
            id: Date.now(), // 临时ID
            type: 'file',
            content: fileName,
            fileName: fileName,
            fileSize: file.size,
            time: new Date().toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            isSelf: true,
            avatar: currentUserInfo.avatar,
            name: currentUserInfo.username
          };

          setMessages((prev) => [...prev, tempMessage]);
          scrollToBottom();

          // 上传文件
          const uploadRes = await uploadChatFile(
            filePath,
            fileName,
            chatSessionId
          );
          Taro.hideLoading();

          if (uploadRes.statusCode === 200) {
            const data = JSON.parse(uploadRes.data);
            if (data.code === 200) {
              // 成功上传，刷新消息列表
              fetchMessages(page, false);
            } else {
              throw new Error(data.message || '上传失败');
            }
          } else {
            throw new Error('上传失败，服务器错误');
          }
        } catch (error) {
          console.error('上传文件失败:', error);
          Taro.hideLoading();
          Taro.showToast({
            title: '上传失败',
            icon: 'none'
          });
        }
      }
    });
  };

  const handleLeaveGroup = () => {
    // 根据是否是群主显示不同的操作
    const actionText = isGroupAdmin ? '解散' : '退出';

    Taro.showModal({
      title: '提示',
      content: isGroupAdmin
        ? '确定要解散该群聊吗？解散后群聊将被永久删除且无法恢复。'
        : '确定要退出该群聊吗？',
      success: function (res) {
        if (res.confirm) {
          console.log(`用户点击确定，执行${actionText}群聊逻辑`);

          const currentGroupId = parseInt(router.params.id || '0', 10);
          if (currentGroupId <= 0) {
            Taro.showToast({ title: '群组ID无效', icon: 'none' });
            return;
          }

          // 显示加载中
          Taro.showLoading({ title: '处理中...' });

          // 根据是否是群主调用不同的API
          const apiCall = isGroupAdmin
            ? dissolveGroup(currentGroupId)
            : leaveGroup(currentGroupId);

          apiCall
            .then((response) => {
              if (response.statusCode === 200 && response.data.code === 200) {
                Taro.hideLoading();
                Taro.showToast({
                  title: isGroupAdmin ? '已解散群聊' : '已退出群聊',
                  icon: 'success'
                });

                // 标记群聊需要从列表中删除
                const currentChatId = currentGroupId;
                if (currentChatId) {
                  Taro.setStorageSync('deletedChatId', currentChatId);
                  console.log(
                    `ChatRoom: Marked chat ID ${currentChatId} for deletion.`
                  );
                }

                // 返回上一页
                setTimeout(() => {
                  Taro.navigateBack();
                }, 1000);
              } else {
                Taro.hideLoading();
                Taro.showToast({
                  title: response.data.message || `${actionText}失败`,
                  icon: 'none'
                });
              }
            })
            .catch((err) => {
              console.error(`${actionText}群组失败:`, err);
              Taro.hideLoading();
              Taro.showToast({ title: '操作失败', icon: 'none' });
            });
        } else if (res.cancel) {
          setShowExtraPanel(false);
        }
      },
      fail: function (err) {
        console.error(`${actionText}群聊操作失败:`, err);
        Taro.showToast({ title: '操作失败', icon: 'none' });
        setShowExtraPanel(false);
      }
    });
  };

  // 处理群聊消息获取
  const fetchGroupMessages = async (
    groupId: number,
    pageNum: number = 1,
    isLoadMore: boolean = false,
    providedSessionId?: number | null
  ) => {
    try {
      setLoading(true);

      // 使用提供的sessionId而不是groupId来获取消息
      const sessionIdToUse =
        providedSessionId !== undefined ? providedSessionId : sessionId;

      if (
        !sessionIdToUse ||
        typeof sessionIdToUse !== 'number' ||
        sessionIdToUse <= 0
      ) {
        console.error('没有有效的会话ID，无法获取消息');
        Taro.showToast({
          title: '无法获取消息',
          icon: 'none'
        });
        return;
      }

      console.log(
        `获取群组[${groupId}]的消息，使用会话ID:${sessionIdToUse}, 页码:${pageNum}`
      );

      // 这里使用统一的getChatMessages API，使用会话ID获取消息
      const res = await getChatMessages(sessionIdToUse, pageNum);
      if (res.statusCode === 200 && res.data.code === 200) {
        // 验证消息属于当前会话
        const currentSessionId = sessionId;
        if (currentSessionId && currentSessionId !== sessionIdToUse) {
          console.warn(
            '会话ID不匹配，期望:',
            currentSessionId,
            '实际:',
            sessionIdToUse
          );
          // 如果当前会话ID已经改变，忽略这次请求的结果
          return;
        }

        const formattedMessages = res.data.data.map((msg: any) => ({
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
          needs_url_fetch: msg.needs_url_fetch,
          isSystem: msg.message_type === 'system'
        }));

        if (isLoadMore) {
          setMessages((prev) => [...formattedMessages, ...prev]);
        } else {
          setMessages(formattedMessages);
        }

        setHasMore(formattedMessages.length === 20);
        setPage(pageNum);

        if (sessionIdToUse) {
          // 标记消息已读 - 临时删除这个功能调用，因为后端接口不存在
          // markGroupMessagesRead(sessionIdToUse);
        }
      } else {
        console.error('获取群消息失败:', res.data.message || '未知错误');
        Taro.showToast({
          title: '获取消息失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('获取群消息失败:', error);
      Taro.showToast({
        title: '获取消息失败',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='chatroom-container'>
      <NavigationBar title={targetName} showBack />

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
            className={`message-item-wrapper ${
              msg.isSystem ? 'system' : msg.isSelf ? 'self' : 'other'
            }`}
          >
            {msg.isSystem ? (
              <View className='system-message'>
                <Text className='system-text'>{msg.content}</Text>
              </View>
            ) : (
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
            )}
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
              <Text className='extra-panel-text'>
                {isGroupAdmin ? '解散群聊' : '退出群聊'}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default ChatRoom;
