'use client';

import { useEffect, useRef, useState } from 'react';

interface Fish {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  direction: number;
}

interface PlayerFish {
  x: number;
  y: number;
  size: number;
  rotation: number;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const FISH_COLORS = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#073B4C'];

export default function FishEatFishGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  // 游戏状态
  const gameStateRef = useRef({
    fishes: [] as Fish[],
    player: {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      size: 20,
      rotation: 0
    } as PlayerFish,
    mouseX: 0,
    mouseY: 0,
    animationFrameId: 0,
    lastFishSpawn: 0,
    score: 0
  });
  
  // 初始化游戏
  const initGame = () => {
    if (!canvasRef.current) return;
    
    const state = gameStateRef.current;
    state.fishes = [];
    state.player = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      size: 20,
      rotation: 0
    };
    state.score = 0;
    setScore(0);
    setGameOver(false);
    
    // 创建初始鱼群
    for (let i = 0; i < 15; i++) {
      spawnFish();
    }
  };
  
  // 创建一条新鱼
  const spawnFish = () => {
    const state = gameStateRef.current;
    const size = Math.random() * 30 + 10; // 10-40
    
    // 决定鱼从哪个边缘生成
    const edge = Math.floor(Math.random() * 4); // 0: 上, 1: 右, 2: 下, 3: 左
    let x, y;
    
    if (edge === 0) { // 上边缘
      x = Math.random() * CANVAS_WIDTH;
      y = -size;
    } else if (edge === 1) { // 右边缘
      x = CANVAS_WIDTH + size;
      y = Math.random() * CANVAS_HEIGHT;
    } else if (edge === 2) { // 下边缘
      x = Math.random() * CANVAS_WIDTH;
      y = CANVAS_HEIGHT + size;
    } else { // 左边缘
      x = -size;
      y = Math.random() * CANVAS_HEIGHT;
    }
    
    const speed = 1 + Math.random() * 2; // 鱼的速度
    const colorIndex = Math.floor(Math.random() * FISH_COLORS.length);
    
    state.fishes.push({
      x,
      y,
      size,
      speed,
      color: FISH_COLORS[colorIndex],
      direction: Math.random() * Math.PI * 2 // 随机方向 (0-2π)
    });
  };
  
  // 绘制玩家鱼
  const drawPlayerFish = (ctx: CanvasRenderingContext2D) => {
    const { x, y, size, rotation } = gameStateRef.current.player;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    
    // 鱼身
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 鱼尾
    ctx.fillStyle = '#2980b9';
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.lineTo(-size - size/2, -size/3);
    ctx.lineTo(-size - size/2, size/3);
    ctx.closePath();
    ctx.fill();
    
    // 鱼眼
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(size/2, -size/6, size/6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(size/2, -size/6, size/10, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };
  
  // 绘制NPC鱼
  const drawFish = (ctx: CanvasRenderingContext2D, fish: Fish) => {
    ctx.save();
    ctx.translate(fish.x, fish.y);
    ctx.rotate(fish.direction);
    
    // 鱼身
    ctx.fillStyle = fish.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, fish.size, fish.size / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 鱼尾
    ctx.fillStyle = adjustColor(fish.color, -20);
    ctx.beginPath();
    ctx.moveTo(-fish.size, 0);
    ctx.lineTo(-fish.size - fish.size/2, -fish.size/3);
    ctx.lineTo(-fish.size - fish.size/2, fish.size/3);
    ctx.closePath();
    ctx.fill();
    
    // 鱼眼
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(fish.size/2, -fish.size/6, fish.size/6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(fish.size/2, -fish.size/6, fish.size/10, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };
  
  // 调整颜色亮度
  const adjustColor = (color: string, amount: number) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const newR = Math.max(0, Math.min(255, r + amount));
    const newG = Math.max(0, Math.min(255, g + amount));
    const newB = Math.max(0, Math.min(255, b + amount));
    
    return `rgb(${newR}, ${newG}, ${newB})`;
  };
  
  // 游戏主循环
  const gameLoop = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const state = gameStateRef.current;
    
    // 清空画布
    ctx.fillStyle = '#1E3F66';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制海底背景
    drawBackground(ctx);
    
    // 更新玩家鱼位置和方向
    updatePlayerFish();
    
    // 更新NPC鱼的位置
    updateFishes();
    
    // 检测碰撞
    checkCollisions();
    
    // 绘制玩家鱼
    drawPlayerFish(ctx);
    
    // 绘制NPC鱼
    state.fishes.forEach(fish => drawFish(ctx, fish));
    
    // 生成新鱼
    const now = Date.now();
    if (now - state.lastFishSpawn > 1000) { // 每秒生成新鱼
      spawnFish();
      state.lastFishSpawn = now;
    }
    
    // 更新分数
    setScore(state.score);
    
    // 绘制分数
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`分数: ${state.score}`, 20, 30);
    
    // 继续游戏循环
    state.animationFrameId = requestAnimationFrame(gameLoop);
  };
  
  // 绘制海底背景
  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    // 绘制一些水草
    for (let i = 0; i < 10; i++) {
      const x = i * 100;
      const height = 50 + Math.sin(Date.now() / 1000 + i) * 10;
      
      ctx.fillStyle = '#0A7029';
      ctx.beginPath();
      ctx.moveTo(x, CANVAS_HEIGHT);
      ctx.quadraticCurveTo(x + 10, CANVAS_HEIGHT - height / 2, x, CANVAS_HEIGHT - height);
      ctx.quadraticCurveTo(x - 10, CANVAS_HEIGHT - height / 2, x, CANVAS_HEIGHT);
      ctx.fill();
    }
    
    // 绘制一些气泡
    for (let i = 0; i < 20; i++) {
      const x = (Math.sin(Date.now() / 2000 + i) + 1) * CANVAS_WIDTH / 2;
      const y = CANVAS_HEIGHT - ((Date.now() / 20 + i * 100) % CANVAS_HEIGHT);
      const size = 2 + Math.sin(Date.now() / 1000 + i) * 2;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  
  // 更新玩家鱼
  const updatePlayerFish = () => {
    const state = gameStateRef.current;
    
    // 计算目标方向
    const dx = state.mouseX - state.player.x;
    const dy = state.mouseY - state.player.y;
    const targetRotation = Math.atan2(dy, dx);
    
    // 平滑旋转
    let rotation = state.player.rotation;
    const rotationDiff = targetRotation - rotation;
    
    // 处理角度环绕问题
    if (rotationDiff > Math.PI) rotation += 2 * Math.PI;
    else if (rotationDiff < -Math.PI) rotation -= 2 * Math.PI;
    
    state.player.rotation = rotation + (targetRotation - rotation) * 0.1;
    
    // 移动玩家鱼
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 5) {
      const speed = 5;
      state.player.x += (dx / distance) * speed;
      state.player.y += (dy / distance) * speed;
    }
    
    // 边界检查
    state.player.x = Math.max(state.player.size, Math.min(CANVAS_WIDTH - state.player.size, state.player.x));
    state.player.y = Math.max(state.player.size, Math.min(CANVAS_HEIGHT - state.player.size, state.player.y));
  };
  
  // 更新NPC鱼
  const updateFishes = () => {
    const state = gameStateRef.current;
    
    for (let i = 0; i < state.fishes.length; i++) {
      const fish = state.fishes[i];
      
      // 移动鱼
      fish.x += Math.cos(fish.direction) * fish.speed;
      fish.y += Math.sin(fish.direction) * fish.speed;
      
      // 随机改变方向
      if (Math.random() < 0.01) {
        fish.direction += (Math.random() - 0.5) * 0.5;
      }
      
      // 移除屏幕外的鱼
      if (
        fish.x < -fish.size * 2 ||
        fish.x > CANVAS_WIDTH + fish.size * 2 ||
        fish.y < -fish.size * 2 ||
        fish.y > CANVAS_HEIGHT + fish.size * 2
      ) {
        state.fishes.splice(i, 1);
        i--;
        spawnFish();
      }
    }
  };
  
  // 检测碰撞
  const checkCollisions = () => {
    const state = gameStateRef.current;
    const player = state.player;
    
    for (let i = 0; i < state.fishes.length; i++) {
      const fish = state.fishes[i];
      
      // 计算距离
      const dx = player.x - fish.x;
      const dy = player.y - fish.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < player.size + fish.size * 0.7) {
        // 碰撞发生
        if (player.size > fish.size * 1.2) {
          // 玩家吃掉鱼
          state.fishes.splice(i, 1);
          i--;
          
          // 增加分数和体型
          state.score += Math.floor(fish.size);
          player.size += fish.size * 0.05;
          
          // 生成新鱼
          spawnFish();
        } else if (fish.size > player.size * 1.2) {
          // 玩家被大鱼吃掉
          endGame();
          return;
        }
      }
    }
  };
  
  // 结束游戏
  const endGame = () => {
    const state = gameStateRef.current;
    cancelAnimationFrame(state.animationFrameId);
    setGameOver(true);
    
    // 更新最高分
    if (state.score > highScore) {
      setHighScore(state.score);
      
      // 可以添加本地存储保存最高分
      try {
        localStorage.setItem('fishGameHighScore', state.score.toString());
      } catch (e) {
        console.error('无法保存最高分', e);
      }
    }
  };
  
  // 启动游戏
  const startGame = () => {
    setGameStarted(true);
    initGame();
    gameStateRef.current.lastFishSpawn = Date.now();
    gameStateRef.current.animationFrameId = requestAnimationFrame(gameLoop);
  };
  
  // 重启游戏
  const restartGame = () => {
    initGame();
    gameStateRef.current.lastFishSpawn = Date.now();
    gameStateRef.current.animationFrameId = requestAnimationFrame(gameLoop);
  };
  
  // 处理鼠标移动
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    gameStateRef.current.mouseX = e.clientX - rect.left;
    gameStateRef.current.mouseY = e.clientY - rect.top;
  };
  
  // 加载保存的最高分
  useEffect(() => {
    try {
      const savedHighScore = localStorage.getItem('fishGameHighScore');
      if (savedHighScore) {
        setHighScore(parseInt(savedHighScore));
      }
    } catch (e) {
      console.error('无法读取最高分', e);
    }
  }, []);
  
  // 清理游戏循环
  useEffect(() => {
    return () => {
      cancelAnimationFrame(gameStateRef.current.animationFrameId);
    };
  }, []);
  
  return (
    <div className="flex flex-col items-center">
      {!gameStarted ? (
        <div className="text-center p-10 bg-blue-800 text-white rounded-lg shadow-lg w-[800px] h-[600px] flex flex-col items-center justify-center">
          <h2 className="text-3xl font-bold mb-6">大鱼吃小鱼</h2>
          <p className="mb-8 text-lg">控制你的鱼吃掉比自己小的鱼来成长，同时避开比自己大的鱼！</p>
          <button 
            onClick={startGame}
            className="px-6 py-3 bg-blue-500 text-white rounded-full text-lg font-bold hover:bg-blue-600 transition-colors shadow-lg"
          >
            开始游戏
          </button>
          {highScore > 0 && (
            <p className="mt-4 text-yellow-300">最高分: {highScore}</p>
          )}
        </div>
      ) : (
        <div className="relative">
          <canvas 
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onMouseMove={handleMouseMove}
            className="rounded-lg shadow-lg"
          />
          
          {gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-lg">
              <h2 className="text-3xl font-bold text-white mb-2">游戏结束!</h2>
              <p className="text-xl text-white mb-1">最终分数: {score}</p>
              {score >= highScore && <p className="text-yellow-300 mb-6">新的最高分!</p>}
              <button 
                onClick={restartGame}
                className="px-6 py-3 bg-blue-500 text-white rounded-full text-lg font-bold hover:bg-blue-600 transition-colors"
              >
                再玩一次
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 