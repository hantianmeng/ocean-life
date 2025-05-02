import { NextRequest, NextResponse } from 'next/server'
import { getAllOceanAnimals, getEndangeredAnimals } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // 获取URL查询参数
    const searchParams = request.nextUrl.searchParams
    const endangered = searchParams.get('endangered')
    
    // 根据查询参数决定获取哪些数据
    let data
    if (endangered === 'true') {
      data = await getEndangeredAnimals()
    } else {
      data = await getAllOceanAnimals()
    }
    
    return NextResponse.json({ 
      success: true, 
      data 
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ocean animals' }, 
      { status: 500 }
    )
  }
} 