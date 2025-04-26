'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
  };
};

type CommentSectionProps = {
  speciesId: string;
  comments: Comment[];
};

export default function CommentSection({ speciesId, comments }: CommentSectionProps) {
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: commentText,
          speciesId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }
      
      setCommentText('');
      router.refresh(); // 刷新页面以显示新评论
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('评论提交失败，请确保您已登录并稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  // 格式化时间
  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true,
      locale: zhCN
    });
  };

  return (
    <div>
      {/* 评论列表 */}
      <div className="mb-8">
        {comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-100 pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-blue-800">
                    {comment.user.name || '匿名用户'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(comment.createdAt)}
                  </div>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            暂无评论，成为第一个评论的人吧！
          </div>
        )}
      </div>

      {/* 评论表单 */}
      <form onSubmit={handleSubmitComment} className="mt-6">
        <div className="mb-4">
          <label htmlFor="comment" className="block text-gray-700 mb-2">
            发表评论
          </label>
          <textarea
            id="comment"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="分享您的想法..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !commentText.trim()}
          className={`px-4 py-2 rounded-md text-white ${
            isLoading || !commentText.trim()
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors`}
        >
          {isLoading ? '提交中...' : '发表评论'}
        </button>
      </form>
    </div>
  );
} 