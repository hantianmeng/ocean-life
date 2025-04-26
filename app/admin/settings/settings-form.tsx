'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { MdSave } from 'react-icons/md';

// 默认设置值
const defaultSettings = {
  siteName: '珠有泪海洋生物科普网',
  siteDescription: '探索海洋奥秘，关爱海洋生命',
  contactEmail: 'contact@oceanedu.com',
  contactPhone: '123-456-7890',
  address: '广东省深圳市南山区科技园',
  icp: '粤ICP备XXXXXXXX号',
  footerText: '© 2023 珠有泪海洋生物科普网 版权所有',
  homePageFeaturedCount: 6,
  commentModeration: false,
};

export default function SettingsForm() {
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 设置项目类型
  const settingFields = [
    { key: 'siteName', label: '网站名称', type: 'text' },
    { key: 'siteDescription', label: '网站描述', type: 'textarea' },
    { key: 'contactEmail', label: '联系邮箱', type: 'email' },
    { key: 'contactPhone', label: '联系电话', type: 'text' },
    { key: 'address', label: '地址', type: 'text' },
    { key: 'icp', label: 'ICP备案号', type: 'text' },
    { key: 'footerText', label: '页脚文本', type: 'text' },
    { key: 'homePageFeaturedCount', label: '首页推荐物种数量', type: 'number' },
    { key: 'commentModeration', label: '评论需要审核', type: 'checkbox' },
  ];

  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings({...defaultSettings, ...data.settings});
        }
      } catch (error) {
        console.error('加载设置失败:', error);
        toast.error('加载设置失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });

      if (response.ok) {
        toast.success('设置已保存');
      } else {
        const data = await response.json();
        toast.error(`保存失败: ${data.message || '未知错误'}`);
      }
    } catch (error) {
      console.error('保存设置时出错:', error);
      toast.error('保存设置时出错');
    } finally {
      setIsSaving(false);
    }
  };

  // 处理字段变化
  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">正在加载设置...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingFields.map((field) => (
          <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
            <label 
              htmlFor={field.key} 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
            </label>
            
            {field.type === 'textarea' ? (
              <textarea
                id={field.key}
                rows={3}
                value={settings[field.key as keyof typeof settings] as string}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            ) : field.type === 'checkbox' ? (
              <div className="flex items-center">
                <input
                  id={field.key}
                  type="checkbox"
                  checked={settings[field.key as keyof typeof settings] as boolean}
                  onChange={(e) => handleChange(field.key, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-500">
                  启用此选项将使新评论需要管理员审核后才会显示
                </span>
              </div>
            ) : (
              <input
                id={field.key}
                type={field.type}
                value={settings[field.key as keyof typeof settings] as string | number}
                onChange={(e) => {
                  const value = field.type === 'number' 
                    ? parseInt(e.target.value, 10) 
                    : e.target.value;
                  handleChange(field.key, value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <MdSave className="mr-2" />
          {isSaving ? '保存中...' : '保存设置'}
        </button>
      </div>
    </form>
  );
} 