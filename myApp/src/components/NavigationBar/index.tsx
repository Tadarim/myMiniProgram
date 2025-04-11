import { View, Text, Button } from '@tarojs/components';
import {
  usePageScroll,
  PageScrollObject,
  navigateBack,
  switchTab,
  getCurrentPages,
  useLaunch
} from '@tarojs/taro';

import { ArrowLeft } from '@nutui/icons-react-taro';
import C from 'classnames';
import { throttle } from 'lodash';
import { CSSProperties, FC, PropsWithChildren, useMemo, useState } from 'react';

import { useNavigationBar } from '@/hooks/useNavigationBar';

import './index.less';

interface NavigationBarProps {
  containerClassName?: string;
  containerStyle?: CSSProperties;
  className?: string;
  style?: CSSProperties;
  useOpacity?: boolean;
  showBack?: boolean;
  beforeBack?: () => boolean | void;
  title?: string;
}

const NavigationBar: FC<PropsWithChildren<NavigationBarProps>> = (props) => {
  const {
    children,
    containerClassName,
    containerStyle,
    className,
    style,
    showBack = true,
    useOpacity = false,
    beforeBack,
    title = ''
  } = props;

  const { navigateBarInfo, initNavigationBar } = useNavigationBar();

  useLaunch(() => initNavigationBar());

  const { navBar, menuInfo } = navigateBarInfo || { navBar: {}, menuInfo: {} };
  const [opacity, setOpacity] = useState(0);

  // 滑动时计算渐变透明度
  const scrollSetOpacity = useMemo(
    () =>
      throttle((e: PageScrollObject) => {
        let opacity = Math.min(
          1,
          Math.max(0, (e.scrollTop * 2) / (navBar.height || 44))
        );
        setOpacity(opacity);
      }, 30),
    [navBar.height]
  );

  usePageScroll(scrollSetOpacity);

  const navigationBarContainerStyle = useMemo(() => {
    return {
      height: `${navBar.height || 44}px`,
      opacity: useOpacity ? opacity : 1,
      ...containerStyle
    };
  }, [opacity, navBar.height, containerStyle]);

  const onBack = () => {
    if (beforeBack) {
      const result = beforeBack();
      if (result === false) return;
    }
    const pages = getCurrentPages();
    if (pages.length >= 2) {
      navigateBack();
    } else {
      switchTab({ url: '/pages/index/index' });
    }
  };

  return (
    <View
      className={C('navigation-bar-container', containerClassName)}
      style={navigationBarContainerStyle}
    >
      <View
        className={C('navigation-bar', className)}
        style={{
          top: `${navBar.top}px`,
          padding: `${navBar.py}px ${navBar.px}px`,
          ...style
        }}
      >
        <View
          onClick={onBack}
          style={{
            flexBasis: `${menuInfo?.width}px`
          }}
        >
          {showBack && <ArrowLeft color='#fff' size={20} />}
        </View>
        <View style={{ flex: 1 }}>
          {!children && title && (
            <View style={{ textAlign: 'center' }}>
              <Text className='navigation-bar-text'>{title}</Text>
            </View>
          )}
          {children}
        </View>
        <View
          style={{
            flexBasis: `${menuInfo?.width}px`
          }}
        ></View>
      </View>
    </View>
  );
};

export default NavigationBar;
