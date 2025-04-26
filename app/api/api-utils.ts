import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getCachedData } from '@/lib/cache';

/**
 * 带缓存的API响应，添加缓存控制和内容协商
 */
export async function cachedApiResponse<T>(
  cacheKey: string,
  dataFn: () => Promise<T>,
  options: {
    maxAge?: number;
    staleWhileRevalidate?: number;
    tags?: string[];
    status?: number;
  } = {}
) {
  const { maxAge = 60, staleWhileRevalidate = 600, tags = [], status = 200 } = options;
  
  // 获取缓存数据
  const data = await getCachedData(cacheKey, dataFn, maxAge * 1000);
  
  // 构建缓存控制头
  const cacheControlValue = `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`;
  
  // 创建响应，添加缓存控制和ETag
  const response = NextResponse.json(data, { status });
  
  // 添加缓存控制头
  response.headers.set('Cache-Control', cacheControlValue);
  response.headers.set('X-Cache-Key', cacheKey);
  
  // 添加内容类型
  response.headers.set('Content-Type', 'application/json');
  
  return response;
}

/**
 * 使API路径对应的缓存失效
 */
export function invalidateApiCache(
  path: string,
  tags?: string[]
) {
  // 使路径缓存失效
  revalidatePath(path);
  
  // 如果提供了标签，使标签缓存失效
  if (tags && tags.length > 0) {
    tags.forEach(tag => revalidateTag(tag));
  }
}

/**
 * 将API错误转换为标准响应
 */
export function apiError(
  message: string,
  status: number = 500,
  details?: any
) {
  const error = {
    error: message,
    ...(details ? { details } : {})
  };
  
  return NextResponse.json(error, { status });
} 