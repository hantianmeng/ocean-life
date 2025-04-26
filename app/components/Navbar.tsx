'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { GiWaterDrop } from 'react-icons/gi';
import { FiMenu, FiX, FiUser, FiSettings } from 'react-icons/fi';
import { MdDashboard } from 'react-icons/md';
import { useSession, signOut } from 'next-auth/react';
import GameLink from './GameLink';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const isAuthenticated = status === 'authenticated';
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle dropdown
  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="bg-blue-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <GiWaterDrop className="text-2xl text-blue-300" />
              <span className="text-xl font-bold">珠有泪海洋生物科普网</span>
            </Link>
            
            {/* 游戏链接 - 红框位置 */}
            <div className="hidden md:block">
              <GameLink />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-blue-300 transition-colors">
              首页
            </Link>
            <Link href="/categories" className="hover:text-blue-300 transition-colors">
              生物分类
            </Link>
            <a href="https://www.eisk.cn/903.html?date=2024-1-13" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors">
              潮汐表
            </a>
            <Link href="/about" className="hover:text-blue-300 transition-colors">
              关于我们
            </Link>
            
            {!isAuthenticated ? (
              <Link 
                href="/login" 
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors"
              >
                登录
              </Link>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors"
                >
                  <span>{session.user?.name || '用户'}</span>
                  <FiUser />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    {isAdmin ? (
                      <Link 
                        href="/admin" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <MdDashboard className="mr-2" />
                        管理后台
                      </Link>
                    ) : (
                      <Link 
                        href="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <FiSettings className="mr-2" />
                        个人设置
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 flex flex-col">
            {/* 游戏链接 - 移动端 */}
            <div className="mb-2">
              <GameLink />
            </div>
            
            <Link 
              href="/" 
              className="hover:text-blue-300 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              首页
            </Link>
            <Link 
              href="/categories" 
              className="hover:text-blue-300 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              生物分类
            </Link>
            <a 
              href="https://www.eisk.cn/903.html?date=2024-1-13" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-blue-300 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              潮汐表
            </a>
            <Link 
              href="/about" 
              className="hover:text-blue-300 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              关于我们
            </Link>
            
            {!isAuthenticated ? (
              <Link 
                href="/login" 
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md w-fit transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                登录
              </Link>
            ) : (
              <div className="space-y-2">
                <div className="text-blue-300">
                  {session.user?.name || '用户'}
                </div>
                {isAdmin ? (
                  <Link 
                    href="/admin" 
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md w-fit transition-colors flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MdDashboard className="mr-2" />
                    管理后台
                  </Link>
                ) : (
                  <Link 
                    href="/profile" 
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md w-fit transition-colors flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiSettings className="mr-2" />
                    个人设置
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-red-300 hover:text-red-200 transition-colors"
                >
                  退出登录
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 