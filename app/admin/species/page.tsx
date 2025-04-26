import { prisma } from '@/app/lib/db';
import Link from 'next/link';
import { MdAdd, MdEdit, MdDelete, MdArrowDropDown } from 'react-icons/md';
import Image from 'next/image';
import { GiSadCrab } from 'react-icons/gi';

export const metadata = {
  title: '物种管理 - 珠有泪海洋生物科普网管理后台',
};

// 渲染保护级别，根据不同级别显示不同颜色
const renderConservationStatus = (status: string | null) => {
  if (!status || status === '无') {
    return <span>无</span>;
  }
  
  if (status === '一级保护动物' || status === '国家一级保护动物') {
    return <span className="text-red-600 font-medium">{status}</span>;
  }
  
  if (status === '二级保护动物' || status === '国家二级保护动物') {
    return <span className="text-orange-500 font-medium">{status}</span>;
  }
  
  return <span>{status}</span>;
};

export default async function AdminSpeciesPage() {
  // 获取所有物种及其所属分类
  const species = await prisma.species.findMany({
    orderBy: {
      name: 'asc',
    },
    include: {
      category: true,
      images: {
        take: 1,
      },
    },
  });

  // 获取所有分类
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">物种管理</h1>
        <Link 
          href="/admin/species/new" 
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <MdAdd className="mr-2 h-5 w-5" />
          添加新物种
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">所有物种</h3>
            
            <div className="mt-3 sm:mt-0 flex items-center">
              <div className="relative inline-block text-left">
                <select
                  className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">所有分类</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="ml-3">
                <select
                  className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="name">按名称排序</option>
                  <option value="created">按创建时间排序</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  图片
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  名称
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  学名
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分类
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  保护级别
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {species.length > 0 ? (
                species.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex-shrink-0 h-12 w-12 rounded-md overflow-hidden bg-blue-100">
                        {item.images.length > 0 ? (
                          <Image 
                            src={item.images[0].url} 
                            alt={item.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <GiSadCrab className="h-8 w-8 text-blue-500" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 italic">{item.scientificName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderConservationStatus(item.protectionLevel)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/species/${item.id}/edit`}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <MdEdit className="mr-1" /> 编辑
                        </Link>
                        <Link
                          href={`/admin/species/${item.id}/delete`}
                          className="text-red-600 hover:text-red-800 flex items-center"
                        >
                          <MdDelete className="mr-1" /> 删除
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    暂无物种数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* 分页 */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <a
              href="#"
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              上一页
            </a>
            <a
              href="#"
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              下一页
            </a>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                显示 <span className="font-medium">1</span> 到 <span className="font-medium">{species.length}</span> 项，共 <span className="font-medium">{species.length}</span> 项
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <a
                  href="#"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">上一页</span>
                  <MdArrowDropDown className="h-5 w-5 transform rotate-90" />
                </a>
                <a
                  href="#"
                  aria-current="page"
                  className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  1
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">下一页</span>
                  <MdArrowDropDown className="h-5 w-5 transform -rotate-90" />
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 