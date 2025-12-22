import axios from 'axios'
import * as db from '../api/database'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// 导出数据类型
export interface Badcase {
  id: string
  problemText: string
  audioUrl?: string
  problemDescription: string
  detailDescription?: string
  priority: 'P00' | 'P0' | 'P1' | 'P2'
  feedbackSource?: string
  feedbackDate?: string
  feedbackPerson?: string
  creator?: string
  status: '修复中' | '待确认' | '已上线并验证' | '已关闭' | '停顿'
  createdAt?: string
  updatedAt?: string
  subject?: string
  modelVersion?: string
}

export interface GetBadcasesParams {
  page: number
  pageSize: number
  searchText?: string
  status?: string
  priority?: string
  startDate?: string
  endDate?: string
  subject?: string
  modelVersion?: string
}

export interface GetBadcasesResponse {
  data: Badcase[]
  total: number
}

export interface Statistics {
  totalCount: number
  resolvedCount: number
  inProgressCount: number
  highPriorityCount: number
  statusDistribution: Array<{ status: string; count: number }>
  priorityDistribution: Array<{ priority: string; count: number }>
  dailyTrend: Array<{ date: string; count: number }>
  sourceDistribution: Array<{ source: string; count: number }>
}

// 检测是否使用 Supabase
const useSupabase = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 API 模式:', useSupabase ? 'Supabase' : 'Mock/REST API')

// 数据格式转换函数（Supabase -> 前端格式）
function convertFromSupabase(data: db.Badcase): Badcase {
  return {
    id: data.id,
    problemText: data.problem_text,
    audioUrl: data.audio_url,
    problemDescription: data.problem_description,
    detailDescription: data.detail_description,
    priority: data.priority,
    feedbackSource: data.feedback_source,
    feedbackDate: data.feedback_date,
    feedbackPerson: data.feedback_person,
    creator: data.creator,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    subject: data.subject,
    modelVersion: data.model_version
  }
}

// 数据格式转换函数（前端格式 -> Supabase）
function convertToSupabase(data: Partial<Badcase>): Partial<db.Badcase> {
  return {
    id: data.id,
    problem_text: data.problemText || '',
    audio_url: data.audioUrl,
    problem_description: data.problemDescription || '',
    detail_description: data.detailDescription,
    priority: data.priority,
    feedback_source: data.feedbackSource,
    feedback_date: data.feedbackDate,
    feedback_person: data.feedbackPerson,
    creator: data.creator,
    status: data.status,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
    subject: data.subject,
    model_version: data.modelVersion
  }
}

/**
 * 获取 Badcase 列表
 */
export const getBadcases = async (params: GetBadcasesParams): Promise<GetBadcasesResponse> => {
  if (useSupabase) {
    // 使用 Supabase
    const result = await db.getBadcases({
      page: params.page,
      pageSize: params.pageSize,
      searchText: params.searchText,
      status: params.status,
      priority: params.priority,
      startDate: params.startDate,
      endDate: params.endDate,
      subject: params.subject,
      model_version: params.modelVersion
    })
    
    return {
      data: result.data.map(convertFromSupabase),
      total: result.total
    }
  } else {
    // 使用原有的 REST API 或 Mock 数据
    const response = await api.get('/badcases', { params })
    return response.data
  }
}

/**
 * 根据 ID 获取单个 Badcase
 */
export const getBadcaseById = async (id: string): Promise<Badcase> => {
  if (useSupabase) {
    const data = await db.getBadcaseById(id)
    if (!data) {
      throw new Error('Badcase not found')
    }
    return convertFromSupabase(data)
  } else {
    const response = await api.get(`/badcases/${id}`)
    return response.data
  }
}

/**
 * 创建新的 Badcase
 */
export const createBadcase = async (data: Partial<Badcase>): Promise<Badcase> => {
  if (useSupabase) {
    const supabaseData = convertToSupabase(data)
    const result = await db.createBadcase(supabaseData)
    return convertFromSupabase(result)
  } else {
    const response = await api.post('/badcases', data)
    return response.data
  }
}

/**
 * 更新 Badcase
 */
export const updateBadcase = async (id: string, data: Partial<Badcase>): Promise<Badcase> => {
  if (useSupabase) {
    const supabaseData = convertToSupabase(data)
    const result = await db.updateBadcase(id, supabaseData)
    return convertFromSupabase(result)
  } else {
    const response = await api.put(`/badcases/${id}`, data)
    return response.data
  }
}

/**
 * 删除 Badcase
 */
export const deleteBadcase = async (id: string): Promise<void> => {
  if (useSupabase) {
    await db.deleteBadcase(id)
  } else {
    await api.delete(`/badcases/${id}`)
  }
}

/**
 * 获取统计数据
 */
export const getStatistics = async (): Promise<Statistics> => {
  if (useSupabase) {
    return await db.getStatistics()
  } else {
    const response = await api.get('/statistics')
    return response.data
  }
}

/**
 * 获取学科列表
 */
export const getSubjects = async (): Promise<string[]> => {
  if (useSupabase) {
    return await db.getSubjects()
  } else {
    // Mock 数据或 REST API
    return ['语文', '数学', '英语', '物理', '化学']
  }
}

/**
 * 获取模型版本列表
 */
export const getModelVersions = async (): Promise<string[]> => {
  if (useSupabase) {
    return await db.getModelVersions()
  } else {
    // Mock 数据或 REST API
    return ['v1.0', 'v1.1', 'v2.0', 'v2.1']
  }
}

export default api

