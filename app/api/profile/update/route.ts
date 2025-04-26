import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { hash, compare } from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    // 检查用户是否已登录
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }
    
    const { name, currentPassword, newPassword } = await request.json();
    
    // 获取当前用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 如果提供了密码，验证当前密码是否正确
    if (currentPassword || newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: '请提供当前密码' },
          { status: 400 }
        );
      }
      
      // 验证当前密码
      const isPasswordValid = await compare(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: '当前密码不正确' },
          { status: 400 }
        );
      }
    }
    
    // 更新用户信息
    const updateData: any = {};
    
    if (name && name !== user.name) {
      updateData.name = name;
    }
    
    if (newPassword) {
      updateData.password = await hash(newPassword, 10);
    }
    
    // 如果没有需要更新的数据
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: '没有信息被修改' });
    }
    
    // 更新用户
    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });
    
    return NextResponse.json({
      message: '个人资料更新成功',
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: '更新个人资料时发生错误' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 