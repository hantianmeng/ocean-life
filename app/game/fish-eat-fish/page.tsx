import { Metadata } from 'next';
import FishEatFishGame from '@/app/components/FishEatFishGame';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '大鱼吃小鱼 - 珠有泪海洋生物科普网',
  description: '在这个趣味游戏中扮演大鱼吃掉比自己小的鱼，同时避开比自己大的鱼！',
};

export default function GamePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/" 
          className="text-blue-600 hover:underline inline-flex items-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
          返回首页
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 bg-blue-50">
          <h1 className="text-3xl font-bold text-blue-800 mb-4">大鱼吃小鱼</h1>
          <p className="text-gray-700 mb-2">
            控制你的鱼吃掉比自己小的鱼来成长，同时避开比自己大的鱼！
          </p>
          <div className="text-sm text-gray-600 mb-4">
            <p><strong>操作说明：</strong></p>
            <ul className="list-disc pl-5">
              <li>使用鼠标移动控制鱼的方向</li>
              <li>吃掉比自己小的鱼可以增加分数和体型</li>
              <li>避开比自己大的鱼，否则游戏结束</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-center p-4 bg-blue-900">
          <FishEatFishGame />
        </div>
      </div>
    </div>
  );
} 