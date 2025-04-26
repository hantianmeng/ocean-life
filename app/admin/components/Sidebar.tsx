'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  GiWaterDrop, 
  GiSharkFin, 
  GiSeaTurtle, 
  GiOctopus,
  GiPowerButton
} from 'react-icons/gi';
import { 
  MdDashboard, 
  MdCategory, 
  MdComment,
  MdPerson,
  MdSettings
} from 'react-icons/md';
import { signOut } from 'next-auth/react';

const navigation = [
  { name: '控制面板', href: '/admin', icon: MdDashboard },
  { name: '分类管理', href: '/admin/categories', icon: MdCategory },
  { name: '物种管理', href: '/admin/species', icon: GiSharkFin },
  { name: '评论管理', href: '/admin/comments', icon: MdComment },
  { name: '用户管理', href: '/admin/users', icon: MdPerson },
  { name: '网站设置', href: '/admin/settings', icon: MdSettings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:block admin-sidebar w-64">
      <div className="bg-blue-900 h-full flex flex-col">
        <div className="flex flex-col pt-5 pb-4">
          <div className="flex items-center flex-shrink-0 px-4">
            <Link href="/" className="flex items-center">
              <GiWaterDrop className="h-8 w-8 text-blue-300" />
              <span className="ml-2 text-white text-xl font-semibold">海洋生物科普网</span>
            </Link>
          </div>
          
          <nav className="mt-8 px-2 space-y-1 flex-grow">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${
                      isActive
                        ? 'bg-blue-800 text-white'
                        : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                    }
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 flex-shrink-0 h-6 w-6
                      ${isActive ? 'text-blue-300' : 'text-blue-300 group-hover:text-blue-200'}
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-blue-800 p-4 mt-auto">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex-shrink-0 w-full group flex items-center text-blue-100 px-2 py-2 text-sm font-medium rounded-md hover:bg-blue-800 hover:text-white"
          >
            <GiPowerButton className="mr-3 h-6 w-6 text-blue-300 group-hover:text-blue-200" />
            退出登录
          </button>
        </div>
      </div>
    </div>
  );
} 