import { prisma } from '@/app/lib/db';
import Link from 'next/link';
import { MdDelete, MdEdit, MdAdd } from 'react-icons/md';
import Image from 'next/image';
import { GiWaterDrop } from 'react-icons/gi';

export const metadata = {
  title: '分类管理 - 珠有泪海洋生物科普网管理后台',
};

export default async function AdminCategoriesPage() {
  // 获取所有分类及其物种数量
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
    include: {
      _count: {
        select: {
          species: true,
        },
      },
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">分类管理</h1>
        <Link 
          href="/admin/categories/new" 
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <MdAdd className="mr-2 h-5 w-5" />
          添加新分类
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">所有分类</h3>
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
                  描述
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  物种数量
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex-shrink-0 h-12 w-12 rounded-md overflow-hidden bg-blue-100">
                        {category.imageUrl ? (
                          <Image 
                            src={category.imageUrl} 
                            alt={category.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <GiWaterDrop className="h-8 w-8 text-blue-500" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2 max-w-md">
                        {category.description || '暂无描述'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{category._count.species}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/categories/${category.id}/edit`}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <MdEdit className="mr-1" /> 编辑
                        </Link>
                        <Link
                          href={`/admin/categories/${category.id}/delete`}
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
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    暂无分类数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 