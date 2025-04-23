import { Image } from '@tarojs/components';

import React, { CSSProperties } from 'react';

interface IProps {
  src: string;
  style?: CSSProperties
}

const ImageWrapper = ({ src, style }: IProps) => <Image src={src} style={style} />;

export default ImageWrapper;
