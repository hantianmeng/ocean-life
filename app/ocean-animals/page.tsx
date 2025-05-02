import { getAllOceanAnimals } from '@/lib/supabase';

export const revalidate = 3600; // 每小时重新验证一次

export default async function OceanAnimalsPage() {
  // 从Supabase获取海洋动物数据
  const animals = await getAllOceanAnimals();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-8">海洋生物数据库</h1>
      <p className="text-gray-600 mb-6">
        这些数据来自于 Supabase 数据库，展示了各种海洋生物及其特性。
      </p>

      {animals.length > 0 ? (
        <div className="grid gap-6">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物种</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">栖息地</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">濒危状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {animals.map((animal) => (
                  <tr key={animal.id} className="hover:bg-blue-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{animal.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{animal.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{animal.species}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{animal.habitat}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">{animal.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${animal.endangered ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {animal.endangered ? '濒危' : '安全'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 p-8 rounded-lg text-center">
          <p className="text-blue-600">暂无数据，或者连接 Supabase 时出现问题。</p>
        </div>
      )}
    </div>
  );
} 