'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  GiWaterDrop, 
  GiHamburgerMenu 
} from 'react-icons/gi';
import { MdClose } from 'react-icons/md';

// 移动端导航栏选项
const navigation = [
  { name: '控制面板', href: '/admin' },
  { name: '分类管理', href: '/admin/categories' },
  { name: '物种管理', href: '/admin/species' },
  { name: '评论管理', href: '/admin/comments' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="relative z-10 md:hidden">
      <button
        type="button"
        className="px-4 py-2 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        onClick={() => setMobileMenuOpen(true)}
      >
        <span className="sr-only">打开侧边栏</span>
        <GiHamburgerMenu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* 移动端菜单 */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          {/* 背景蒙层 */}
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          
          {/* 侧边栏 */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-blue-900">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">关闭侧边栏</span>
                <MdClose className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            
            <div className="flex-1 pt-5 pb-4">
              <div className="flex-shrink-0 flex items-center px-4">
                <Link href="/" className="flex items-center">
                  <GiWaterDrop className="h-8 w-8 text-blue-300" />
                  <span className="ml-2 text-white text-lg font-semibold">海洋生物科普网</span>
                </Link>
              </div>
              
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        group flex items-center px-2 py-2 text-base font-medium rounded-md
                        ${
                          isActive
                            ? 'bg-blue-800 text-white'
                            : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                        }
                      `}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            <div className="flex-shrink-0 flex border-t border-blue-800 p-4">
              <Link
                href="/api/auth/signout"
                className="flex items-center text-blue-100 hover:text-white"
              >
                退出登录
              </Link>
            </div>
          </div>
          
          <div className="flex-shrink-0 w-14"></div>
        </div>
      )}
    </div>
  );
} 