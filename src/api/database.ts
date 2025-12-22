import { supabase } from './supabase';

// Badcase 数据类型
export interface Badcase {
  id: string;
  problem_text: string;
  audio_url?: string;
  problem_description: string;
  detail_description?: string;
  priority: 'P00' | 'P0' | 'P1' | 'P2';
  feedback_source?: string;
  feedback_date?: string;
  feedback_person?: string;
  creator?: string;
  status: '修复中' | '待确认' | '已上线并验证' | '已关闭' | '停顿';
  created_at?: string;
  updated_at?: string;
  subject?: string;
  model_version?: string;
}

// 统计数据类型
export interface Statistics {
  totalCount: number;
  resolvedCount: number;
  inProgressCount: number;
  highPriorityCount: number;
  statusDistribution: Array<{ status: string; count: number }>;
  priorityDistribution: Array<{ priority: string; count: number }>;
  dailyTrend: Array<{ date: string; count: number }>;
  sourceDistribution: Array<{ source: string; count: number }>;
}

// 查询参数类型
export interface GetBadcasesParams {
  page: number;
  pageSize: number;
  searchText?: string;
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  subject?: string;
  model_version?: string;
}

/**
 * 获取 Badcase 列表
 */
export async function getBadcases(params: GetBadcasesParams) {
  try {
    const { page, pageSize, searchText, status, priority, startDate, endDate, subject, model_version } = params;
    
    // 构建查询
    let query = supabase
      .from('badcases')
      .select('*', { count: 'exact' });

    // 搜索文本
    if (searchText) {
      query = query.or(`problem_text.ilike.%${searchText}%,problem_description.ilike.%${searchText}%,id.ilike.%${searchText}%`);
    }

    // 状态筛选
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // 优先级筛选
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }

    // 学科筛选
    if (subject && subject !== 'all') {
      query = query.eq('subject', subject);
    }

    // 模型版本筛选
    if (model_version && model_version !== 'all') {
      query = query.eq('model_version', model_version);
    }

    // 日期范围筛选
    if (startDate) {
      query = query.gte('feedback_date', startDate);
    }
    if (endDate) {
      query = query.lte('feedback_date', endDate);
    }

    // 排序和分页
    query = query
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('查询 Badcase 列表失败:', error);
      throw error;
    }

    return {
      data: data || [],
      total: count || 0
    };
  } catch (error) {
    console.error('获取 Badcase 列表失败:', error);
    throw error;
  }
}

/**
 * 根据 ID 获取单个 Badcase
 */
export async function getBadcaseById(id: string): Promise<Badcase | null> {
  try {
    const { data, error } = await supabase
      .from('badcases')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('查询 Badcase 失败:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('获取 Badcase 详情失败:', error);
    throw error;
  }
}

/**
 * 创建新的 Badcase
 */
export async function createBadcase(data: Partial<Badcase>): Promise<Badcase> {
  try {
    const { data: result, error } = await supabase
      .from('badcases')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('创建 Badcase 失败:', error);
      throw error;
    }

    console.log('✅ Badcase 创建成功, ID:', result.id);
    return result;
  } catch (error) {
    console.error('创建 Badcase 失败:', error);
    throw error;
  }
}

/**
 * 更新 Badcase
 */
export async function updateBadcase(id: string, data: Partial<Badcase>): Promise<Badcase> {
  try {
    const { data: result, error } = await supabase
      .from('badcases')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新 Badcase 失败:', error);
      throw error;
    }

    console.log('✅ Badcase 更新成功, ID:', result.id);
    return result;
  } catch (error) {
    console.error('更新 Badcase 失败:', error);
    throw error;
  }
}

/**
 * 删除 Badcase
 */
export async function deleteBadcase(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('badcases')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除 Badcase 失败:', error);
      throw error;
    }

    console.log('✅ Badcase 删除成功');
  } catch (error) {
    console.error('删除 Badcase 失败:', error);
    throw error;
  }
}

/**
 * 获取统计数据
 */
export async function getStatistics(): Promise<Statistics> {
  try {
    // 获取所有 Badcase 数据
    const { data: allBadcases, error } = await supabase
      .from('badcases')
      .select('*');

    if (error) {
      console.error('查询统计数据失败:', error);
      throw error;
    }

    const badcases = allBadcases || [];

    // 计算统计数据
    const totalCount = badcases.length;
    const resolvedCount = badcases.filter(b => b.status === '已上线并验证' || b.status === '已关闭').length;
    const inProgressCount = badcases.filter(b => b.status === '修复中').length;
    const highPriorityCount = badcases.filter(b => b.priority === 'P00' || b.priority === 'P0').length;

    // 状态分布
    const statusMap = new Map<string, number>();
    badcases.forEach(b => {
      statusMap.set(b.status, (statusMap.get(b.status) || 0) + 1);
    });
    const statusDistribution = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

    // 优先级分布
    const priorityMap = new Map<string, number>();
    badcases.forEach(b => {
      priorityMap.set(b.priority, (priorityMap.get(b.priority) || 0) + 1);
    });
    const priorityDistribution = Array.from(priorityMap.entries()).map(([priority, count]) => ({ priority, count }));

    // 日期趋势（按创建日期统计）
    const dateMap = new Map<string, number>();
    badcases.forEach(b => {
      if (b.created_at) {
        const date = b.created_at.split('T')[0]; // 取日期部分
        dateMap.set(date, (dateMap.get(date) || 0) + 1);
      }
    });
    const dailyTrend = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 反馈来源分布
    const sourceMap = new Map<string, number>();
    badcases.forEach(b => {
      if (b.feedback_source) {
        sourceMap.set(b.feedback_source, (sourceMap.get(b.feedback_source) || 0) + 1);
      }
    });
    const sourceDistribution = Array.from(sourceMap.entries()).map(([source, count]) => ({ source, count }));

    return {
      totalCount,
      resolvedCount,
      inProgressCount,
      highPriorityCount,
      statusDistribution,
      priorityDistribution,
      dailyTrend,
      sourceDistribution
    };
  } catch (error) {
    console.error('获取统计数据失败:', error);
    throw error;
  }
}

/**
 * 获取所有学科列表
 */
export async function getSubjects(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('badcases')
      .select('subject')
      .not('subject', 'is', null);

    if (error) throw error;

    // 去重
    const subjects = [...new Set(data?.map(item => item.subject) || [])];
    return subjects.filter(s => s) as string[];
  } catch (error) {
    console.error('获取学科列表失败:', error);
    return [];
  }
}

/**
 * 获取所有模型版本列表
 */
export async function getModelVersions(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('badcases')
      .select('model_version')
      .not('model_version', 'is', null);

    if (error) throw error;

    // 去重
    const versions = [...new Set(data?.map(item => item.model_version) || [])];
    return versions.filter(v => v) as string[];
  } catch (error) {
    console.error('获取模型版本列表失败:', error);
    return [];
  }
}

