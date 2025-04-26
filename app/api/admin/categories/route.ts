import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/app/lib/db';
import { cachedData, invalidateCacheByPattern } from '@/lib/redis';

// POST: 创建新分类
export async function POST(request: NextRequest) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    // 检查是否已认证且为管理员
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }
    
    // 解析请求主体
    const body = await request.json();
    const { name, description, imageUrl } = body;
    
    // 检查必要字段
    if (!name) {
      return NextResponse.json(
        { error: '分类名称不能为空' },
        { status: 400 }
      );
    }
    
    // 检查名称是否已存在 - 使用count优化
    const nameExists = await prisma.category.count({
      where: { name }
    });
    
    if (nameExists > 0) {
      return NextResponse.json(
        { error: '分类名称已被使用' },
        { status: 400 }
      );
    }
    
    // 创建分类
    const category = await prisma.category.create({
      data: {
        name,
        description: description || null,
        imageUrl: imageUrl || null
      },
      select: {
        id: true,
        name: true
      }
    });
    
    // 使缓存失效
    await Promise.all([
      invalidateCacheByPattern('category'),
      invalidateCacheByPattern('home'),
      invalidateCacheByPattern('admin_categories')
    ]);
    
    // 返回成功响应
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('创建分类失败:', error);
    
    return NextResponse.json(
      { error: '创建分类失败: ' + error.message },
      { status: 500 }
    );
  }
}

// GET: 获取所有分类
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
    
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // 构建缓存键
    const cacheKey = `admin_categories:list:${page}:${limit}`;
    
    // 使用缓存获取数据
    const data = await cachedData(
      cacheKey, 
      async () => {
        // 并行执行查询
        const [total, categories] = await Promise.all([
          // 获取总记录数
          prisma.category.count(),
          
          // 获取分页数据
          prisma.category.findMany({
            select: {
              id: true,
              name: true,
              description: true,
              imageUrl: true,
              createdAt: true,
              updatedAt: true,
              _count: {
                select: { species: true }
              }
            },
            orderBy: { name: 'asc' },
            skip: (page - 1) * limit,
            take: limit
          })
        ]);
        
        return {
          categories,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        };
      },
      // 缓存10分钟
      60 * 10
    );
    
    // 设置响应头
    const response = NextResponse.json(data);
    response.headers.set('Cache-Control', 'private, max-age=120');
    response.headers.set('X-Cache-Source', 'redis');
    
    return response;
  } catch (error) {
    console.error('获取分类列表失败:', error);
    return NextResponse.json(
      { error: '获取分类列表失败' },
      { status: 500 }
    );
  }
} 