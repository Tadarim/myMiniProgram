import {
  Popup,
  Cell,
  Button,
  TextArea,
  Uploader,
  UploaderFileItem
} from '@nutui/nutui-react-taro';
import { useState } from 'react';

export const PopupRender = ({ visible, onPublish, onClose }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<UploaderFileItem[]>([]);

  return (
    <Popup
      closeable
      visible={visible}
      title='发布帖子'
      description={
        <>
          <Cell
            title='内容'
            description={
              <TextArea
                placeholder='请输入帖子内容'
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
                // upload={(file: File) => upload(file)}
                maxCount={1}
              />
            }
          />

          <Button
            block
            type='primary'
            disabled={!content}
            style={{ width: '100%' }}
            onClick={() => {
              onPublish({
                content,
                image
              });
              setTimeout(() => onClose(), 100);
            }}
          >
            发布
          </Button>
        </>
      }
      position='bottom'
    ></Popup>
  );
};
