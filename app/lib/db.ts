import { PrismaClient } from '@prisma/client'
import { PrismaClientOptions } from '@prisma/client/runtime/library'

// 针对不同环境的Prisma配置
const prismaOptions: PrismaClientOptions = {
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
}

// 使用全局变量保持连接池
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

// 获取已创建的客户端，或创建一个新的客户端
export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaOptions)

// 防止热重载产生多个实例
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 