import { supabase } from './supabase';
import { BadcaseData } from '../types';

/**
 * 数据库字段 -> 前端类型的映射
 */
function mapDbToBadcaseData(dbData: any): BadcaseData {
  // 如果description为空，尝试从problem_description和problem_text恢复
  let description = dbData.description;
  if (!description || description === '') {
    if (dbData.problem_description && dbData.problem_text) {
      description = dbData.problem_description + '\n\n问题文本：' + dbData.problem_text;
    } else if (dbData.problem_description) {
      description = dbData.problem_description;
    } else if (dbData.problem_text) {
      description = dbData.problem_text;
    }
  }
  
  return {
    id: dbData.id,
    date: dbData.date,
    subject: dbData.subject,
    location: dbData.location,
    fullTtsLessonId: dbData.full_tts_lesson_id,
    cmsId: dbData.cms_id,
    reporter: dbData.reporter,
    category: dbData.category,
    expectedFixDate: dbData.expected_fix_date,
    status: dbData.status,
    priority: dbData.priority || 'P1', // 默认值为 P1
    description: description || '',
    problemDescription: dbData.problem_description,
    problemText: dbData.problem_text,
    audioUrl: dbData.audio_url,
    modelId: dbData.model_id,
    remark: dbData.remark,
    createdAt: dbData.created_at ? new Date(dbData.created_at).toLocaleString('zh-CN') : '',
    updatedAt: dbData.updated_at ? new Date(dbData.updated_at).toLocaleString('zh-CN') : '',
  };
}

/**
 * 前端类型 -> 数据库字段的映射
 */
function mapBadcaseDataToDb(data: Partial<BadcaseData>): any {
  const dbData: any = {};
  
  if (data.id !== undefined) dbData.id = data.id;
  if (data.date !== undefined) dbData.date = data.date;
  if (data.subject !== undefined) dbData.subject = data.subject;
  if (data.location !== undefined) dbData.location = data.location;
  if (data.fullTtsLessonId !== undefined) dbData.full_tts_lesson_id = data.fullTtsLessonId;
  if (data.cmsId !== undefined) dbData.cms_id = data.cmsId;
  if (data.reporter !== undefined) dbData.reporter = data.reporter;
  if (data.category !== undefined) dbData.category = data.category;
  if (data.expectedFixDate !== undefined) dbData.expected_fix_date = data.expectedFixDate;
  if (data.status !== undefined) dbData.status = data.status;
  if (data.priority !== undefined) dbData.priority = data.priority;
  if (data.description !== undefined) dbData.description = data.description;
  if (data.problemDescription !== undefined) dbData.problem_description = data.problemDescription;
  if (data.problemText !== undefined) dbData.problem_text = data.problemText;
  if (data.audioUrl !== undefined) dbData.audio_url = data.audioUrl;
  if (data.modelId !== undefined) dbData.model_id = data.modelId;
  if (data.remark !== undefined) dbData.remark = data.remark;
  
  return dbData;
}

/**
 * 获取所有 Badcase 列表
 */
export async function getAllBadcases(tableName: string = 'badcases'): Promise<BadcaseData[]> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`❌ 获取 Badcase 列表失败 (${tableName}):`, error);
      throw error;
    }

    console.log(`✅ 成功获取 ${data?.length || 0} 条 Badcase 数据 (${tableName})`);
    return (data || []).map(mapDbToBadcaseData);
  } catch (error) {
    console.error(`❌ 获取 Badcase 列表异常 (${tableName}):`, error);
    throw error;
  }
}

/**
 * 根据 ID 获取单个 Badcase
 */
export async function getBadcaseById(id: string, tableName: string = 'badcases'): Promise<BadcaseData | null> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`❌ 获取 Badcase 失败 (${tableName}):`, error);
      throw error;
    }

    return data ? mapDbToBadcaseData(data) : null;
  } catch (error) {
    console.error(`❌ 获取 Badcase 异常 (${tableName}):`, error);
    return null;
  }
}

/**
 * 创建新的 Badcase
 */
export async function createBadcase(badcase: BadcaseData, tableName: string = 'badcases'): Promise<BadcaseData> {
  try {
    const dbData = mapBadcaseDataToDb(badcase);
    
    const { data, error } = await supabase
      .from(tableName)
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error(`❌ 创建 Badcase 失败 (${tableName}):`, error);
      console.error('❌ 错误详情:', JSON.stringify(error, null, 2));
      console.error('❌ 错误消息:', error.message);
      throw new Error(error.message || '创建失败');
    }

    console.log(`✅ Badcase 创建成功: ${data.id} (${tableName})`);
    return mapDbToBadcaseData(data);
  } catch (error: any) {
    console.error(`❌ 创建 Badcase 异常 (${tableName}):`, error);
    console.error('❌ 错误类型:', typeof error);
    console.error('❌ 错误内容:', JSON.stringify(error, null, 2));
    throw new Error(error?.message || error?.toString() || '创建 Badcase 失败');
  }
}

/**
 * 更新 Badcase
 */
export async function updateBadcase(id: string, updates: Partial<BadcaseData>, tableName: string = 'badcases'): Promise<BadcaseData> {
  try {
    const dbUpdates = mapBadcaseDataToDb(updates);
    
    const { data, error } = await supabase
      .from(tableName)
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`❌ 更新 Badcase 失败 (${tableName}):`, error);
      console.error('❌ 错误详情:', JSON.stringify(error, null, 2));
      console.error('❌ 错误消息:', error.message);
      throw new Error(error.message || '更新失败');
    }

    console.log(`✅ Badcase 更新成功: ${data.id} (${tableName})`);
    return mapDbToBadcaseData(data);
  } catch (error: any) {
    console.error(`❌ 更新 Badcase 异常 (${tableName}):`, error);
    console.error('❌ 错误类型:', typeof error);
    console.error('❌ 错误内容:', JSON.stringify(error, null, 2));
    throw new Error(error?.message || error?.toString() || '更新 Badcase 失败');
  }
}

/**
 * 删除 Badcase
 */
export async function deleteBadcase(id: string, tableName: string = 'badcases'): Promise<void> {
  try {
    console.log(`🗑️ 开始删除 Badcase: ${id} (${tableName})`);
    
    const { data, error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error(`❌ 删除 Badcase 失败 (${tableName}):`, error);
      console.error('❌ 错误详情:', JSON.stringify(error, null, 2));
      console.error('❌ 错误消息:', error.message);
      throw new Error(error.message || '删除失败');
    }

    console.log(`✅ Badcase 删除成功: ${id} (${tableName})`);
    console.log('✅ 删除的数据:', data);
  } catch (error: any) {
    console.error(`❌ 删除 Badcase 异常 (${tableName}):`, error);
    console.error('❌ 错误类型:', typeof error);
    console.error('❌ 错误内容:', JSON.stringify(error, null, 2));
    throw new Error(error?.message || error?.toString() || '删除 Badcase 失败');
  }
}

/**
 * 批量删除 Badcase
 */
export async function deleteBadcasesByIds(ids: string[], tableName: string = 'badcases'): Promise<{
  success: number;
  failed: number;
  errors: Array<{ id: string; error: any }>;
}> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as Array<{ id: string; error: any }>,
  };

  for (const id of ids) {
    try {
      await deleteBadcase(id, tableName);
      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push({ id, error });
    }
  }

  return results;
}

/**
 * 检查 Supabase 连接状态
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('badcases')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Supabase 连接失败:', error.message);
      return false;
    }

    console.log('✅ Supabase 连接成功');
    return true;
  } catch (error) {
    console.error('❌ Supabase 连接异常:', error);
    return false;
  }
}

