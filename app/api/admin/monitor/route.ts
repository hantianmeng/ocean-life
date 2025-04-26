import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getCacheStats } from '@/lib/cache';
import { prisma } from '@/app/lib/db';

// GET: 获取系统监控信息
export async function GET(request: Request) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    // 检查是否已认证且为管理员
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }
    
    // 获取缓存统计信息
    const cacheStats = getCacheStats();
    
    // 获取数据库统计信息
    const [
      totalSpecies,
      totalCategories,
      totalComments,
      totalUsers,
      totalImages,
      featuredSpecies
    ] = await Promise.all([
      prisma.species.count(),
      prisma.category.count(),
      prisma.comment.count(),
      prisma.user.count(),
      prisma.image.count(),
      prisma.species.count({ where: { isFeatured: true } })
    ]);
    
    // 获取系统信息
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: Math.floor(process.uptime()),
      memoryUsage: process.memoryUsage(),
      env: process.env.NODE_ENV
    };
    
    // 返回成功响应
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      cacheStats,
      databaseStats: {
        totalSpecies,
        totalCategories,
        totalComments,
        totalUsers,
        totalImages,
        featuredSpecies
      },
      systemInfo
    });
  } catch (error) {
    console.error('获取监控信息失败:', error);
    return NextResponse.json(
      { error: '获取监控信息失败' },
      { status: 500 }
    );
  }
} 