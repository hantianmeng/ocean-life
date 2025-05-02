'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MdArrowBack, MdDelete, MdWarning } from 'react-icons/md';

interface Species {
  id: string;
  name: string;
  scientificName: string;
  category: {
    name: string;
  };
  images?: { url: string }[];
}

type PageParams = {
  params: { id: string };
}

export default function DeleteSpeciesPage({ params }: PageParams) {
  const router = useRouter();
  const speciesId = params.id;
  
  const [species, setSpecies] = useState<Species | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  // 获取物种信息
  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/species/${speciesId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || '无法获取物种数据');
        }
        
        setSpecies(data);
      } catch (error: any) {
        console.error('Error fetching species:', error);
        setError(error.message || '获取物种数据失败');
      } finally {
        setIsLoading(false);
      }
    };

    if (speciesId) {
      fetchSpecies();
    }
  }, [speciesId]);

  // 处理删除物种
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError('');
      
      const response = await fetch(`/api/admin/species/${speciesId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '删除物种失败');
      }
      
      // 删除成功，返回物种列表页
      router.push('/admin/species');
      router.refresh();
    } catch (error: any) {
      console.error('Error deleting species:', error);
      setError(error.message || '删除物种时发生错误，请稍后再试');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">加载物种数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link href="/admin/species" className="text-blue-600 hover:text-blue-800 flex items-center">
            <MdArrowBack className="mr-1" /> 返回物种列表
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

  if (!species) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link href="/admin/species" className="text-blue-600 hover:text-blue-800 flex items-center">
            <MdArrowBack className="mr-1" /> 返回物种列表
          </Link>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <MdWarning className="h-6 w-6 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">物种不存在或已被删除</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/species" className="text-blue-600 hover:text-blue-800 flex items-center">
          <MdArrowBack className="mr-1" /> 返回物种列表
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">删除确认</h1>
        
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex items-start">
            <MdWarning className="h-6 w-6 text-red-400 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-red-700">
                您确定要删除以下物种吗？此操作不可撤销，将永久删除该物种及其所有相关数据（包括评论、图片等）。
              </p>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-2">{species.name}</h2>
            <p className="text-gray-600 mb-1">学名: <span className="italic">{species.scientificName}</span></p>
            <p className="text-gray-600">分类: {species.category.name}</p>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
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
            href={`/admin/species`}
            className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            取消
          </Link>
        </div>
      </div>
    </div>
  );
} 