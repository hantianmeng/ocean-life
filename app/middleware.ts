import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 中间件，处理请求性能优化
 */
export function middleware(request: NextRequest) {
  // 创建响应对象（继续处理请求）
  const response = NextResponse.next();
  
  // 优化缓存控制，提高性能
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // API请求
    if (request.method === 'GET') {
      // GET请求可缓存 - 针对非管理员API
      if (!request.nextUrl.pathname.includes('/admin/')) {
        const cacheControl = 'public, max-age=60, s-maxage=120, stale-while-revalidate=600';
        response.headers.set('Cache-Control', cacheControl);
      }
    } else {
      // 非GET请求不应缓存
      response.headers.set('Cache-Control', 'no-store, no-cache');
    }
    
    // 支持CORS预检请求
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 设置内容类型
    if (!response.headers.has('Content-Type')) {
      response.headers.set('Content-Type', 'application/json');
    }
  } else if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/)) {
    // 图片资源 - 使用较长的缓存时间
    const cacheControl = 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=31536000';
    response.headers.set('Cache-Control', cacheControl);
  } else if (request.nextUrl.pathname.match(/\.(css|js)$/)) {
    // 静态资源 - 使用适中的缓存时间
    const cacheControl = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400';
    response.headers.set('Cache-Control', cacheControl);
  } else {
    // 页面请求 - 使用较短的缓存时间
    const cacheControl = 'public, max-age=30, s-maxage=60, stale-while-revalidate=300';
    response.headers.set('Cache-Control', cacheControl);
  }
  
  // 添加安全性相关的标头
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  
  return response;
}

/**
 * 配置中间件匹配的路径
 */
export const config = {
  matcher: [
    // 匹配所有API路由
    '/api/:path*',
    // 匹配静态资源和页面路由，但排除Next.js内部路由
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
}; 