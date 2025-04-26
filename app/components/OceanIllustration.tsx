'use client';

import { useEffect, useRef, useState } from 'react';

export default function OceanIllustration() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  
  // 调整画布大小以适应容器
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const { width, height } = canvasRef.current.parentElement.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    
    // 初始化
    handleResize();
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 绘制插画
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 设置画布尺寸
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    // 要绘制的元素
    const elements = {
      coral: [],
      fish: [],
      bubbles: [],
      waves: [],
      seaweed: []
    };
    
    // 生成随机数
    const random = (min: number, max: number) => Math.random() * (max - min) + min;
    
    // 创建珊瑚
    for (let i = 0; i < 12; i++) {
      elements.coral.push({
        x: random(0, dimensions.width),
        y: dimensions.height - random(20, 100),
        size: random(30, 80),
        color: `hsl(${random(0, 60)}, ${random(70, 100)}%, ${random(40, 70)}%)`
      });
    }
    
    // 创建海草
    for (let i = 0; i < 25; i++) {
      elements.seaweed.push({
        x: random(0, dimensions.width),
        y: dimensions.height,
        height: random(50, 150),
        width: random(5, 15),
        segments: Math.floor(random(3, 7)),
        color: `hsl(${random(100, 160)}, ${random(40, 90)}%, ${random(20, 40)}%)`,
        bend: random(-0.3, 0.3)
      });
    }
    
    // 创建鱼
    for (let i = 0; i < 20; i++) {
      elements.fish.push({
        x: random(0, dimensions.width),
        y: random(50, dimensions.height - 100),
        size: random(10, 30),
        speed: random(0.5, 2),
        color: `hsl(${random(170, 250)}, ${random(70, 100)}%, ${random(50, 80)}%)`,
        direction: Math.random() > 0.5 ? 1 : -1,
        offset: random(0, 1000)
      });
    }
    
    // 创建气泡
    for (let i = 0; i < 40; i++) {
      elements.bubbles.push({
        x: random(0, dimensions.width),
        y: random(0, dimensions.height),
        size: random(2, 8),
        speed: random(0.5, 2),
        opacity: random(0.3, 0.7)
      });
    }
    
    // 创建波浪线
    for (let i = 0; i < 5; i++) {
      elements.waves.push({
        y: random(50, dimensions.height - 150),
        amplitude: random(5, 15),
        frequency: random(0.005, 0.02),
        speed: random(0.001, 0.003),
        color: `rgba(255, 255, 255, ${random(0.05, 0.2)})`
      });
    }
    
    // 动画循环
    let frameId: number;
    const animate = (time: number) => {
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 绘制渐变背景
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1a4b8c');
      gradient.addColorStop(1, '#092d5c');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 绘制光线效果
      for (let i = 0; i < 5; i++) {
        const x = canvas.width * (i + 0.5) / 5;
        const width = random(30, 80);
        
        ctx.save();
        ctx.globalAlpha = 0.05 + Math.sin(time * 0.001 + i) * 0.03;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + width, canvas.height);
        ctx.lineTo(x - width, canvas.height);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
        ctx.restore();
      }
      
      // 绘制波浪线
      elements.waves.forEach(wave => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 2;
        
        for (let x = 0; x < canvas.width; x += 5) {
          const y = wave.y + Math.sin((x * wave.frequency) + (time * wave.speed)) * wave.amplitude;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
      });
      
      // 绘制海草
      elements.seaweed.forEach(seaweed => {
        const segments = seaweed.segments;
        const segmentHeight = seaweed.height / segments;
        
        ctx.save();
        ctx.translate(seaweed.x, seaweed.y);
        
        for (let i = 0; i < segments; i++) {
          const bendAmount = seaweed.bend * Math.sin(time * 0.001 + i * 0.5);
          ctx.translate(bendAmount * (10 + i * 2), -segmentHeight);
          
          ctx.beginPath();
          ctx.fillStyle = seaweed.color;
          
          if (i === segments - 1) {
            // 顶部分段 - 圆形
            ctx.arc(0, 0, seaweed.width / 2, 0, Math.PI * 2);
          } else {
            // 中间分段 - 矩形
            ctx.rect(-seaweed.width / 2, 0, seaweed.width, -segmentHeight);
          }
          
          ctx.fill();
        }
        
        ctx.restore();
      });
      
      // 绘制珊瑚
      elements.coral.forEach(coral => {
        // 珊瑚底部
        ctx.beginPath();
        ctx.fillStyle = coral.color;
        ctx.moveTo(coral.x - coral.size / 2, coral.y);
        ctx.lineTo(coral.x + coral.size / 2, coral.y);
        ctx.lineTo(coral.x, coral.y - coral.size);
        ctx.closePath();
        ctx.fill();
        
        // 珊瑚高光
        ctx.beginPath();
        ctx.fillStyle = `hsla(${parseInt(coral.color.slice(4)) + 20}, 100%, 80%, 0.3)`;
        ctx.moveTo(coral.x - coral.size / 4, coral.y);
        ctx.lineTo(coral.x + coral.size / 8, coral.y);
        ctx.lineTo(coral.x - coral.size / 10, coral.y - coral.size * 0.7);
        ctx.closePath();
        ctx.fill();
      });
      
      // 绘制鱼
      elements.fish.forEach(fish => {
        // 更新位置
        fish.x += fish.speed * fish.direction;
        fish.y += Math.sin((time + fish.offset) * 0.002) * 0.5;
        
        // 边界检查
        if (fish.x > canvas.width + fish.size) {
          fish.x = -fish.size;
        } else if (fish.x < -fish.size) {
          fish.x = canvas.width + fish.size;
        }
        
        ctx.save();
        ctx.translate(fish.x, fish.y);
        ctx.scale(fish.direction, 1);
        
        // 鱼身
        ctx.beginPath();
        ctx.fillStyle = fish.color;
        ctx.ellipse(0, 0, fish.size, fish.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 鱼尾
        ctx.beginPath();
        ctx.fillStyle = fish.color;
        ctx.moveTo(-fish.size * 0.8, 0);
        const tailOffset = Math.sin(time * 0.01 + fish.offset) * 4;
        ctx.lineTo(-fish.size * 1.5, -fish.size / 3 + tailOffset / 2);
        ctx.lineTo(-fish.size * 1.5, fish.size / 3 + tailOffset / 2);
        ctx.closePath();
        ctx.fill();
        
        // 鱼眼
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.arc(fish.size / 2, -fish.size / 8, fish.size / 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.arc(fish.size / 2, -fish.size / 8, fish.size / 10, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });
      
      // 绘制气泡
      elements.bubbles.forEach((bubble, index) => {
        // 更新位置
        bubble.y -= bubble.speed;
        
        // 重置超出边界的气泡
        if (bubble.y < -bubble.size) {
          bubble.y = canvas.height + bubble.size;
          bubble.x = random(0, canvas.width);
        }
        
        // 绘制气泡
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity})`;
        ctx.fill();
        
        // 气泡高光
        ctx.beginPath();
        ctx.arc(bubble.x - bubble.size / 3, bubble.y - bubble.size / 3, bubble.size / 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity + 0.2})`;
        ctx.fill();
      });
      
      // 继续动画循环
      frameId = requestAnimationFrame(animate);
    };
    
    // 启动动画
    frameId = requestAnimationFrame(animate);
    
    // 清理函数
    return () => cancelAnimationFrame(frameId);
  }, [dimensions]);
  
  return (
    <div className="w-full h-full">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full rounded-lg"
      />
    </div>
  );
} 