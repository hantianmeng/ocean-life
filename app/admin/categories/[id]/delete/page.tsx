'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MdArrowBack, MdDelete, MdWarning } from 'react-icons/md';
import Image from 'next/image';
import { GiWaterDrop } from 'react-icons/gi';

interface Category {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  _count?: {
    species: number;
  };
}

type PageParams = {
  params: { id: string };
}

export default function DeleteCategoryPage({ params }: PageParams) {
  const router = useRouter();
  const categoryId = params.id;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  // 获取分类信息
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/categories/${categoryId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || '无法获取分类数据');
        }
        
        setCategory(data);
      } catch (error: any) {
        console.error('Error fetching category:', error);
        setError(error.message || '获取分类数据失败');
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  // 处理删除分类
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError('');
      
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '删除分类失败');
      }
      
      // 删除成功，返回分类列表页
      router.push('/admin/categories');
      router.refresh();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      setError(error.message || '删除分类时发生错误，请稍后再试');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">加载分类数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link href="/admin/categories" className="text-blue-600 hover:text-blue-800 flex items-center">
            <MdArrowBack className="mr-1" /> 返回分类列表
          </Link>
        </div>
        
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <MdWarning className="h-6 w-6 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link href="/admin/categories" className="text-blue-600 hover:text-blue-800 flex items-center">
            <MdArrowBack className="mr-1" /> 返回分类列表
          </Link>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <MdWarning className="h-6 w-6 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">分类不存在或已被删除</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 检查该分类下是否有物种
  const hasSpecies = category._count && category._count.species > 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/categories" className="text-blue-600 hover:text-blue-800 flex items-center">
          <MdArrowBack className="mr-1" /> 返回分类列表
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">删除确认</h1>
        
        {hasSpecies ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex items-start">
              <MdWarning className="h-6 w-6 text-red-400 mt-0.5" />
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  无法删除此分类，因为它包含 {category._count?.species} 个物种。请先删除或移动这些物种后再尝试删除分类。
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex items-start">
              <MdWarning className="h-6 w-6 text-red-400 mt-0.5" />
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  您确定要删除以下分类吗？此操作不可撤销。
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded-lg flex items-center">
            <div className="flex-shrink-0 mr-4">
              <div className="h-16 w-16 rounded-md overflow-hidden bg-blue-100 flex items-center justify-center">
                {category.imageUrl ? (
                  <Image 
                    src={category.imageUrl} 
                    alt={category.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 object-cover"
                  />
                ) : (
                  <GiWaterDrop className="h-10 w-10 text-blue-500" />
                )}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-1">{category.name}</h2>
              {category.description && (
                <p className="text-gray-600">{category.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                物种数量: {category._count?.species || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || hasSpecies}
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                正在删除...
              </>
            ) : (
              <>
                <MdDelete className="mr-2 -ml-1" />
                确认删除
              </>
            )}
          </button>
          
          <Link
            href={`/admin/categories`}
            className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            取消
          </Link>
        </div>
      </div>
    </div>
  );
} 