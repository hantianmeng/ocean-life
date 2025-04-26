import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { getCachedData, invalidateCache } from '@/lib/cache';

const SETTINGS_CACHE_KEY = 'app_settings';

// 默认设置
const defaultSettings = {
  siteTitle: '海洋生物科普',
  siteDescription: '探索海洋生物的奥秘',
  contactEmail: 'contact@example.com',
  featuredSpeciesCount: '6',
  footerText: '© 2023 海洋生物科普',
  allowComments: 'true'
};

/**
 * 获取所有网站设置
 */
export async function GET() {
  try {
    // 使用缓存获取设置
    const settings = await getCachedData(
      SETTINGS_CACHE_KEY,
      async () => {
        // 缓存未命中时从数据库获取设置
        const dbSettings = await prisma.setting.findMany();
        
        // 转换为对象格式方便前端使用
        const settingsObject: Record<string, string> = {};
        dbSettings.forEach(setting => {
          settingsObject[setting.key] = setting.value;
        });
        
        // 合并默认设置和数据库设置
        return { ...defaultSettings, ...settingsObject };
      },
      // 设置缓存有效期为30分钟
      1000 * 60 * 30
    );
    
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('获取设置失败:', error);
    return NextResponse.json(
      { error: '获取设置失败' },
      { status: 500 }
    );
  }
} 