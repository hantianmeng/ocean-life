import Link from 'next/link';
import { GiWaterDrop } from 'react-icons/gi';
import prisma from '@/lib/prisma';

async function getFooterSettings() {
  try {
    // 获取设置
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['footerText']
        }
      }
    });
    
    // 转换为对象
    const settingsObj: Record<string, string> = {};
    settings.forEach((setting: { key: string, value: string }) => {
      settingsObj[setting.key] = setting.value;
    });
    
    return {
      footerText: settingsObj.footerText || `© ${new Date().getFullYear()} 珠有泪海洋生物科普网 版权所有`
    };
  } catch (error) {
    console.error('获取页脚设置时出错:', error);
    // 返回默认值
    return {
      footerText: `© ${new Date().getFullYear()} 珠有泪海洋生物科普网 版权所有`
    };
  }
}

const Footer = async () => {
  const { footerText } = await getFooterSettings();
  
  return (
    <footer className="bg-blue-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-end">
          <div className="text-right">
            <p className="text-blue-300 mb-2">{footerText}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 