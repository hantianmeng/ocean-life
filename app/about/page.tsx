import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import OceanIllustration from '@/app/components/OceanIllustration';

async function getAboutSettings() {
  try {
    // 获取设置
    const settings = await prisma.Setting.findMany();
    
    // 转换为对象
    const settingsObj: Record<string, string> = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    
    return {
      siteName: settingsObj.siteName || '珠有泪海洋生物科普网',
      siteDescription: settingsObj.siteDescription || '探索海洋奥秘，关爱海洋生命',
      contactEmail: settingsObj.contactEmail || 'contact@oceanedu.com',
      contactPhone: settingsObj.contactPhone || '123-456-7890',
      address: settingsObj.address || '广东省深圳市南山区科技园'
    };
  } catch (error) {
    console.error('获取关于页面设置时出错:', error);
    // 返回默认值
    return {
      siteName: '珠有泪海洋生物科普网',
      siteDescription: '探索海洋奥秘，关爱海洋生命',
      contactEmail: 'contact@oceanedu.com',
      contactPhone: '123-456-7890',
      address: '广东省深圳市南山区科技园'
    };
  }
}

export async function generateMetadata() {
  const { siteName } = await getAboutSettings();
  
  return {
    title: `关于我们 - ${siteName}`,
    description: `了解${siteName}的使命、愿景和团队`
  };
}

export default async function AboutPage() {
  const { siteName, siteDescription, contactEmail, contactPhone, address } = await getAboutSettings();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">关于{siteName}</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:w-1/2 p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-4">我们的使命</h2>
            <p className="text-gray-700 mb-4">
              {siteName}致力于通过高质量的科普内容，帮助公众了解海洋生物的多样性和重要性，提高公众的环保意识，共同保护海洋生态环境。
            </p>
            <h2 className="text-xl font-bold text-blue-800 mb-4">我们的愿景</h2>
            <p className="text-gray-700">
              我们希望成为中国最权威、最全面的海洋生物科普平台，让每一个人都能轻松获取海洋知识，爱上神奇的海洋世界。{siteDescription}
            </p>
          </div>
          
          <div className="md:w-1/2 relative h-80 md:h-auto">
            <div className="h-full w-full">
              <OceanIllustration />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">我们的团队</h2>
        <div className="bg-blue-50 p-6 rounded-lg">
          <p className="text-gray-700 mb-4">
            我们的团队由一群热爱海洋的专业人士组成，包括海洋生物学家、环保工作者、内容创作者和技术开发人员。每一位成员都为网站的内容和功能做出了重要贡献。
          </p>
          <p className="text-gray-700">
            我们与国内外多家海洋研究机构、海洋保护组织保持合作，确保我们提供的信息准确可靠。
          </p>
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">联系我们</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-700 mb-4">
            如果您有任何问题、建议或合作意向，欢迎与我们联系。
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-2">联系方式</h3>
              <p className="text-gray-700 mb-1">邮箱：{contactEmail}</p>
              <p className="text-gray-700 mb-1">电话：{contactPhone}</p>
              <p className="text-gray-700 mb-1">地址：{address}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-2">关注我们</h3>
              <p className="text-gray-700 mb-1">微信公众号：珠有泪海洋科普</p>
              <p className="text-gray-700 mb-1">微博：@珠有泪海洋生物科普网</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <Link 
          href="/categories" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition-colors"
        >
          探索海洋生物分类
        </Link>
      </div>
    </div>
  );
} 