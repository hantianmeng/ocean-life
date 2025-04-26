import { NextRequest, NextResponse } from 'next/server';
import { clearAllCache, invalidateCache, invalidateCacheByPattern } from '@/lib/redis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    // 验证用户是否为管理员
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '无权限进行此操作' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { type = 'all', path, prefix } = body;
    
    if (type === 'all') {
      // 清除所有缓存
      await clearAllCache();
      // 使所有动态路由重新验证
      revalidatePath('/');
      
      return NextResponse.json({
        success: true,
        message: '所有缓存已清除'
      });
    } else if (type === 'path' && path) {
      // 重新验证指定路径
      revalidatePath(path);
      
      return NextResponse.json({
        success: true,
        message: `路径 ${path} 缓存已清除`
      });
    } else if (type === 'prefix' && prefix) {
      // 清除指定前缀的缓存
      await invalidateCacheByPattern(prefix);
      
      return NextResponse.json({
        success: true,
        message: `前缀为 ${prefix} 的缓存已清除`
      });
    } else if (type === 'key' && path) {
      // 清除特定键的缓存
      await invalidateCache(path);
      
      return NextResponse.json({
        success: true,
        message: `键 ${path} 缓存已清除`
      });
    }
    
    return NextResponse.json(
      { error: '无效的请求参数' },
      { status: 400 }
    );
  } catch (error) {
    console.error('清除缓存失败:', error);
    return NextResponse.json(
      { error: '清除缓存失败' },
      { status: 500 }
    );
  }
} 