'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MdArrowBack, MdCloudUpload } from 'react-icons/md';
import Image from 'next/image';
import { use } from 'react';

// 定义类型
interface Category {
  id: string;
  name: string;
}

interface SpeciesImage {
  id: string;
  url: string;
  caption: string | null;
}

interface Species {
  id: string;
  name: string;
  scientificName: string;
  foreignName: string | null;
  protectionLevel: string | null;
  description: string | null;
  habitat: string | null;
  distribution: string | null;
  altitude: string | null;
  habits: string | null;
  reproduction: string | null;
  isEdible: boolean;
  cookingMethods: string | null;
  isFeatured: boolean;
  categoryId: string;
  images: SpeciesImage[];
}

interface UploadStatus {
  uploading: boolean;
  error: string;
  preview: string;
}

type PageParams = {
  params: { id: string };
}

export default function EditSpeciesPage({ params }: PageParams) {
  const router = useRouter();
  const speciesId = use(params).id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [species, setSpecies] = useState<Species | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    scientificName: '',
    foreignName: '',
    protectionLevel: '',
    description: '',
    habitat: '',
    distribution: '',
    altitude: '',
    habits: '',
    reproduction: '',
    isEdible: false,
    cookingMethods: '',
    isFeatured: false,
    categoryId: '',
  });
  
  // 图片上传状态
  const [currentImage, setCurrentImage] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    uploading: false,
    error: '',
    preview: '',
  });
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFetching, setIsFetching] = useState(true);

  // 获取物种数据
  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        setIsFetching(true);
        const response = await fetch(`/api/admin/species/${speciesId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || '无法获取物种数据');
        }
        
        setSpecies(data);

        // 设置表单数据
        setFormData({
          name: data.name || '',
          scientificName: data.scientificName || '',
          foreignName: data.foreignName || '',
          protectionLevel: data.protectionLevel || '',
          description: data.description || '',
          habitat: data.habitat || '',
          distribution: data.distribution || '',
          altitude: data.altitude || '',
          habits: data.habits || '',
          reproduction: data.reproduction || '',
          isEdible: data.isEdible || false,
          cookingMethods: data.cookingMethods || '',
          isFeatured: data.isFeatured || false,
          categoryId: data.categoryId || '',
        });

        // 设置当前图片
        if (data.images && data.images.length > 0) {
          setCurrentImage(data.images[0].url);
        }
      } catch (error: any) {
        console.error('Error fetching species:', error);
        setError(error.message || '获取物种数据失败');
      } finally {
        setIsFetching(false);
      }
    };

    // 获取所有分类
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        const data = await response.json();
        if (response.ok) {
          // 处理新的API响应格式
          if (data.categories) {
            // 新格式：{ categories: [...], pagination: {...} }
            setCategories(data.categories);
          } else {
            // 旧格式，直接是数组
            setCategories(data);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    if (speciesId) {
      fetchSpecies();
      fetchCategories();
    }
  }, [speciesId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      setNewImageUrl(data.url);
      
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

  // 处理下拉选择框变更
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.scientificName.trim() || !formData.categoryId) {
      setError('请填写必填字段（名称、学名和分类）');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/admin/species/${speciesId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          species: formData,
          newImageUrl: newImageUrl, // 如果上传了新图片，发送新图片URL
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '更新物种失败');
      }
      
      // 更新成功，返回物种列表页
      router.push('/admin/species');
      router.refresh();
    } catch (error: any) {
      console.error('Error updating species:', error);
      setError(error.message || '更新物种时发生错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  // 点击上传区域触发文件选择
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (isFetching) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">加载物种数据...</p>
        </div>
      </div>
    );
  }

  if (!species && !isFetching) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">
          <p>未找到物种数据或加载失败</p>
          <Link href="/admin/species" className="mt-4 inline-block text-blue-600 hover:underline">
            返回物种列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link 
          href="/admin/species" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <MdArrowBack className="mr-1" /> 返回物种列表
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">编辑物种</h3>
          <p className="mt-1 text-sm text-gray-500">
            修改现有海洋生物物种信息
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* 基本信息 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  物种名称 <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="例如：蓝鲸、大白鲨"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="scientificName" className="block text-sm font-medium text-gray-700">
                  学名 <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="scientificName"
                    id="scientificName"
                    value={formData.scientificName}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="例如：Balaenoptera musculus"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="foreignName" className="block text-sm font-medium text-gray-700">
                  外文名
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="foreignName"
                    id="foreignName"
                    value={formData.foreignName}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="例如：Blue Whale"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                  所属分类 <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  >
                    <option value="">请选择分类</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="protectionLevel" className="block text-sm font-medium text-gray-700">
                  保护级别
                </label>
                <div className="mt-1">
                  <select
                    id="protectionLevel"
                    name="protectionLevel"
                    value={formData.protectionLevel || ''}
                    onChange={handleSelectChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">请选择保护级别</option>
                    <option value="一级保护动物">一级保护动物</option>
                    <option value="二级保护动物">二级保护动物</option>
                    <option value="无">无</option>
                  </select>
                </div>
              </div>
              
              {/* 图片上传区域 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">物种图片</label>
                <div 
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50"
                  onClick={triggerFileInput}
                >
                  <div className="space-y-1 text-center">
                    {uploadStatus.preview ? (
                      // 显示新上传预览图
                      <div className="flex flex-col items-center">
                        <div className="relative w-32 h-32 mb-4">
                          <Image 
                            src={uploadStatus.preview}
                            alt="预览图" 
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        {newImageUrl ? (
                          <p className="text-sm text-green-600">图片上传成功</p>
                        ) : uploadStatus.uploading ? (
                          <p className="text-sm text-blue-500">正在上传...</p>
                        ) : uploadStatus.error ? (
                          <p className="text-sm text-red-500">{uploadStatus.error}</p>
                        ) : (
                          <p className="text-sm text-blue-500">点击重新上传</p>
                        )}
                      </div>
                    ) : currentImage ? (
                      // 显示现有图片
                      <div className="flex flex-col items-center">
                        <div className="relative w-32 h-32 mb-4">
                          <Image 
                            src={currentImage}
                            alt="当前图片" 
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <p className="text-sm text-blue-500">点击更换图片</p>
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
            </div>
            
            {/* 详细描述 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                物种描述
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="请输入物种的详细描述..."
                ></textarea>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="habitat" className="block text-sm font-medium text-gray-700">
                  栖息地
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="habitat"
                    id="habitat"
                    value={formData.habitat}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="distribution" className="block text-sm font-medium text-gray-700">
                  分布区域
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="distribution"
                    id="distribution"
                    value={formData.distribution}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="altitude" className="block text-sm font-medium text-gray-700">
                  生活水深
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="altitude"
                    id="altitude"
                    value={formData.altitude}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="habits" className="block text-sm font-medium text-gray-700">
                生活习性
              </label>
              <div className="mt-1">
                <textarea
                  id="habits"
                  name="habits"
                  rows={3}
                  value={formData.habits}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                ></textarea>
              </div>
            </div>
            
            <div>
              <label htmlFor="reproduction" className="block text-sm font-medium text-gray-700">
                繁殖方式
              </label>
              <div className="mt-1">
                <textarea
                  id="reproduction"
                  name="reproduction"
                  rows={3}
                  value={formData.reproduction}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                ></textarea>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="isEdible"
                  name="isEdible"
                  type="checkbox"
                  checked={formData.isEdible}
                  onChange={handleChange}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="isEdible" className="font-medium text-gray-700">
                  可食用
                </label>
                <p className="text-gray-500">勾选表示该物种可以食用</p>
              </div>
            </div>
            
            {formData.isEdible && (
              <div>
                <label htmlFor="cookingMethods" className="block text-sm font-medium text-gray-700">
                  烹饪方法
                </label>
                <div className="mt-1">
                  <textarea
                    id="cookingMethods"
                    name="cookingMethods"
                    rows={3}
                    value={formData.cookingMethods}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  ></textarea>
                </div>
              </div>
            )}
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="isFeatured"
                  name="isFeatured"
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="isFeatured" className="font-medium text-gray-700">
                  特色物种
                </label>
                <p className="text-gray-500">勾选表示在首页特色物种轮播中显示</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-5">
              <Link
                href="/admin/species"
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
                {loading ? '保存中...' : '保存修改'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 