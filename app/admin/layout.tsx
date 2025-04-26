import { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // 检查用户是否已认证并具有管理员权限
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div id="admin-layout" className="flex min-h-screen bg-gray-100">
      {/* 侧边栏 */}
      <Sidebar />

      {/* 移动端导航栏 */}
      <Header />

      {/* 主内容区域 */}
      <div className="flex flex-col flex-1 ml-64">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 