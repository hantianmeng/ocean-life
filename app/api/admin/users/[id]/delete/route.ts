import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 验证会话和管理员权限
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: '未授权访问' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: '权限不足，需要管理员权限' },
        { status: 403 }
      );
    }

    const userId = params.id;
    
    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { _count: { select: { comments: true } } }
    });

    if (!user) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      );
    }

    // 防止删除管理员账户
    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { message: '不能删除管理员账户' },
        { status: 403 }
      );
    }

    // 先删除用户的所有评论
    await prisma.comment.deleteMany({
      where: { userId: userId }
    });

    // 删除用户
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json(
      { message: '用户删除成功' },
      { status: 200 }
    );
  } catch (error) {
    console.error('删除用户时出错:', error);
    return NextResponse.json(
      { message: '删除用户时出错', error: String(error) },
      { status: 500 }
    );
  }
} 