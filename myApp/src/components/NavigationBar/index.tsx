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
  backIconColor?: string;
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
    backIconColor = '#fff',
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
  }, [opacity, navBar.height, containerStyle, useOpacity]);

  const onBack = () => {
    if (beforeBack) {
      const result = beforeBack();
      if (result === false) return;
    }

    try {
      const pages = getCurrentPages() || [];
      console.log('pages', pages);
      if (pages.length >= 2) {
        // 获取当前页面在栈中的位置
        const currentPage = pages[pages.length - 1];
        const prevPage = pages[pages.length - 2];

        // 如果前一个页面是首页，直接切换到首页
        if (prevPage.route === 'pages/index/index') {
          switchTab({ url: '/pages/index/index' });
        } else {
          navigateBack();
        }
      } else {
        switchTab({ url: '/pages/index/index' });
      }
    } catch (error) {
      switchTab({ url: '/pages/index/index' });
    }
  };

  return (
    <View
      className={C('navigation-bar-container', containerClassName)}
      style={{ height: navigationBarContainerStyle.height }}
    >
      <View
        className={C('navigation-bar', className)}
        style={{
          padding: `${navBar.py}px ${navBar.px}px`,
          paddingTop: `${navBar.py + navBar.top}px`,
          opacity: navigationBarContainerStyle.opacity,
          ...style
        }}
      >
        <View style={{ flex: 1 }}>
          {!children && title && (
            <View className='navigation-bar-text'>
              <Text>{title}</Text>
            </View>
          )}
          {children}
        </View>
      </View>
      <View
        onClick={onBack}
        className='navigation-bar-back'
        style={{
          top: `${navBar.top}px`,
          left: `${2 * navBar.px}px`
        }}
      >
        {showBack && <ArrowLeft color={backIconColor} size={20} />}
      </View>
    </View>
  );
};

export default NavigationBar;
