import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/app/lib/db';
import { cachedData, invalidateCacheByPattern } from '@/lib/redis';

// 批量处理查询参数
interface QueryParams {
  page: number;
  limit: number;
  categoryId?: string;
  orderBy: string;
  orderDir: 'asc' | 'desc';
}

// 解析和验证查询参数
function parseQueryParams(request: NextRequest): QueryParams {
  const searchParams = request.nextUrl.searchParams;
  
  return {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
    categoryId: searchParams.get('categoryId') || undefined,
    orderBy: searchParams.get('orderBy') || 'name',
    orderDir: (searchParams.get('orderDir') === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc'
  };
}

// POST: 创建新物种及相关图片
export async function POST(request: Request) {
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
    const { species, imageUrl } = body;
    
    // 检查必要字段
    if (!species.name || !species.scientificName || !species.categoryId) {
      return NextResponse.json(
        { error: '缺少必要字段' },
        { status: 400 }
      );
    }
    
    // 验证类别存在
    const category = await prisma.category.findUnique({
      where: { id: species.categoryId },
      select: { id: true }
    });
    
    if (!category) {
      return NextResponse.json(
        { error: '指定的分类不存在' },
        { status: 400 }
      );
    }

    // 检查学名是否已存在 (使用更高效的查询)
    const existingCount = await prisma.species.count({
      where: { scientificName: species.scientificName }
    });

    if (existingCount > 0) {
      return NextResponse.json(
        { error: '该学名已被使用' },
        { status: 400 }
      );
    }
    
    // 创建物种记录（使用事务）
    const result = await prisma.$transaction(async (tx) => {
      // 1. 创建物种
      const newSpecies = await tx.species.create({
        data: {
          name: species.name,
          scientificName: species.scientificName,
          foreignName: species.foreignName || null,
          protectionLevel: species.protectionLevel || null,
          description: species.description || null,
          habitat: species.habitat || null,
          distribution: species.distribution || null,
          altitude: species.altitude || null,
          habits: species.habits || null,
          reproduction: species.reproduction || null,
          isEdible: species.isEdible || false,
          cookingMethods: species.isEdible ? species.cookingMethods || null : null,
          isFeatured: species.isFeatured || false,
          categoryId: species.categoryId,
        },
        select: {
          id: true,
          name: true,
          scientificName: true,
          categoryId: true
        }
      });
      
      // 2. 如果提供了图片URL，则创建图片记录
      if (imageUrl && imageUrl.trim()) {
        await tx.image.create({
          data: {
            url: imageUrl,
            caption: `${species.name}图片`,
            speciesId: newSpecies.id
          }
        });
      }
      
      return newSpecies;
    });
    
    // 使缓存失效，确保数据一致性
    await Promise.all([
      invalidateCacheByPattern('species_list'),
      invalidateCacheByPattern('admin_species'),
      invalidateCacheByPattern(`category_${species.categoryId}`),
      species.isFeatured ? invalidateCacheByPattern('home') : Promise.resolve()
    ]);
    
    // 返回成功响应
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('创建物种时出错:', error);
    
    return NextResponse.json(
      { error: '创建物种失败: ' + error.message },
      { status: 500 }
    );
  }
}

// GET: 获取所有物种列表 - 使用Redis缓存优化
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
    
    // 获取并验证查询参数
    const { page, limit, categoryId, orderBy, orderDir } = parseQueryParams(request);
    
    // 构建缓存键
    const cacheKey = `admin_species:list:${page}:${limit}:${categoryId || 'all'}:${orderBy}:${orderDir}`;

    // 使用Redis缓存获取数据
    const data = await cachedData(
      cacheKey,
      async () => {
        // 构建查询条件
        const where = categoryId ? { categoryId } : {};
        
        // 构建排序条件
        const orderByObj = { [orderBy === 'createdAt' || orderBy === 'updatedAt' ? orderBy : 'name']: orderDir };
        
        // 并行执行查询，减少等待时间
        const [total, species] = await Promise.all([
          // 获取总记录数
          prisma.species.count({ where }),
          
          // 获取分页数据 - 只选择需要的字段
          prisma.species.findMany({
            where,
            select: {
              id: true,
              name: true,
              scientificName: true,
              isFeatured: true,
              createdAt: true,
              updatedAt: true,
              category: {
                select: {
                  id: true,
                  name: true
                }
              },
              _count: {
                select: { 
                  images: true, 
                  comments: true 
                }
              }
            },
            orderBy: orderByObj,
            skip: (page - 1) * limit,
            take: limit
          })
        ]);
        
        return {
          species,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1
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
    console.error('获取物种列表失败:', error);
    return NextResponse.json(
      { error: '获取物种列表失败' },
      { status: 500 }
    );
  }
} 