/**
 * 启动本地Redis服务（开发环境使用）
 * 
 * 使用node-redis-server创建一个内存Redis实例，不需要安装Redis服务器
 */
const RedisServer = require('redis-server');

// 默认端口
const PORT = process.env.REDIS_PORT || 6379;

// 创建Redis服务器实例
const server = new RedisServer(PORT);

// 启动服务器
server.open((err) => {
  if (err) {
    console.error('Redis服务器启动失败:', err);
    process.exit(1);
  }
  
  console.log(`Redis服务器已启动在端口 ${PORT}`);
  console.log('按Ctrl+C停止服务器');
});

// 处理进程退出
process.on('SIGINT', () => {
  console.log('正在关闭Redis服务器...');
  server.close().then(() => {
    console.log('Redis服务器已关闭');
    process.exit(0);
  }).catch((err) => {
    console.error('关闭Redis服务器时出错:', err);
    process.exit(1);
  });
}); 