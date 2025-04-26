import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { invalidateCache } from '@/lib/cache';

export async function POST(request: NextRequest) {
  try {
    // 并行获取会话和请求数据，减少等待时间
    const [session, bodyData] = await Promise.all([
      getServerSession(authOptions),
      request.json()
    ]);
    
    // 检查用户是否已登录
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      );
    }
    
    const { content, speciesId } = bodyData;
    
    // 验证请求数据
    if (!content || !content.trim() || !speciesId) {
      return NextResponse.json(
        { error: '评论内容和物种ID不能为空' },
        { status: 400 }
      );
    }
    
    // 检查物种是否存在 - 使用count替代findUnique提高性能
    const speciesExists = await prisma.species.count({
      where: { id: speciesId }
    });
    
    if (speciesExists === 0) {
      return NextResponse.json(
        { error: '物种不存在' },
        { status: 404 }
      );
    }
    
    // 创建评论 - 只返回需要的字段
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        speciesId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // 使缓存失效，确保数据一致性
    invalidateCache(`species_${speciesId}`);
    
    // 设置响应头
    const response = NextResponse.json(comment, { status: 201 });
    response.headers.set('Cache-Control', 'no-store');
    
    return response;
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: '添加评论失败' },
      { status: 500 }
    );
  }
} 