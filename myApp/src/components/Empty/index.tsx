import { switchTab } from '@tarojs/taro';

import { Empty, Image, Button } from '@nutui/nutui-react-taro';

import './index.less';

interface MyEmptyProps {
  type?: 'error' | 'empty' | 'search';
  title: string;
  showButton?: boolean;
  buttonText?: string;
  style?: React.CSSProperties;
  buttonClickHandler?: () => void;
}

const imageMap = {
  error:
    'https://img20.360buyimg.com/openfeedback/jfs/t1/280339/9/23161/10217/6804adb8F8b2ec7b8/15b1e330f8422ec3.png',
  empty:
    'https://img20.360buyimg.com/openfeedback/jfs/t1/270913/35/24971/13502/6804aeb9Fb9ccc229/a3f4bab2580b3b45.png',
  search:
    'https://img20.360buyimg.com/openfeedback/jfs/t1/240503/26/34721/13691/6804aec8F991736fc/703a8688c1825817.png'
};

export const MyEmpty = ({
  type = 'empty',
  title,
  style,
  showButton = false,
  buttonText = '去看看',
  buttonClickHandler
}: MyEmptyProps) => {
  const handleButtonClick = () => {
    switchTab({
      url: '/pages/index/index'
    });
  };

  return (
    <Empty
      title={title}
      className='empty-container'
      imageSize={240}
      style={style}
      image={
        <Image
          style={{
            width: '100%',
            height: '100%'
          }}
          className='empty-image'
          src={imageMap[type]}
        />
      }
      description={
        showButton ? (
          <Button
            type='primary'
            size='small'
            onClick={
              buttonClickHandler ? buttonClickHandler : handleButtonClick
            }
            className='empty-button'
          >
            {buttonText}
          </Button>
        ) : null
      }
    />
  );
};
