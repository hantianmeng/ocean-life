import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/app/lib/db';
import { invalidateCache, invalidateCacheByPrefix } from '@/lib/cache';

// 定义正确的参数类型
type RouteContextParams = {
  params: { id: string }
}

// GET: 获取单个物种的详细信息
export async function GET(
  request: Request,
  context: RouteContextParams
) {
  try {
    // 确保params是已解析的
    const id = context.params?.id;
    if (!id) {
      return NextResponse.json(
        { error: '无效的物种ID' },
        { status: 400 }
      );
    }

    const species = await prisma.species.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        images: {
          select: {
            id: true,
            url: true,
            caption: true
          }
        },
        _count: {
          select: { comments: true }
        }
      }
    });

    if (!species) {
      return NextResponse.json(
        { error: '物种不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(species);
  } catch (error) {
    console.error('获取物种详情失败:', error);
    return NextResponse.json(
      { error: '获取物种详情失败' },
      { status: 500 }
    );
  }
}

// PATCH: 更新物种信息
export async function PATCH(
  request: Request,
  context: RouteContextParams
) {
  try {
    // 确保params是已解析的
    const id = context.params?.id;
    if (!id) {
      return NextResponse.json(
        { error: '无效的物种ID' },
        { status: 400 }
      );
    }
    
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    // 检查是否已认证且为管理员
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }
    
    // 解析请求主体
    const body = await request.json();
    const { species, newImageUrl } = body;
    
    // 检查必要字段
    if (!species.name || !species.scientificName || !species.categoryId) {
      return NextResponse.json(
        { error: '缺少必要字段' },
        { status: 400 }
      );
    }
    
    // 验证物种存在
    const existingSpecies = await prisma.species.findUnique({
      where: { id },
      include: { images: true }
    });
    
    if (!existingSpecies) {
      return NextResponse.json(
        { error: '物种不存在' },
        { status: 404 }
      );
    }

    // 检查学名是否被其他物种使用
    if (species.scientificName !== existingSpecies.scientificName) {
      const nameExists = await prisma.species.findFirst({
        where: {
          scientificName: species.scientificName,
          id: { not: id }
        }
      });

      if (nameExists) {
        return NextResponse.json(
          { error: '该学名已被使用' },
          { status: 400 }
        );
      }
    }
    
    // 使用事务更新物种信息和图片
    const result = await prisma.$transaction(async (tx) => {
      // 1. 更新物种信息
      const updatedSpecies = await tx.species.update({
        where: { id },
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
          categoryId: true,
          isFeatured: true
        }
      });
      
      // 2. 如果有新图片，添加新图片
      if (newImageUrl && newImageUrl.trim()) {
        // 如果之前已有图片，先删除旧图片
        if (existingSpecies.images && existingSpecies.images.length > 0) {
          await tx.image.deleteMany({
            where: { speciesId: id }
          });
        }
        
        // 添加新图片
        await tx.image.create({
          data: {
            url: newImageUrl,
            caption: `${species.name}图片`,
            speciesId: id
          }
        });
      }
      
      return updatedSpecies;
    });
    
    // 使物种相关缓存失效
    invalidateCache(`species_${id}`);
    if (existingSpecies.categoryId !== species.categoryId) {
      // 如果分类变化了，旧分类和新分类的缓存都需要失效
      invalidateCache(`category_${existingSpecies.categoryId}`);
      invalidateCache(`category_${species.categoryId}`);
    }
    if (existingSpecies.isFeatured !== species.isFeatured) {
      // 如果推荐状态变化了，首页缓存需要失效
      invalidateCacheByPrefix('home');
    }
    
    // 返回成功响应
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('更新物种失败:', error);
    
    return NextResponse.json(
      { error: '更新物种失败: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE: 删除物种
export async function DELETE(
  request: Request,
  context: RouteContextParams
) {
  try {
    // 确保params是已解析的
    const id = context.params?.id;
    if (!id) {
      return NextResponse.json(
        { error: '无效的物种ID' },
        { status: 400 }
      );
    }
    
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    // 检查是否已认证且为管理员
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }
    
    // 检查物种是否存在
    const species = await prisma.species.findUnique({
      where: { id },
      select: {
        id: true,
        categoryId: true,
        isFeatured: true,
        _count: {
          select: {
            images: true,
            comments: true
          }
        }
      }
    });
    
    if (!species) {
      return NextResponse.json(
        { error: '物种不存在' },
        { status: 404 }
      );
    }
    
    // 使用事务删除物种及其关联数据
    await prisma.$transaction(async (tx) => {
      // 1. 删除所有评论（如果有）
      if (species._count.comments > 0) {
        await tx.comment.deleteMany({
          where: { speciesId: id }
        });
      }
      
      // 2. 删除所有图片（如果有）
      if (species._count.images > 0) {
        await tx.image.deleteMany({
          where: { speciesId: id }
        });
      }
      
      // 3. 删除物种
      await tx.species.delete({
        where: { id }
      });
    });
    
    // 使相关缓存失效
    invalidateCache(`species_${id}`);
    invalidateCache(`category_${species.categoryId}`);
    if (species.isFeatured) {
      invalidateCacheByPrefix('home');
    }
    
    // 返回成功响应
    return NextResponse.json(
      { success: true, message: '物种已成功删除' }
    );
  } catch (error: any) {
    console.error('删除物种失败:', error);
    
    return NextResponse.json(
      { error: '删除物种失败: ' + error.message },
      { status: 500 }
    );
  }
} 