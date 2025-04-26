'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// 导入 Swiper 样式
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// 定义物种数据类型
type Species = {
  id: string;
  name: string;
  description: string | null;
  images: { id: string; url: string }[];
  category: {
    id: string;
    name: string;
  };
};

type FeaturedCarouselProps = {
  species: Species[];
};

export default function FeaturedCarousel({ species }: FeaturedCarouselProps) {
  const [domLoaded, setDomLoaded] = useState(false);

  // 处理服务器端渲染问题
  useEffect(() => {
    setDomLoaded(true);
  }, []);

  if (!domLoaded) {
    return <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>;
  }

  return (
    <div className="rounded-lg overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        className="h-[400px] w-full"
      >
        {species.map((item) => (
          <SwiperSlide key={item.id}>
            <Link href={`/species/${item.id}`}>
              <div className="relative w-full h-full group">
                {item.images.length > 0 ? (
                  <Image 
                    src={item.images[0].url} 
                    alt={item.name}
                    fill
                    sizes="100vw"
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                    <p className="text-blue-500">暂无图片</p>
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <div className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded mb-2">
                    {item.category.name}
                  </div>
                  <h3 className="text-white text-xl md:text-2xl font-bold">{item.name}</h3>
                  {item.description && (
                    <p className="text-white/90 mt-2 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
} 