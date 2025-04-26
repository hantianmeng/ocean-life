import Link from 'next/link';
import { FaGamepad } from 'react-icons/fa';

export default function GameLink() {
  return (
    <Link 
      href="/game/fish-eat-fish" 
      className="inline-flex items-center gap-2 text-white hover:text-blue-200 transition-colors px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-md"
    >
      <FaGamepad className="text-lg" />
      <span>趣味游戏</span>
    </Link>
  );
} 