'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './OceanBackground.module.css';

interface AnimatedElement {
  id: number;
  type: 'fish' | 'bubble' | 'crab' | 'shrimp';
  x: number;
  y: number;
  size: number;
  speed: number;
  direction: number;
}

const OceanBackground = () => {
  const [elements, setElements] = useState<AnimatedElement[]>([]);

  useEffect(() => {
    // Create initial elements
    const initialElements: AnimatedElement[] = [];
    
    // Add fish
    for (let i = 0; i < 8; i++) {
      initialElements.push({
        id: i,
        type: 'fish',
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 10 + Math.random() * 15,
        speed: 0.5 + Math.random() * 1,
        direction: Math.random() > 0.5 ? 1 : -1,
      });
    }
    
    // Add bubbles
    for (let i = 0; i < 15; i++) {
      initialElements.push({
        id: i + 8,
        type: 'bubble',
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 5 + Math.random() * 10,
        speed: 0.2 + Math.random() * 0.5,
        direction: -1, // Bubbles always move up
      });
    }
    
    // Add crabs
    for (let i = 0; i < 3; i++) {
      initialElements.push({
        id: i + 23,
        type: 'crab',
        x: Math.random() * 100,
        y: 90 + Math.random() * 10, // Keep crabs near the bottom
        size: 15 + Math.random() * 10,
        speed: 0.2 + Math.random() * 0.3,
        direction: Math.random() > 0.5 ? 1 : -1,
      });
    }
    
    // Add shrimps
    for (let i = 0; i < 5; i++) {
      initialElements.push({
        id: i + 26,
        type: 'shrimp',
        x: Math.random() * 100,
        y: 30 + Math.random() * 60,
        size: 8 + Math.random() * 8,
        speed: 0.4 + Math.random() * 0.6,
        direction: Math.random() > 0.5 ? 1 : -1,
      });
    }
    
    setElements(initialElements);
    
    // Animation frame for movement
    let animationFrameId: number;
    let lastTime = 0;
    
    const animate = (time: number) => {
      if (!lastTime) lastTime = time;
      const deltaTime = time - lastTime;
      lastTime = time;
      
      setElements(prevElements => 
        prevElements.map(el => {
          let newX = el.x + (el.speed * el.direction * deltaTime * 0.01);
          let newY = el.y;
          
          // Vertical movement for bubbles and slight vertical movement for others
          if (el.type === 'bubble') {
            newY = el.y - (el.speed * 1.5 * deltaTime * 0.01);
          } else {
            // Add slight vertical movement to other elements
            newY = el.y + (Math.sin(time * 0.001 + el.id) * 0.02);
          }
          
          // Reset positions when out of bounds
          if (newX > 110) newX = -10;
          if (newX < -10) newX = 110;
          if (newY < -10) newY = 110;
          if (newY > 110) newY = -10;
          
          return { ...el, x: newX, y: newY };
        })
      );
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <div className={styles.oceanBackground}>
        {elements.map((el) => (
          <div 
            key={el.id}
            className={`${styles.element} ${styles[el.type]}`}
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              width: `${el.size}px`,
              height: `${el.size}px`,
              transform: `scaleX(${el.direction})`,
            }}
          >
            {el.type === 'bubble' ? (
              <div className={styles.bubbleInner} />
            ) : el.type === 'crab' ? (
              <Image src="/crab-icon.svg" alt="Crab" width={el.size} height={el.size} />
            ) : el.type === 'fish' ? (
              <div className={styles.fishShape} />
            ) : (
              <Image src="/shrimp-icon.svg" alt="Shrimp" width={el.size} height={el.size} />
            )}
          </div>
        ))}
        
        {/* 底部波浪效果 */}
        <div className="absolute bottom-0 left-0 w-full h-16 bg-[url('/wave.svg')] bg-repeat-x bg-bottom opacity-20 animate-wave"></div>
        <div className="absolute bottom-0 left-0 w-full h-12 bg-[url('/wave.svg')] bg-repeat-x bg-bottom opacity-20 animate-wave-delayed bg-[length:50%_50px]"></div>
      </div>
      
      {/* 添加一个半透明覆盖层以增强内容对比度 */}
      <div className="fixed inset-0 bg-white/40 z-[-1] pointer-events-none"></div>
    </>
  );
};

export default OceanBackground; 