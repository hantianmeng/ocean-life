import Image from 'next/image';
import Link from 'next/link';
import { GiWaterDrop } from 'react-icons/gi';

type CategoryCardProps = {
  category: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
  };
};

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.id}`}>
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
        <div className="relative h-48 w-full">
          {category.imageUrl ? (
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="h-full w-full bg-blue-100 flex items-center justify-center text-blue-500">
              <GiWaterDrop size={48} />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">{category.name}</h3>
          {category.description && (
            <p className="text-gray-600 text-sm line-clamp-2">{category.description}</p>
          )}
          <div className="mt-4 text-blue-600 text-sm font-medium flex items-center">
            查看此分类
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
} 