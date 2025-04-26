import { prisma } from '@/app/lib/db';
import Link from 'next/link';
import { MdDelete, MdVisibility } from 'react-icons/md';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const metadata = {
  title: '评论管理 - 珠有泪海洋生物科普网管理后台',
};

// 格式化时间函数
function formatDate(date: Date) {
  return formatDistanceToNow(new Date(date), { 
    addSuffix: true,
    locale: zhCN
  });
}

export default async function AdminCommentsPage() {
  // 获取所有评论
  const comments = await prisma.comment.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      species: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">评论管理</h1>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">所有评论</h3>
          <p className="mt-1 text-sm text-gray-500">
            管理用户对海洋生物发表的评论
          </p>
        </div>
        
        <div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  物种
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  评论内容
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  发表时间
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <tr key={comment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {comment.user.name || '匿名用户'}
                      </div>
                      <div className="text-sm text-gray-500">{comment.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        href={`/species/${comment.species.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {comment.species.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2 max-w-md">
                        {comment.content}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(comment.createdAt)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleString('zh-CN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/species/${comment.species.id}`}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <MdVisibility className="mr-1" /> 查看
                        </Link>
                        <Link
                          href={`/api/admin/comments/${comment.id}/delete`}
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
                    暂无评论数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* 分页 */}
        {comments.length > 0 && (
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
                  显示 <span className="font-medium">1</span> 到 <span className="font-medium">{comments.length}</span> 项，共 <span className="font-medium">{comments.length}</span> 项
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <a
                    href="#"
                    className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                  >
                    1
                  </a>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 