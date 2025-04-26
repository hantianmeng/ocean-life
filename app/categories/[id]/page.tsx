import { prisma } from '@/app/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SpeciesCard from '@/app/components/SpeciesCard';
import { getCachedData } from '@/lib/cache';

// 设置元数据
export async function generateMetadata({ params }: { params: { id: string } }) {
  // 确保params是已解析的
  const id = params?.id;
  if (!id) return { title: '分类不存在 - 海洋生物科普网' };

  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      name: true,
      description: true
    }
  });

  if (!category) {
    return {
      title: '分类不存在 - 海洋生物科普网',
    };
  }

  return {
    title: `${category.name} - 海洋生物科普网`,
    description: category.description || `探索${category.name}的所有物种`,
  };
}

export default async function CategoryPage({ params }: { params: { id: string } }) {
  // 确保params是已解析的
  const id = params?.id;
  if (!id) notFound();

  // 使用缓存获取分类数据
  const cacheKey = `category_${id}`;
  const category = await getCachedData(
    cacheKey,
    async () => {
      return prisma.category.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          species: {
            select: {
              id: true,
              name: true,
              scientificName: true,
              description: true,
              protectionLevel: true,
              isEdible: true,
              isFeatured: true,
              images: {
                take: 1,
                select: {
                  id: true,
                  url: true
                }
              }
            }
          }
        }
      });
    },
    // 缓存5分钟
    1000 * 60 * 5
  );

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/categories" className="text-blue-600 hover:underline inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回所有分类
        </Link>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-4">{category.name}</h1>
        {category.description && (
          <p className="text-gray-700">{category.description}</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-800 mb-6">物种列表</h2>
        {category.species.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {category.species.map((species) => (
              <SpeciesCard key={species.id} species={species} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-600">该分类下暂无物种数据</p>
          </div>
        )}
      </div>
    </div>
  );
} 