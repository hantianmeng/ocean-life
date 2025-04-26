import { prisma } from '@/app/lib/db';
import Link from 'next/link';
import CategoryCard from '@/app/components/CategoryCard';

export const metadata = {
  title: '海洋生物分类 - 珠有泪海洋生物科普网',
  description: '浏览珠有泪海洋生物科普网的各类海洋生物分类',
};

export default async function CategoriesPage() {
  // 获取所有分类
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
    include: {
      species: {
        select: {
          id: true,
        },
      },
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">海洋生物分类</h1>
      
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <p className="text-gray-700">
          海洋生物种类繁多，可以按照不同的分类系统进行分类。这里我们提供了主要的海洋生物分类，您可以点击任意分类查看相关物种的详细信息。
        </p>
      </div>
      
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={{
                id: category.id,
                name: category.name,
                description: category.description,
                imageUrl: category.imageUrl,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600">暂无分类数据</p>
        </div>
      )}
    </div>
  );
} 