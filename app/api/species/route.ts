import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/db';
import { cachedApiResponse, apiError } from '@/app/api/api-utils';

// 获取物种列表
export async function GET(request: NextRequest) {
  try {
    // 解析查询参数
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');
    const featured = searchParams.get('featured') === 'true';
    
    // 构建查询条件
    const where: any = {};
    
    // 添加搜索过滤
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { scientificName: { contains: search } },
        { description: { contains: search } }
      ];
    }
    
    // 添加分类过滤
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    // 添加推荐过滤
    if (featured) {
      where.isFeatured = true;
    }

    // 构建缓存键
    const cacheKey = `species_list_${page}_${limit}_${search || ''}_${categoryId || ''}_${featured}`;
    
    // 使用缓存API响应
    return cachedApiResponse(
      cacheKey,
      async () => {
        // 并行执行查询
        const [total, species] = await Promise.all([
          // 获取总记录数
          prisma.species.count({ where }),
          
          // 获取分页数据
          prisma.species.findMany({
            where,
            select: {
              id: true,
              name: true,
              scientificName: true,
              description: true,
              protectionLevel: true,
              isEdible: true,
              isFeatured: true,
              category: {
                select: {
                  id: true,
                  name: true
                }
              },
              images: {
                take: 1,
                select: {
                  id: true,
                  url: true
                }
              },
              _count: {
                select: { comments: true }
              }
            },
            orderBy: { name: 'asc' },
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
            hasMore: page < Math.ceil(total / limit)
          }
        };
      },
      {
        maxAge: 60,  // 1分钟
        staleWhileRevalidate: 600,  // 10分钟
        tags: ['species', 'public']
      }
    );
  } catch (error) {
    console.error('获取物种列表失败:', error);
    return apiError('获取物种列表失败', 500);
  }
} 