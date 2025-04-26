import { prisma } from '@/app/lib/db';
import Link from 'next/link';
import { MdCategory, MdComment, MdPerson } from 'react-icons/md';
import { GiSharkFin } from 'react-icons/gi';

export const metadata = {
  title: '控制面板 - 珠有泪海洋生物科普网管理后台',
};

export default async function AdminDashboard() {
  // 获取统计数据
  const categoriesCount = await prisma.category.count();
  const speciesCount = await prisma.species.count();
  const commentsCount = await prisma.comment.count();
  const usersCount = await prisma.user.count();

  // 获取最近添加的物种
  const recentSpecies = await prisma.species.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      category: true,
    },
  });

  // 获取最近的评论
  const recentComments = await prisma.comment.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
      species: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">控制面板</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <MdCategory className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">分类数量</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">{categoriesCount}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/admin/categories" className="font-medium text-blue-600 hover:text-blue-500">
                查看所有分类
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <GiSharkFin className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">物种数量</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">{speciesCount}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/admin/species" className="font-medium text-blue-600 hover:text-blue-500">
                查看所有物种
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <MdComment className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">评论数量</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">{commentsCount}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/admin/comments" className="font-medium text-blue-600 hover:text-blue-500">
                查看所有评论
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <MdPerson className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">用户数量</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">{usersCount}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/admin/users" className="font-medium text-blue-600 hover:text-blue-500">
                查看所有用户
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 最近添加物种 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">最近添加的物种</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentSpecies.length > 0 ? (
              recentSpecies.map((species) => (
                <div key={species.id} className="px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-base font-medium text-gray-900">{species.name}</h4>
                      <p className="text-sm text-gray-500">
                        分类: {species.category.name}
                      </p>
                    </div>
                    <Link 
                      href={`/admin/species/${species.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      查看
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-4 text-center text-gray-500">
                暂无数据
              </div>
            )}
          </div>
          <div className="bg-gray-50 px-6 py-3 rounded-b-lg">
            <div className="text-sm">
              <Link href="/admin/species/new" className="font-medium text-blue-600 hover:text-blue-500">
                添加新物种
              </Link>
            </div>
          </div>
        </div>

        {/* 最近评论 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">最近评论</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentComments.length > 0 ? (
              recentComments.map((comment) => (
                <div key={comment.id} className="px-6 py-4">
                  <div className="mb-1">
                    <h4 className="text-base font-medium text-gray-900">
                      {comment.user.name || '匿名用户'} 
                      <span className="text-sm font-normal text-gray-500"> 评论了 </span>
                      {comment.species.name}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{comment.content}</p>
                  <div className="mt-1 text-right">
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-4 text-center text-gray-500">
                暂无数据
              </div>
            )}
          </div>
          <div className="bg-gray-50 px-6 py-3 rounded-b-lg">
            <div className="text-sm">
              <Link href="/admin/comments" className="font-medium text-blue-600 hover:text-blue-500">
                查看所有评论
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 