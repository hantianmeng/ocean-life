import { LRUCache } from 'lru-cache';

interface CacheOptions {
  max: number;
  ttl: number;
  updateAgeOnGet?: boolean;
  allowStale?: boolean;
}

// 用于生产环境的更高效缓存配置
const productionOptions: CacheOptions = {
  // 缓存项最大数量
  max: 1000,
  // 默认缓存时间20分钟
  ttl: 1000 * 60 * 20,
  // 获取时更新年龄
  updateAgeOnGet: true,
  // 允许返回过期数据（同时在后台刷新）
  allowStale: true,
};

// 开发环境使用较小缓存
const developmentOptions: CacheOptions = {
  max: 100,
  ttl: 1000 * 60 * 5,
  updateAgeOnGet: true,
};

// 根据环境选择配置
const options = process.env.NODE_ENV === 'production' 
  ? productionOptions 
  : developmentOptions;

// 创建缓存实例
const cache = new LRUCache(options);

// 缓存命中统计
let cacheStats = {
  hits: 0,
  misses: 0,
  total: 0,
};

/**
 * 通用缓存函数
 * @param key 缓存键
 * @param fn 如果缓存未命中需要执行的异步函数
 * @param ttl 可选，特定缓存项的生存时间
 * @param forceRefresh 可选，强制刷新缓存
 */
export async function getCachedData<T>(
  key: string, 
  fn: () => Promise<T>, 
  ttl?: number,
  forceRefresh = false
): Promise<T> {
  cacheStats.total++;
  
  // 如果强制刷新或缓存中没有数据
  if (forceRefresh || !cache.has(key)) {
    cacheStats.misses++;
    
    try {
      // 执行查询函数
      const data = await fn();
      
      // 存入缓存
      cache.set(key, data, { ttl });
      
      return data;
    } catch (error) {
      console.error(`获取缓存数据出错 (${key})`, error);
      throw error;
    }
  }
  
  // 缓存命中
  cacheStats.hits++;
  return cache.get(key) as T;
}

/**
 * 使缓存中的特定键失效
 * @param key 缓存键
 */
export function invalidateCache(key: string): void {
  cache.delete(key);
}

/**
 * 使缓存中符合特定前缀的所有键失效
 * @param prefix 缓存键前缀
 */
export function invalidateCacheByPrefix(prefix: string): void {
  // 遍历所有缓存键
  for (const key of cache.keys()) {
    if (key.toString().startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats() {
  const hitRate = cacheStats.total > 0 
    ? Math.round((cacheStats.hits / cacheStats.total) * 100) 
    : 0;
  
  return {
    ...cacheStats,
    hitRate: `${hitRate}%`,
    size: cache.size,
    maxSize: options.max,
  };
}

/**
 * 清空整个缓存
 */
export function clearCache(): void {
  cache.clear();
  cacheStats = { hits: 0, misses: 0, total: 0 };
} 