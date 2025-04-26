'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MdArrowBack, MdCloudUpload } from 'react-icons/md';
import Image from 'next/image';

interface UploadStatus {
  uploading: boolean;
  error: string;
  preview: string;
}

export default function NewCategoryPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
  });
  
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    uploading: false,
    error: '',
    preview: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      setUploadStatus({
        uploading: false,
        error: '只能上传图片文件',
        preview: '',
      });
      return;
    }
    
    // 设置预览图
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      setUploadStatus(prev => ({
        ...prev,
        preview: typeof result === 'string' ? result : '',
      }));
    };
    reader.readAsDataURL(file);
    
    // 上传图片
    setUploadStatus({
      uploading: true,
      error: '',
      preview: uploadStatus.preview,
    });
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '图片上传失败');
      }
      
      // 上传成功
      setFormData(prev => ({ ...prev, imageUrl: data.url }));
      
      setUploadStatus({
        uploading: false,
        error: '',
        preview: uploadStatus.preview,
      });
    } catch (error: any) {
      console.error('Image upload error:', error);
      setUploadStatus({
        uploading: false,
        error: error.message || '图片上传失败，请重试',
        preview: uploadStatus.preview,
      });
    }
  };
  
  // 点击上传区域触发文件选择
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('请输入分类名称');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '添加分类失败');
      }
      
      // 添加成功，返回分类列表页
      router.push('/admin/categories');
      router.refresh();
    } catch (error: any) {
      console.error('Error adding category:', error);
      setError(error.message || '添加分类时发生错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link 
          href="/admin/categories" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <MdArrowBack className="mr-1" /> 返回分类列表
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">添加新分类</h3>
          <p className="mt-1 text-sm text-gray-500">
            填写下列表单添加新的海洋生物分类
          </p>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                分类名称 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="例如：鱼类、哺乳类、甲壳类"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                分类描述
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="请输入该分类的描述信息..."
                ></textarea>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                分类图片
              </label>
              <div 
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50"
                onClick={triggerFileInput}
              >
                <div className="space-y-1 text-center">
                  {uploadStatus.preview ? (
                    // 显示上传预览图
                    <div className="flex flex-col items-center">
                      <div className="relative w-32 h-32 mb-4">
                        <Image 
                          src={uploadStatus.preview}
                          alt="预览图" 
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      {formData.imageUrl ? (
                        <p className="text-sm text-green-600">图片上传成功</p>
                      ) : uploadStatus.uploading ? (
                        <p className="text-sm text-blue-500">正在上传...</p>
                      ) : uploadStatus.error ? (
                        <p className="text-sm text-red-500">{uploadStatus.error}</p>
                      ) : (
                        <p className="text-sm text-blue-500">点击重新上传</p>
                      )}
                    </div>
                  ) : (
                    // 无图片状态
                    <>
                      <MdCloudUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>上传图片</span>
                        </label>
                        <p className="pl-1">或拖拽图片到此处</p>
                      </div>
                      <p className="text-xs text-gray-500">支持PNG、JPG、GIF等格式，最大10MB</p>
                    </>
                  )}
                </div>
              </div>
              {/* 文件输入元素 */}
              <input
                id="file-upload"
                ref={fileInputRef}
                name="file-upload"
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {uploadStatus.error && (
                <p className="mt-2 text-sm text-red-600">{uploadStatus.error}</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <Link
                href="/admin/categories"
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  loading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {loading ? '提交中...' : '添加分类'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 