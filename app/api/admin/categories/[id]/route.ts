import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/app/lib/db';
import { invalidateCache } from '@/lib/cache';

// GET: 获取单个分类的详细信息
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // 确保params是已解析的
    const id = context.params?.id;
    if (!id) {
      return NextResponse.json(
        { error: '无效的分类ID' },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { species: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: '分类不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('获取分类详情失败:', error);
    return NextResponse.json(
      { error: '获取分类详情失败' },
      { status: 500 }
    );
  }
}

// PATCH: 更新分类信息
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // 确保params是已解析的
    const id = context.params?.id;
    if (!id) {
      return NextResponse.json(
        { error: '无效的分类ID' },
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
    const { name, description, imageUrl } = body;
    
    // 检查必要字段
    if (!name) {
      return NextResponse.json(
        { error: '分类名称不能为空' },
        { status: 400 }
      );
    }
    
    // 验证分类存在
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });
    
    if (!existingCategory) {
      return NextResponse.json(
        { error: '分类不存在' },
        { status: 404 }
      );
    }

    // 检查名称是否被其他分类使用
    if (name !== existingCategory.name) {
      const nameExists = await prisma.category.findFirst({
        where: {
          name,
          id: { not: id }
        }
      });

      if (nameExists) {
        return NextResponse.json(
          { error: '该分类名称已被使用' },
          { status: 400 }
        );
      }
    }
    
    // 更新分类
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        imageUrl
      }
    });
    
    // 使分类及物种相关缓存失效
    invalidateCache(`category_${id}`);
    invalidateCache('home-categories');
    
    // 返回成功响应
    return NextResponse.json(updatedCategory);
  } catch (error: any) {
    console.error('更新分类失败:', error);
    
    return NextResponse.json(
      { error: '更新分类失败: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE: 删除分类
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
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
    
    // 检查分类是否存在
    const category = await prisma.category.findUnique({
      where: { id: context.params.id },
      include: { 
        _count: { 
          select: { species: true } 
        } 
      }
    });
    
    if (!category) {
      return NextResponse.json(
        { error: '分类不存在' },
        { status: 404 }
      );
    }
    
    // 检查该分类下是否有物种
    if (category._count.species > 0) {
      return NextResponse.json(
        { error: '无法删除此分类，因为它包含物种。请先删除或移动这些物种。' },
        { status: 400 }
      );
    }
    
    // 删除分类
    await prisma.category.delete({
      where: { id: context.params.id }
    });
    
    // 返回成功响应
    return NextResponse.json(
      { success: true, message: '分类已成功删除' }
    );
  } catch (error: any) {
    console.error('删除分类失败:', error);
    
    return NextResponse.json(
      { error: '删除分类失败: ' + error.message },
      { status: 500 }
    );
  }
} 