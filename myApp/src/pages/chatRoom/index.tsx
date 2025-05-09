import { View, ScrollView, Input, Image, Text } from '@tarojs/components';
import Taro, { useRouter, chooseImage, chooseMessageFile } from '@tarojs/taro'; // 引入上传 API

import {
  Add,
  Minus,
  Image as ImageIcon,
  List as ListIcon,
  Order
} from '@nutui/icons-react-taro';
import { FC, useState, useEffect } from 'react';

import { getChatMessages, sendMessage, ChatMessage } from '@/api/chat';
import NavigationBar from '@/components/navigationBar';

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
  const { id: sessionId, targetId, name, avatar } = router.params;

  const [inputValue, setInputValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showExtraPanel, setShowExtraPanel] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await getChatMessages(Number(sessionId));
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
          fileSize: msg.file_size
        }));
        setMessages(formattedMessages);
      } else {
        Taro.showToast({
          title: res.data.message || '获取消息失败',
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

  useEffect(() => {
    fetchMessages();
  }, [sessionId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      setScrollTop(messages.length * 200);
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleEmojiClick = (emoji) => {
    setInputValue((prev) => prev + emoji.text);
    setShowExtraPanel(false);
  };

  const renderMessageContent = (message: Message) => {
    if (message.type === 'image') {
      return (
        <Image
          className='message-content-image'
          src={message.content}
          mode='widthFix'
          onClick={() => Taro.previewImage({ urls: [message.content] })}
        />
      );
    } else if (message.type === 'file') {
      return (
        <View
          className='message-content-file-wrapper'
          onClick={() => handleOpenFile(message.content, message.fileName)}
        >
          <View className='message-content-file'>
            <Text className='file-icon'>📄</Text>
            <View className='file-info'>
              <Text className='file-name'>{message.fileName || '文件'}</Text>
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

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    try {
      const res = await sendMessage({
        sessionId: Number(sessionId),
        content: inputValue,
        type: 'text'
      });

      if (res.statusCode === 200 && res.data.code === 200) {
        // 发送成功后重新获取消息列表
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
  };

  const toggleEmojiPanel = () => {
    const nextState = !showEmoji;
    setShowEmoji(nextState);
    if (nextState) {
      setShowExtraPanel(false);
    }
  };

  const handleUploadImage = () => {
    chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        const tempFilePath = res.tempFilePaths[0];
        console.log('选择的图片:', tempFilePath);

        const newMessage: Message = {
          id: Date.now(),
          type: 'image',
          content: tempFilePath,
          time: new Date().toLocaleTimeString('zh-CN', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
          }),
          isSelf: true,
          avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
          name: 'test'
        };

        setMessages((prev) => [...prev, newMessage]);

        setShowExtraPanel(false);
        scrollToBottom();
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

        const newMessage: Message = {
          id: Date.now(),
          type: 'file',
          content: tempFile.path,
          fileName: tempFile.name,
          fileSize: tempFile.size,
          time: new Date().toLocaleTimeString('zh-CN', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
          }),
          isSelf: true,
          avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
          name: 'test'
        };
        setMessages((prev) => [...prev, newMessage]);

        setShowExtraPanel(false);
        scrollToBottom();
      },
      fail: function (err) {
        console.error('选择文件失败:', err);
        setShowExtraPanel(false);
      }
    });
  };

  const handleOpenFile = (filePath: string, fileName?: string) => {
    console.log('尝试打开文件:', filePath);
    Taro.showLoading({ title: '正在打开文件...' });
    Taro.openDocument({
      filePath: filePath,
      showMenu: true,
      success: function (res) {
        console.log('打开文档成功', res);
        Taro.hideLoading();
      },
      fail: function (err) {
        console.error('打开文档失败', err);
        Taro.hideLoading();
        Taro.showToast({
          title: `无法预览该文件类型${fileName ? ` (${fileName})` : ''}`,
          icon: 'none',
          duration: 2000
        });
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
    <View className='page-container chatroom-container'>
      <NavigationBar
        title={decodeURIComponent(name || '聊天')}
        showBack
      />

      <ScrollView
        className='message-list'
        scrollY
        scrollWithAnimation
        scrollTop={scrollTop}
      >
        {loading ? (
          <View className='loading'>加载中...</View>
        ) : messages.length > 0 ? (
          messages.map((msg) => (
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
                      msg.type !== 'text' ? 'media' : ''
                    }`}
                  >
                    <View className='text'>{renderMessageContent(msg)}</View>
                  </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className='empty'>
            <Image
              className='empty-image'
              src='https://img20.360buyimg.com/openfeedback/jfs/t1/280339/9/23161/10217/6804adb8F8b2ec7b8/15b1e330f8422ec3.png'
              mode='aspectFit'
            />
            <View className='empty-text'>暂无消息记录</View>
          </View>
        )}
        <View style={{ height: '1px' }} />
      </ScrollView>

      <View className='input-area'>
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

        {showEmoji && (
          <View className='emoji-panel'>
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
          <View className='extra-panel'>
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
            <View className='extra-panel-item' onClick={handleLeaveGroup}>
              <View className='extra-panel-icon-wrapper'>
                <Image
                  className='extra-panel-icon'
                  src={require('@/static/icon/leave.png')}
                />
              </View>
              <Text className='extra-panel-text'>退出群聊</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default ChatRoom;
