import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// 默认设置
const defaultSettings = {
  siteName: '珠有泪海洋生物科普网',
  siteDescription: '探索海洋奥秘，关爱海洋生命',
  contactEmail: 'contact@oceanedu.com',
  contactPhone: '123-456-7890',
  address: '广东省深圳市南山区科技园',
  icp: '粤ICP备XXXXXXXX号',
  footerText: '© 2023 珠有泪海洋生物科普网 版权所有',
  homePageFeaturedCount: '6',
  commentModeration: 'false',
};

// 获取所有设置
export async function GET() {
  try {
    // 验证会话
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

    // 从数据库获取所有设置
    const settings = await prisma.Setting.findMany();
    
    // 将设置转换为对象格式
    const settingsObj: Record<string, string> = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    
    // 合并默认设置和数据库设置
    const mergedSettings = { ...defaultSettings, ...settingsObj };

    return NextResponse.json({ settings: mergedSettings }, { status: 200 });
  } catch (error) {
    console.error('获取设置时出错:', error);
    return NextResponse.json(
      { message: '获取设置时出错', error: String(error) },
      { status: 500 }
    );
  }
}

// 更新设置
export async function POST(request: Request) {
  try {
    // 验证会话
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

    // 解析请求体
    const { settings } = await request.json();

    // 批量更新设置
    for (const [key, value] of Object.entries(settings)) {
      // 字符串化所有值
      const stringValue = typeof value === 'string' ? value : String(value);
      
      // Upsert 操作 - 如果存在则更新，不存在则创建
      await prisma.Setting.upsert({
        where: { key },
        update: { value: stringValue, updatedAt: new Date() },
        create: { key, value: stringValue },
      });
    }

    return NextResponse.json(
      { message: '设置已更新成功' },
      { status: 200 }
    );
  } catch (error) {
    console.error('更新设置时出错:', error);
    return NextResponse.json(
      { message: '更新设置时出错', error: String(error) },
      { status: 500 }
    );
  }
} 