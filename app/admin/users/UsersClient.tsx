'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { MdDelete } from 'react-icons/md';

export default function UsersClient({ users }: { 
  users: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: Date;
    _count: { comments: number };
  }> 
}) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">用户管理</h1>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评论数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注册时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} data-user-id={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user._count.comments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {user.role !== 'ADMIN' && (
                        <DeleteUserButton userId={user.id} userName={user.name || '未命名用户'} />
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    没有找到用户数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between items-center">
            <p className="text-sm text-gray-700">
              共 <span id="userCount" className="font-medium">{users.length}</span> 个用户
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 格式化时间函数
function formatDate(date: Date) {
  // 简化的日期格式化，避免使用库
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  
  if (years > 0) return `${years}年前`;
  if (months > 0) return `${months}个月前`;
  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return '刚刚';
}

function DeleteUserButton({ userId, userName }: { userId: string, userName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/users/${userId}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('用户删除成功');
        // 移除DOM中的用户行而不刷新页面
        const userRow = document.querySelector(`tr[data-user-id="${userId}"]`);
        if (userRow) {
          userRow.remove();
          // 更新计数
          const countElement = document.getElementById('userCount');
          if (countElement) {
            const currentCount = parseInt(countElement.textContent || '0', 10);
            countElement.textContent = (currentCount - 1).toString();
          }
        }
        setShowConfirm(false);
      } else {
        const data = await response.json();
        alert(`删除失败: ${data.message || '未知错误'}`);
      }
    } catch (error) {
      alert('删除过程中发生错误');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center text-red-600 hover:text-red-900 disabled:opacity-50"
        disabled={isDeleting}
      >
        <MdDelete className="mr-1" />
        {isDeleting ? '处理中...' : '删除'}
      </button>
      
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">确认删除</h3>
            <p className="text-sm text-gray-600 mb-6">
              您确定要删除用户 <span className="font-semibold">{userName}</span> 吗？此操作不可撤销，且会删除该用户的所有评论。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none"
                disabled={isDeleting}
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 