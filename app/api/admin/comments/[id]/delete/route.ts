import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // 验证用户是否为管理员
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    const commentId = params.id;
    
    if (!commentId) {
      return NextResponse.json(
        { error: '评论ID不能为空' },
        { status: 400 }
      );
    }
    
    // 查找评论
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    
    if (!comment) {
      return NextResponse.json(
        { error: '评论不存在' },
        { status: 404 }
      );
    }
    
    // 删除评论
    await prisma.comment.delete({
      where: { id: commentId },
    });
    
    // 重定向回评论管理页面
    return NextResponse.redirect(new URL('/admin/comments', request.url));
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: '删除评论失败' },
      { status: 500 }
    );
  }
} 