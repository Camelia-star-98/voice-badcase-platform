import { createClient } from '@supabase/supabase-js';

// Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('🔍 Supabase 环境变量检查:');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? `✅ 已设置 (${supabaseUrl})` : '❌ 未设置');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? `✅ 已设置 (长度: ${supabaseAnonKey.length})` : '❌ 未设置');

// 验证环境变量
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 环境变量缺失！');
  console.error('请检查 .env.local 文件是否存在并包含：');
  console.error('VITE_SUPABASE_URL=your_supabase_url');
  console.error('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
}

// 创建 Supabase 客户端
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: false
  }
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ 使用占位符创建了无效的 Supabase 客户端');
} else {
  console.log('✅ Supabase 客户端已初始化');
  console.log('📍 Supabase URL:', supabaseUrl);
}

// 检查连接状态
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('badcases').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('❌ Supabase 连接失败:', error.message);
      return false;
    }
    console.log('✅ Supabase 连接成功');
    return true;
  } catch (error) {
    console.error('❌ Supabase 连接失败:', error);
    return false;
  }
}

