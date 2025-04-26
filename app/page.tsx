import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import FeaturedCarousel from './components/FeaturedCarousel';
import CategoryCard from './components/CategoryCard';
import { unstable_cache } from 'next/cache';

// 使用缓存优化设置获取
const getCachedSettings = unstable_cache(
  async () => {
    try {
      // 获取设置
      const settings = await prisma.Setting.findMany();
      
      // 转换为对象
      const settingsObj: Record<string, string> = {};
      settings.forEach(setting => {
        settingsObj[setting.key] = setting.value;
      });
      
      // 设置默认值
      const featuredCount = parseInt(settingsObj.homePageFeaturedCount || '6', 10);
      const siteName = settingsObj.siteName || '珠有泪海洋生物科普网';
      const siteDescription = settingsObj.siteDescription || '探索海洋奥秘，关爱海洋生命';
      
      return {
        featuredCount,
        siteName,
        siteDescription
      };
    } catch (error) {
      console.error('获取设置时出错:', error);
      // 返回默认值
      return {
        featuredCount: 6,
        siteName: '珠有泪海洋生物科普网',
        siteDescription: '探索海洋奥秘，关爱海洋生命'
      };
    }
  },
  ['site-settings'],
  { revalidate: 60 * 5 } // 5分钟缓存
);

// 替换原有函数
async function getSettings() {
  return getCachedSettings();
}

// 使用缓存优化分类获取
const getCachedCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    });
  },
  ['home-categories'],
  { revalidate: 60 * 5 } // 5分钟缓存
);

// 使用并行数据预取
export default async function Home() {
  // 并行请求数据，减少串行等待时间
  const [featuredSpecies, categories, settings] = await Promise.all([
    // 获取推荐物种
    prisma.species.findMany({
      where: { isFeatured: true },
      select: {
        id: true,
        name: true,
        scientificName: true,
        description: true,
        category: {
          select: {
            id: true,
            name: true
          }
        },
        images: {
          take: 1,
          select: {
            url: true
          }
        }
      },
      take: 6
    }),
    
    // 获取所有分类
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true,
        _count: {
          select: { species: true }
        }
      }
    }),
    
    // 获取网站设置
    prisma.setting.findMany()
  ]);

  // 转换设置为可用格式
  const settingsObj: Record<string, string> = {};
  settings.forEach(setting => {
    settingsObj[setting.key] = setting.value;
  });

  // 渲染首页
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 特色物种轮播 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-blue-800 mb-6">特色海洋生物</h2>
        {featuredSpecies.length > 0 ? (
          <FeaturedCarousel species={featuredSpecies} />
        ) : (
          <div className="bg-blue-50 p-8 rounded-lg text-center">
            <p className="text-blue-600">暂无特色物种，敬请期待！</p>
          </div>
        )}
      </section>

      {/* 海洋生物分类 */}
      <section>
        <h2 className="text-2xl font-bold text-blue-800 mb-6">海洋生物分类</h2>
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <div className="bg-blue-50 p-8 rounded-lg text-center">
            <p className="text-blue-600">暂无分类，敬请期待！</p>
          </div>
        )}
      </section>

      {/* 关于网站 */}
      <section className="mt-12 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">{settingsObj.siteName}</h2>
        <p className="text-gray-700">{settingsObj.siteDescription}</p>
        <div className="mt-4">
          <Link href="/about" className="text-blue-600 hover:underline">
            了解更多 &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
