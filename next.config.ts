import { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
    // 优化图片缓存策略
    minimumCacheTTL: 60,
    // 使用更现代的图像格式
    formats: ['image/webp']
  },
  experimental: {
    // 启用持久化缓存，提高性能
    ppr: true,
    // 优化服务器组件渲染
    serverActions: {
      allowedOrigins: ['localhost:3000']
    },
    // 启用HTTP响应流处理
    serverComponentsExternalPackages: [],
    // 优化打包体积
    optimizePackageImports: ['next', 'react', 'react-dom']
  },
  // 优化页面加载性能
  compiler: {
    // 删除未使用的导入
    removeConsole: process.env.NODE_ENV === 'production'
  },
  // 添加压缩策略
  compress: true,
  // 生产环境禁用源映射，减少服务器负载
  productionBrowserSourceMaps: false
};

export default config;
