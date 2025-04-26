import prisma from '@/lib/prisma';
import UsersClient from './UsersClient';

export const metadata = {
  title: '用户管理 - 珠有泪海洋生物科普网管理后台',
};

export default async function UsersPage() {
  // 获取所有用户
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return <UsersClient users={users} />;
} 