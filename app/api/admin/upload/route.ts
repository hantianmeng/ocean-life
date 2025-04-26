import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// 生成随机字符串作为文件名（替代uuid库）
function generateRandomId(length = 24) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// 确保上传目录存在
async function ensureUploadDir() {
  const uploadDir = path.join(process.cwd(), 'public/uploads');
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error('创建上传目录失败:', error);
  }
  return uploadDir;
}

export async function POST(request: Request) {
  try {
    // 检查授权
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '未提供文件' }, { status: 400 });
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '只允许上传图片文件' }, { status: 400 });
    }

    // 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 生成唯一文件名
    const fileExt = path.extname(file.name);
    const fileName = `${generateRandomId()}${fileExt}`;
    
    // 确保上传目录存在
    const uploadDir = await ensureUploadDir();
    const filePath = path.join(uploadDir, fileName);
    
    // 保存文件
    await writeFile(filePath, buffer);
    
    // 返回相对URL路径
    const fileUrl = `/uploads/${fileName}`;
    
    return NextResponse.json({ 
      url: fileUrl,
      success: true 
    });
  } catch (error: any) {
    console.error('文件上传失败:', error);
    return NextResponse.json({ 
      error: '文件上传失败: ' + (error.message || '未知错误') 
    }, { status: 500 });
  }
} 