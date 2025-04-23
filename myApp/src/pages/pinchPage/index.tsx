import { View, Image, Button } from '@tarojs/components';
import Taro, {
  useRouter,
  chooseImage,
  uploadFile,
  getCurrentInstance,
  navigateBack,
} from '@tarojs/taro';

import { useState, useEffect } from 'react';

import NavigationBar from '@/components/NavigationBar';
import './index.less';

const PinchPage = () => {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string>('');
  // 新增：存储从路由参数获取的事件类型
  const [eventType, setEventType] = useState<string>('updateBgImage'); // 默认是更新背景

  useEffect(() => {
    if (router.params.imageUrl) {
      setImageUrl(decodeURIComponent(router.params.imageUrl));
    }
    if (router.params.eventType) {
      setEventType(decodeURIComponent(router.params.eventType));
    }
  }, [router.params]);

  const handleChangeImage = () => {
    chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        const tempFilePath = res.tempFilePaths[0];
        console.log('选择的图片:', tempFilePath);

        // --- 图片上传逻辑示例 ---
        // 假设上传成功，获取到 newUploadedUrl
        const newUploadedUrl = tempFilePath; // 替换为实际上传后的 URL
        // uploadFile({ ..., success: (uploadRes) => { newUploadedUrl = ... } })
        // --- 图片上传逻辑结束 ---

        const instance = getCurrentInstance();
        const eventChannel = instance.page?.getOpenerEventChannel();

        if (eventChannel) {
          console.log(
            `PinchPage emitting event '${eventType}' with url:`,
            newUploadedUrl
          );
          // 使用从路由参数获取的 eventType 来发送事件
          eventChannel.emit(eventType, { newImageUrl: newUploadedUrl });

          // 更新当前页面的预览（可选）
          setImageUrl(newUploadedUrl);

          Taro.showToast({
            title: '更换成功',
            icon: 'success',
            duration: 1500
          });
          setTimeout(() => {
            navigateBack();
          }, 1500);
        } else {
          console.error('Failed to get event channel.');
          Taro.showToast({ title: '更新失败，请重试', icon: 'none' });
        }
      },
      fail: function (err) {
        console.log('选择图片失败:', err);
        Taro.showToast({ title: '选择图片失败', icon: 'none' });
      }
    });
  };

  return (
    <View className='pinch-page'>
      <NavigationBar title='查看图片' showBack useOpacity />
      {imageUrl && (
        <Image className='pinch-image' src={imageUrl} mode='aspectFit' />
      )}
      <View className='button-container'>
        <Button
          className='change-button'
          type='primary'
          onClick={handleChangeImage}
        >
          更换图片
        </Button>
      </View>
    </View>
  );
};

export default PinchPage;
