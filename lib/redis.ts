import Redis from 'ioredis';
import { LRUCache } from 'lru-cache';

// 本地内存缓存 - 作为Redis的第一层缓存
const localCache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 5, // 5分钟
});

// 创建Redis客户端
// 在生产环境中连接到实际的Redis服务器
// 在开发环境中使用内存模拟
let redisClient: Redis | null = null;

if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL);
    console.log('Redis连接成功');
  } catch (error) {
    console.error('Redis连接失败:', error);
    redisClient = null;
  }
} else {
  console.log('未配置Redis URL，使用本地内存缓存');
}

/**
 * 从缓存获取数据，优先从本地缓存，然后从Redis
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
  // 先从本地缓存获取
  const localData = localCache.get(key) as T;
  if (localData) {
    return localData;
  }

  // 如果本地缓存没有，尝试从Redis获取
  if (redisClient) {
    try {
      const data = await redisClient.get(key);
      if (data) {
        // 解析数据并同时保存到本地缓存
        const parsedData = JSON.parse(data) as T;
        localCache.set(key, parsedData);
        return parsedData;
      }
    } catch (error) {
      console.error(`从Redis获取${key}缓存失败:`, error);
    }
  }

  return null;
}

/**
 * 将数据保存到缓存，同时保存到本地缓存和Redis
 */
export async function setToCache<T>(
  key: string,
  data: T,
  ttl: number = 60 * 60 // 默认1小时
): Promise<void> {
  // 保存到本地缓存
  localCache.set(key, data);

  // 同时保存到Redis
  if (redisClient) {
    try {
      await redisClient.set(key, JSON.stringify(data), 'EX', ttl);
    } catch (error) {
      console.error(`保存到Redis缓存失败(${key}):`, error);
    }
  }
}

/**
 * 使缓存失效，同时清除本地缓存和Redis
 */
export async function invalidateCache(key: string): Promise<void> {
  // 清除本地缓存
  localCache.delete(key);

  // 清除Redis缓存
  if (redisClient) {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error(`清除Redis缓存失败(${key}):`, error);
    }
  }
}

/**
 * 通过前缀清除缓存
 */
export async function invalidateCacheByPattern(pattern: string): Promise<void> {
  // 清除本地缓存中符合模式的项
  for (const key of localCache.keys()) {
    if (key.toString().startsWith(pattern)) {
      localCache.delete(key);
    }
  }

  // 清除Redis中符合模式的项
  if (redisClient) {
    try {
      // 获取所有匹配的键
      const keys = await redisClient.keys(`${pattern}*`);
      if (keys.length > 0) {
        // 批量删除
        await redisClient.del(...keys);
      }
    } catch (error) {
      console.error(`清除Redis缓存失败(${pattern}*):`, error);
    }
  }
}

/**
 * 清除所有缓存
 */
export async function clearAllCache(): Promise<void> {
  // 清除本地缓存
  localCache.clear();

  // 清除所有Redis缓存
  if (redisClient) {
    try {
      await redisClient.flushdb();
    } catch (error) {
      console.error('清除所有Redis缓存失败:', error);
    }
  }
}

/**
 * 通用数据缓存包装函数
 */
export async function cachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 60 * 60 // 默认1小时
): Promise<T> {
  // 尝试从缓存获取
  const cachedValue = await getFromCache<T>(key);
  if (cachedValue) {
    return cachedValue;
  }

  // 执行数据获取函数
  const freshData = await fetcher();
  
  // 缓存结果
  await setToCache(key, freshData, ttl);
  
  return freshData;
} 