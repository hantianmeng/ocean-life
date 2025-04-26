import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Redis from 'ioredis';

export async function GET(request: NextRequest) {
  try {
    // 验证用户是否为管理员
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '无权限进行此操作' },
        { status: 403 }
      );
    }
    
    // 仅在设置了Redis URL时连接
    if (!process.env.REDIS_URL) {
      return NextResponse.json({
        status: 'inactive',
        message: 'Redis未配置',
        memoryUsage: null,
        keys: 0,
        info: null
      });
    }
    
    // 临时连接Redis获取状态信息
    const redis = new Redis(process.env.REDIS_URL);
    
    try {
      // 并行获取Redis信息
      const [info, keys, memory] = await Promise.all([
        redis.info(),
        redis.keys('*').then(keys => keys.length),
        redis.info('memory').then(info => {
          const match = info.match(/used_memory_human:(.+?)\r\n/);
          return match ? match[1].trim() : 'unknown';
        })
      ]);
      
      // 解析信息
      const serverInfo = {
        version: info.match(/redis_version:(.+?)\r\n/)?.[1]?.trim() || 'unknown',
        uptime: info.match(/uptime_in_seconds:(.+?)\r\n/)?.[1]?.trim() || 'unknown',
        clients: info.match(/connected_clients:(.+?)\r\n/)?.[1]?.trim() || 'unknown',
        memoryUsage: memory,
        keys: keys
      };
      
      // 关闭连接
      await redis.quit();
      
      return NextResponse.json({
        status: 'active',
        message: 'Redis缓存正常运行',
        ...serverInfo
      });
    } catch (error) {
      // 确保关闭连接
      await redis.quit();
      throw error;
    }
  } catch (error) {
    console.error('获取缓存状态失败:', error);
    return NextResponse.json(
      { 
        error: '获取缓存状态失败',
        status: 'error',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
} 