import { prisma } from '@/app/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CommentSection from '@/app/components/CommentSection';
import { getCachedData } from '@/lib/cache';

// 生成元数据
export async function generateMetadata({ params }: { params: { id: string } }) {
  // 确保params是已解析的
  const id = params?.id;
  if (!id) return { title: '物种不存在 - 海洋生物科普网' };

  const species = await prisma.species.findUnique({
    where: { id },
    select: {
      name: true,
      description: true
    }
  });

  if (!species) {
    return {
      title: '物种不存在 - 海洋生物科普网',
    };
  }

  return {
    title: `${species.name} - 海洋生物科普网`,
    description: species.description || `了解关于${species.name}的详细信息`,
  };
}

export default async function SpeciesPage({ params }: { params: { id: string } }) {
  // 确保params是已解析的
  const id = params?.id;
  if (!id) notFound();

  // 使用缓存获取物种数据
  const cacheKey = `species_${id}`;
  const species = await getCachedData(
    cacheKey,
    async () => {
      return prisma.species.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          scientificName: true,
          foreignName: true,
          protectionLevel: true,
          description: true,
          habitat: true,
          distribution: true,
          altitude: true,
          habits: true,
          reproduction: true,
          isEdible: true,
          cookingMethods: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true
            }
          },
          images: {
            select: {
              id: true,
              url: true,
              caption: true
            }
          },
          comments: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              user: {
                select: {
                  name: true,
                  id: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
    },
    // 缓存5分钟
    1000 * 60 * 5
  );

  if (!species) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link 
          href={`/categories/${species.categoryId}`} 
          className="text-blue-600 hover:underline inline-flex items-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
          返回{species.category.name}
        </Link>
      </div>

      {/* 物种头部信息 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:w-1/2">
            {species.images.length > 0 ? (
              <div className="relative h-80 md:h-full">
                <Image
                  src={species.images[0].url}
                  alt={species.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ) : (
              <div className="h-80 md:h-full bg-blue-100 flex items-center justify-center text-blue-500">
                <p>暂无图片</p>
              </div>
            )}
          </div>
          
          <div className="md:w-1/2 p-6">
            <div className="flex items-center mb-4">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {species.category.name}
              </span>
              {species.protectionLevel && (
                <span className="bg-red-100 text-red-800 text-xs font-medium ml-2 px-2.5 py-0.5 rounded-full">
                  保护级别: {species.protectionLevel}
                </span>
              )}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-blue-800 mb-2">{species.name}</h1>
            <p className="text-gray-600 italic mb-4">{species.scientificName}</p>
            
            {species.foreignName && (
              <p className="text-gray-700 mb-4">
                <span className="font-semibold">外文名称：</span> {species.foreignName}
              </p>
            )}
            
            {species.description && (
              <div className="mb-4">
                <p className="text-gray-700">{species.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 物种详细信息 */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4">栖息地信息</h2>
          
          {species.habitat && (
            <div className="mb-4">
              <h3 className="text-blue-700 font-semibold mb-1">栖息地</h3>
              <p className="text-gray-700">{species.habitat}</p>
            </div>
          )}
          
          {species.distribution && (
            <div className="mb-4">
              <h3 className="text-blue-700 font-semibold mb-1">分布区域</h3>
              <p className="text-gray-700">{species.distribution}</p>
            </div>
          )}
          
          {species.altitude && (
            <div>
              <h3 className="text-blue-700 font-semibold mb-1">海拔高度</h3>
              <p className="text-gray-700">{species.altitude}</p>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4">生活特性</h2>
          
          {species.habits && (
            <div className="mb-4">
              <h3 className="text-blue-700 font-semibold mb-1">生活习性</h3>
              <p className="text-gray-700">{species.habits}</p>
            </div>
          )}
          
          {species.reproduction && (
            <div>
              <h3 className="text-blue-700 font-semibold mb-1">繁殖方式</h3>
              <p className="text-gray-700">{species.reproduction}</p>
            </div>
          )}
        </div>
      </div>

      {/* 食用相关信息 */}
      {species.isEdible && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-800 mb-4">食用信息</h2>
          <div className="flex items-center mb-4">
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              可食用
            </span>
          </div>
          
          {species.cookingMethods && (
            <div>
              <h3 className="text-blue-700 font-semibold mb-1">烹饪方法</h3>
              <p className="text-gray-700">{species.cookingMethods}</p>
            </div>
          )}
        </div>
      )}

      {/* 更多图片展示 */}
      {species.images.length > 1 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-blue-800 mb-4">更多图片</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {species.images.slice(1).map((image) => (
              <div key={image.id} className="relative h-48 rounded-lg overflow-hidden">
                <Image
                  src={image.url}
                  alt={species.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  style={{ objectFit: 'cover' }}
                  className="hover:scale-105 transition-transform duration-300"
                />
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
                    {image.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 评论区 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-blue-800 mb-4">评论区</h2>
        <CommentSection speciesId={species.id} comments={species.comments} />
      </div>
    </div>
  );
} 