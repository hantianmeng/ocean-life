import { Metadata } from 'next';
import SettingsForm from './settings-form';

export const metadata: Metadata = {
  title: '网站设置 - 珠有泪海洋生物科普网管理后台',
  description: '管理网站基本信息和设置',
};

export default function SettingsPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">网站设置</h1>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        <SettingsForm />
      </div>
    </div>
  );
} 