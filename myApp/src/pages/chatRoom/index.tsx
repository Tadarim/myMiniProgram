import { View, ScrollView, Input, Image, Text } from '@tarojs/components';
import { FC, useState, useRef, useEffect } from 'react';
import Taro, { useRouter, chooseImage, chooseMessageFile } from '@tarojs/taro'; // 引入上传 API
import NavigationBar from '@/components/NavigationBar';
import './index.less';
// 引入更多图标，例如 CirclePlus 用于新按钮，Image 和 Folder 用于面板内选项
import {
  Add,
  Minus,
  Image as ImageIcon,
  List as ListIcon,
  Order
} from '@nutui/icons-react-taro';

interface Message {
  id: number;
  type: 'text' | 'image' | 'file'; // 新增：消息类型
  content: string; // 对于图片/文件，这里可以存 URL 或本地路径
  fileName?: string; // 新增：文件类型消息的文件名
  fileSize?: number; // 新增：文件类型消息的大小
  time: string;
  isSelf: boolean;
  avatar: string;
  name: string;
}

// 扩展 EMOJI_LIST
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
  // --- 新增 Emoji 开始 ---
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
    text: '[冷汗]', // 注意：这个表情图片可能与文字不太匹配
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
  // --- 新增 Emoji 结束 ---
  // ... 可以继续添加更多 ...
];

const ChatRoom: FC = () => {
  const router = useRouter();
  const scrollRef = useRef<any>();
  const [inputValue, setInputValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  // 新增：控制附加功能面板的状态
  const [showExtraPanel, setShowExtraPanel] = useState(false);
  // 确保所有初始消息都有 type: 'text'
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'text', // 确认添加
      content: '123',
      time: '12:24',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/userA/80/80',
      name: 'BB小天使'
    },
    {
      id: 2,
      type: 'text', // !! 确认添加 !!
      content: '啊啊啊',
      time: '12:24',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/userA/80/80',
      name: 'BB小天使'
    },
    {
      id: 3,
      type: 'text', // !! 确认添加 !!
      content: '123',
      time: '13:41',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/userA/80/80',
      name: 'BB小天使'
    },
    {
      id: 4,
      type: 'text', // !! 确认添加 !!
      content: '嘿嘿',
      time: '13:55',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/userA/80/80',
      name: 'BB小天使'
    },
    {
      id: 5,
      type: 'text', // !! 确认添加 !!
      content: '爱我打我打我',
      time: '14:05',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/userA/80/80',
      name: 'BB小天使'
    },
    {
      id: 6,
      type: 'text', // !! 确认添加 !!
      content: 'aahehih13123',
      time: '14:12',
      isSelf: true,
      avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
      name: 'test'
    },
    {
      id: 7,
      type: 'text', // !! 确认添加 !!
      content: '123',
      time: '15:07',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/userA/80/80',
      name: 'BB小天使'
    },
    {
      id: 8,
      type: 'text', // 确认添加
      content: '测试测试!',
      time: '23:23',
      isSelf: false,
      avatar: 'https://picsum.photos/seed/userA/80/80',
      name: 'BB小天使'
    }
  ]);
  const [scrollTop, setScrollTop] = useState(0);

  // scrollToBottom 使用更新 scrollTop 的方式
  const scrollToBottom = () => {
    // 使用 Taro 的 API 获取节点信息可能更可靠，但 setTimeout 是一种常用技巧
    setTimeout(() => {
      // 设置一个很大的值来滚动到底部
      setScrollTop(messages.length * 200); // 估算一个足够大的值
    }, 100); // 延迟确保 DOM 更新
  };

  // 初始加载和新消息时滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // handleEmojiClick 逻辑保持不变
  const handleEmojiClick = (emoji) => {
    setInputValue((prev) => prev + emoji.text);
    // 点击表情后通常关闭附加面板
    setShowExtraPanel(false);
  };

  // 修改：renderMessageContent 接收整个 Message 对象并处理不同类型
  const renderMessageContent = (message: Message) => {
    if (message.type === 'image') {
      // 图片消息
      return (
        <Image
          className='message-content-image'
          src={message.content} // content 是图片路径
          mode='widthFix'
          // 增加图片预览功能
          onClick={() => Taro.previewImage({ urls: [message.content] })}
        />
      );
    } else if (message.type === 'file') {
      // 文件消息
      // !! 修改：在外层添加 View 并绑定 onClick 事件 !!
      return (
        <View
          className='message-content-file-wrapper' // 可以添加一个包装类名（可选）
          onClick={() => handleOpenFile(message.content, message.fileName)} // 调用新函数
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
      // 文本消息 (type === 'text')
      let keyCounter = 0;
      // !! 关键：从 message.content 获取文本字符串再调用 split !!
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

  // 新增：格式化文件大小的辅助函数 (如果之前没有添加的话)
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    // 确保 bytes 大于 0 避免 log(0)
    const i = bytes > 0 ? Math.floor(Math.log(bytes) / Math.log(k)) : 0;
    // 确保 i 在 sizes 数组范围内
    const index = Math.min(i, sizes.length - 1);
    return (
      parseFloat((bytes / Math.pow(k, index)).toFixed(2)) + ' ' + sizes[index]
    );
  };

  // handleSend 中自己的头像和名字需要对应修改
  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMessage: Message = {
      id: Date.now(),
      type: 'text', // 明确类型为文本
      content: inputValue,
      time: new Date().toLocaleTimeString('zh-CN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }),
      isSelf: true,
      // avatar: 'https://picsum.photos/seed/myUser/80/80', // 自己的 picsum 头像
      avatar: 'https://avatars.githubusercontent.com/u/1?v=4', // 或者使用 GitHub 默认头像
      name: 'test' // 自己的昵称
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    setShowEmoji(false);
    setShowExtraPanel(false); // 确保关闭附加面板
    scrollToBottom();
  };

  // 新增：切换附加功能面板的函数
  const toggleExtraPanel = () => {
    const nextState = !showExtraPanel;
    setShowExtraPanel(nextState);
    // 打开附加面板时，关闭表情面板
    if (nextState) {
      setShowEmoji(false);
    }
  };

  // 新增：切换表情面板的函数 (确保互斥)
  const toggleEmojiPanel = () => {
    const nextState = !showEmoji;
    setShowEmoji(nextState);
    // 打开表情面板时，关闭附加面板
    if (nextState) {
      setShowExtraPanel(false);
    }
  };

  // 修改：处理图片上传的函数，添加创建消息和更新状态的逻辑
  const handleUploadImage = () => {
    chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        const tempFilePath = res.tempFilePaths[0]; // 获取选择的图片路径
        console.log('选择的图片:', tempFilePath);

        // --- 开始：添加创建消息和更新状态的逻辑 ---
        // 1. 创建图片消息对象
        const newMessage: Message = {
          id: Date.now(),
          type: 'image', // 类型为图片
          content: tempFilePath, // 使用本地临时路径 (实际应为上传后的 URL)
          time: new Date().toLocaleTimeString('zh-CN', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
          }),
          isSelf: true, // 假设是自己发送
          avatar: 'https://avatars.githubusercontent.com/u/1?v=4', // 自己的头像
          name: 'test' // 自己的昵称
        };

        // 2. 更新消息列表状态
        setMessages((prev) => [...prev, newMessage]);
        // --- 结束：添加创建消息和更新状态的逻辑 ---

        setShowExtraPanel(false); // 关闭面板
        scrollToBottom(); // 发送后滚动到底部
      },
      fail: function (err) {
        console.error('选择图片失败:', err);
        setShowExtraPanel(false); // 关闭面板
      }
    });
  };

  // 处理文件上传的函数 (确保也有类似逻辑)
  const handleUploadFile = () => {
    chooseMessageFile({
      count: 1,
      type: 'all',
      success: function (res) {
        const tempFile = res.tempFiles[0];
        console.log('选择的文件:', tempFile);

        // --- 开始：添加创建消息和更新状态的逻辑 ---
        const newMessage: Message = {
          id: Date.now(),
          type: 'file', // 类型为文件
          content: tempFile.path, // 使用本地临时路径
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
        // --- 结束：添加创建消息和更新状态的逻辑 ---

        setShowExtraPanel(false);
        scrollToBottom();
      },
      fail: function (err) {
        console.error('选择文件失败:', err);
        setShowExtraPanel(false);
      }
    });
  };

  // 新增：处理文件消息点击事件的函数
  const handleOpenFile = (filePath: string, fileName?: string) => {
    console.log('尝试打开文件:', filePath);
    Taro.showLoading({ title: '正在打开文件...' }); // 显示加载提示
    Taro.openDocument({
      filePath: filePath,
      showMenu: true, // 在微信小程序中，右上角会显示菜单按钮，可以进行转发等操作
      success: function (res) {
        console.log('打开文档成功', res);
        Taro.hideLoading(); // 隐藏加载提示
      },
      fail: function (err) {
        console.error('打开文档失败', err);
        Taro.hideLoading(); // 隐藏加载提示
        Taro.showToast({
          title: `无法预览该文件类型${fileName ? ` (${fileName})` : ''}`,
          icon: 'none',
          duration: 2000
        });
      }
    });
  };

  // 修改：处理退出群聊的函数
  const handleLeaveGroup = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出该群聊吗？',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定，执行退出群聊逻辑');
          // 在这里可以添加调用后端 API 退出群聊的代码

          // 从路由参数中获取当前聊天 ID
          const currentChatId = parseInt(router.params.id || '0', 10);
          if (currentChatId) {
            Taro.setStorageSync('deletedChatId', currentChatId);
            console.log(
              `ChatRoom: Marked chat ID ${currentChatId} for deletion.`
            );
          }

          // 退出成功后，返回上一页
          Taro.navigateBack();
          // 注意：不再需要触发 eventCenter 事件
          // Taro.eventCenter.trigger('refreshChatList');
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
        title={decodeURIComponent(router.params.name || '数据库系统原理交流群')} // 使用截图标题
        // 添加截图右上角的图标按钮
      />

      {/* 消息列表区域 */}
      <ScrollView
        className='message-list'
        scrollY
        scrollWithAnimation
        scrollTop={scrollTop}
      >
        {messages.map((msg, index) => {
          // 判断是否需要显示时间 (例如，与上一条消息间隔超过5分钟)
          // let showTime = false;
          // if (index === 0 || (new Date(msg.time) - new Date(messages[index - 1].time) > 5 * 60 * 1000)) {
          //   showTime = true;
          // }
          // 简化处理：暂时为每条消息都显示时间信息（虽然截图不是这样）
          // 截图的时间显示在昵称旁边或单独一行，这里先放在昵称旁边
          return (
            <View
              key={msg.id}
              className={`message-item-wrapper ${
                msg.isSelf ? 'self' : 'other'
              }`}
            >
              {/* 截图中的时间显示在昵称旁边，这里先简化处理 */}
              {/* {showTime && <View className='message-time'>{msg.time}</View>} */}

              <View className='message-item'>
                <Image className='avatar' src={msg.avatar} />
                <View className='message-content-area'>
                  {/* 昵称和时间行 */}
                  <View className='sender-info'>
                    {/* 对方消息显示昵称 */}
                    {!msg.isSelf && <Text className='name'>{msg.name}</Text>}
                    {/* 自己的消息显示昵称 */}
                    {msg.isSelf && (
                      <Text className='name self-name'>{msg.name}</Text>
                    )}
                    <Text className='time'>{msg.time}</Text>
                  </View>
                  {/* 消息气泡 */}
                  {/* !! 修改：添加 media 类名判断 !! */}
                  <View
                    className={`message-bubble ${
                      msg.type !== 'text' ? 'media' : ''
                    }`}
                  >
                    {/* !! 修改：传入整个 msg 对象 !! */}
                    <View className='text'>
                      {/* 确认这里传入的是 msg 对象 */}
                      {renderMessageContent(msg)}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
        <View style={{ height: '1px' }} />
      </ScrollView>

      {/* 输入区域 */}
      <View className='input-area'>
        <View className='input-controls'>
          {/* 修改：emoji 按钮点击事件 */}
          <View className='emoji-btn' onClick={toggleEmojiPanel}>
            {/* 保留 Add/Minus 或也替换为图片 */}
            {!showEmoji ? <Add /> : <Minus size={14} />}
            {/* 示例：如果也想替换 Add 图标
            <Image
              className='input-control-icon' // 添加一个通用类名控制大小
              src={!showEmoji ? '/static/images/icon-emoji-add.png' : '/static/images/icon-keyboard.png'} // 请替换为你的图片路径
              mode='aspectFit'
            />
            */}
          </View>
          <Input
            className='message-input'
            value={inputValue}
            onInput={(e) => setInputValue(e.detail.value)}
            placeholder='来吹吹水吧~'
            confirmType='send'
            onConfirm={handleSend}
            // 修改：输入框聚焦时关闭所有面板
            onFocus={() => {
              setShowEmoji(false);
              setShowExtraPanel(false);
            }}
            adjustPosition={false}
            cursorSpacing={10}
          />
          {/* 新增：附加功能按钮 */}
          {!inputValue.trim() && ( // 通常在输入框为空时显示 "+" 按钮
            <View className='extra-btn' onClick={toggleExtraPanel}>
              <ListIcon size={20} />
            </View>
          )}
          {/* 发送按钮 */}
          {inputValue.trim() ? (
            <View className='send-button active' onClick={handleSend}>
              发送
            </View>
          ) : (
            !showExtraPanel && <View className='send-button'>发送</View>
          )}
        </View>

        {/* Emoji 面板 */}
        {showEmoji && (
          <View className='emoji-panel'>
            {EMOJI_LIST.map(
              (
                emoji // 关键：需要遍历 EMOJI_LIST
              ) => (
                <View
                  key={emoji.text}
                  className='emoji-item'
                  onClick={() => handleEmojiClick(emoji)} // 关键：绑定点击事件
                >
                  <Image
                    className='emoji-img' // 关键：应用样式类名
                    src={emoji.url} // 关键：设置图片源
                    mode='aspectFit'
                  />
                </View>
              )
            )}
          </View>
        )}

        {/* 新增：附加功能面板 */}
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
            {/* !! 新增：退出群聊按钮 !! */}
            <View className='extra-panel-item' onClick={handleLeaveGroup}>
              <View className='extra-panel-icon-wrapper'>
                {/* 你可以使用一个退出图标 */}
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
