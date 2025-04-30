import { Swiper, SwiperItem } from '@tarojs/components';

const Banner = () => {
  return (
    <Swiper style={{ height: '220px' }} autoplay>
      {[1, 2].map((_, index) => (
        <SwiperItem key={index}>
          <img
            width='100vw'
            height='100%'
            onClick={() => console.log(index)}
            src={
              'https://img20.360buyimg.com/openfeedback/jfs/t1/281369/23/13030/187922/67ec1f31Fa0add508/4a1c6df7ce3da90e.png'
            }
            alt=''
          />
        </SwiperItem>
      ))}
    </Swiper>
  );
};

export default Banner;
