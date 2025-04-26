'use client';

import React, { useEffect, useState } from 'react';
import { GiSwordfish, GiFishEscape, GiJellyfish, GiBubbles, GiCrab } from 'react-icons/gi';
import { FaFish } from 'react-icons/fa';

interface MarineElement {
  id: number;
  type: 'fish1' | 'fish2' | 'jellyfish' | 'bubbles' | 'crab';
  x: number;
  y: number;
  size: number;
  speed: number;
  direction: 'left' | 'right';
}

export default function OceanBackground() {
  const [elements, setElements] = useState<MarineElement[]>([]);
  
  useEffect(() => {
    // 创建随机海洋元素
    const createMarineElements = () => {
      const types: ('fish1' | 'fish2' | 'jellyfish' | 'bubbles' | 'crab')[] = ['fish1', 'fish2', 'jellyfish', 'bubbles', 'crab'];
      const newElements: MarineElement[] = [];
      
      // 创建20个元素
      for (let i = 0; i < 20; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const direction = Math.random() > 0.5 ? 'left' : 'right';
        
        newElements.push({
          id: i,
          type,
          x: Math.random() * 100, // 随机位置 (0-100%)
          y: Math.random() * 100,
          size: Math.random() * 1.5 + 0.5, // 随机大小 (0.5-2)
          speed: Math.random() * 2 + 1, // 随机速度 (1-3)
          direction
        });
      }
      
      setElements(newElements);
    };
    
    createMarineElements();
    
    // 动画更新逻辑
    const animationInterval = setInterval(() => {
      setElements(prevElements => 
        prevElements.map(element => {
          let newX = element.direction === 'right' 
            ? element.x + element.speed * 0.1 
            : element.x - element.speed * 0.1;
          
          // 当元素超出屏幕时，从另一侧重新出现
          if (newX > 110) newX = -10;
          if (newX < -10) newX = 110;
          
          // 稍微调整Y位置，使其轻微上下浮动
          let newY = element.y + (Math.sin(Date.now() / 1000) * 0.2);
          
          return { ...element, x: newX, y: newY };
        })
      );
    }, 50);
    
    return () => clearInterval(animationInterval);
  }, []);
  
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden z-[-1] bg-gradient-to-b from-sky-100 to-blue-200">
      {/* 海洋元素 */}
      {elements.map((element) => (
        <div 
          key={element.id}
          style={{
            position: 'absolute',
            left: `${element.x}%`,
            top: `${element.y}%`,
            transform: `scale(${element.size}) ${element.direction === 'left' ? 'scaleX(-1)' : ''}`,
            transition: 'left 0.05s linear, top 0.05s ease-in-out',
            opacity: 0.6,
            color: getElementColor(element.type),
            zIndex: -1
          }}
        >
          {renderElement(element.type)}
        </div>
      ))}
      
      {/* 水波纹效果 */}
      <div className="absolute inset-0 bg-[url('/wave.svg')] bg-repeat-x bg-bottom opacity-20 animate-wave"></div>
      <div className="absolute inset-0 bg-[url('/wave.svg')] bg-repeat-x bg-bottom opacity-20 animate-wave-delayed bg-[length:50%_50px]"></div>
    </div>
  );
}

// 根据元素类型返回颜色
function getElementColor(type: string): string {
  switch (type) {
    case 'fish1': return 'rgb(0, 127, 255)'; // 蓝色鱼
    case 'fish2': return 'rgb(255, 153, 0)'; // 橙色鱼
    case 'jellyfish': return 'rgb(221, 160, 221)'; // 粉色水母
    case 'bubbles': return 'rgb(173, 216, 230)'; // 淡蓝色泡泡
    case 'crab': return 'rgb(255, 64, 64)'; // 红色螃蟹
    default: return 'rgb(0, 127, 255)';
  }
}

// 根据元素类型渲染对应图标
function renderElement(type: string) {
  switch (type) {
    case 'fish1': return <GiSwordfish size={24} />;
    case 'fish2': return <FaFish size={20} />;
    case 'jellyfish': return <GiJellyfish size={28} />;
    case 'bubbles': return <GiBubbles size={18} />;
    case 'crab': return <GiCrab size={22} />;
    default: return <GiFishEscape size={24} />;
  }
} 