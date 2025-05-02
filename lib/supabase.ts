import { createClient } from '@supabase/supabase-js'

// 检查环境变量是否设置
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// 创建Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 海洋动物数据操作
export async function getAllOceanAnimals() {
  const { data, error } = await supabase
    .from('ocean_animals')
    .select('*')
  
  if (error) {
    console.error('Error fetching ocean animals:', error)
    throw error
  }
  
  return data
}

export async function getEndangeredAnimals() {
  const { data, error } = await supabase
    .from('ocean_animals')
    .select('*')
    .eq('endangered', true)
  
  if (error) {
    console.error('Error fetching endangered animals:', error)
    throw error
  }
  
  return data
} 