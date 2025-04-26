import Image from 'next/image';
import Link from 'next/link';
import { GiSadCrab } from 'react-icons/gi';

type SpeciesCardProps = {
  species: {
    id: string;
    name: string;
    scientificName: string;
    description: string | null;
    protectionLevel: string | null;
    images: {
      id: string;
      url: string;
    }[];
  };
};

export default function SpeciesCard({ species }: SpeciesCardProps) {
  return (
    <Link href={`/species/${species.id}`}>
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        <div className="relative h-48 w-full">
          {species.images.length > 0 ? (
            <Image
              src={species.images[0].url}
              alt={species.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-blue-100 flex items-center justify-center text-blue-500">
              <GiSadCrab size={48} />
            </div>
          )}
          
          {species.protectionLevel && (
            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {species.protectionLevel}
            </div>
          )}
        </div>
        
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="text-lg font-semibold text-blue-800 mb-1">{species.name}</h3>
          <p className="text-gray-500 text-sm italic mb-2">{species.scientificName}</p>
          
          {species.description && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{species.description}</p>
          )}
          
          <div className="mt-auto text-blue-600 text-sm font-medium flex items-center">
            查看详情
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