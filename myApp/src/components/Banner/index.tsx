import { Swiper, SwiperItem } from '@tarojs/components';

import React from 'react';

import BgImg from '../../static/img/bg.png';

const Banner = () => {
  return (
    <Swiper style={{ height: '220px' }} autoplay>
      {[1, 2].map((_, index) => (
        <SwiperItem key={index}>
          <img
            width='100vw'
            height='100%'
            onClick={() => console.log(index)}
            src={BgImg}
            alt=''
          />
        </SwiperItem>
      ))}
    </Swiper>
  );
};

export default Banner;
