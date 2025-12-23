/**
 * 数据迁移脚本：将 localStorage 数据迁移到 Supabase
 * 运行方式：npx tsx migrate-to-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Supabase 配置
const SUPABASE_URL = 'https://kdvvkjdwyqzgrskwjwag.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkdnZramR3eXF6Z3Jza3dqd2FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1OTIxMjYsImV4cCI6MjA1MDE2ODEyNn0.o6WiZ10ek1_vp99Xgg8EAaT6tIGQyK4FpbWCIgWy9jY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface BadcaseData {
  id: string;
  problemText: string;
  audioUrl?: string;
  problemDescription: string;
  detailDescription?: string;
  priority: 'P00' | 'P0' | 'P1' | 'P2';
  feedbackSource?: string;
  feedbackDate?: string;
  feedbackPerson?: string;
  creator?: string;
  status: '修复中' | '待确认' | '已上线并验证' | '已关闭' | '停顿';
  createdAt: string;
  updatedAt: string;
  subject?: string;
  modelVersion?: string;
}

// 将前端字段转换为数据库字段
function convertToSupabaseFormat(badcase: BadcaseData) {
  return {
    id: badcase.id,
    problem_text: badcase.problemText,
    audio_url: badcase.audioUrl || null,
    problem_description: badcase.problemDescription,
    detail_description: badcase.detailDescription || null,
    priority: badcase.priority,
    feedback_source: badcase.feedbackSource || null,
    feedback_date: badcase.feedbackDate || null,
    feedback_person: badcase.feedbackPerson || null,
    creator: badcase.creator || null,
    status: badcase.status,
    created_at: badcase.createdAt,
    updated_at: badcase.updatedAt,
    subject: badcase.subject || null,
    model_version: badcase.modelVersion || null,
  };
}

async function checkConnection() {
  console.log('🔍 检查 Supabase 连接...');
  try {
    const { data, error } = await supabase.from('badcases').select('count').limit(1);
    if (error) {
      console.error('❌ Supabase 连接失败:', error.message);
      return false;
    }
    console.log('✅ Supabase 连接成功！');
    return true;
  } catch (error) {
    console.error('❌ Supabase 连接异常:', error);
    return false;
  }
}

async function loadLocalStorageData(): Promise<BadcaseData[]> {
  console.log('\n📂 尝试从本地文件读取数据...');
  
  // 尝试从常见的浏览器缓存位置读取 localStorage
  const possiblePaths = [
    path.join(process.cwd(), 'localStorage-backup.json'),
    path.join(process.cwd(), 'data', 'badcases.json'),
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        console.log(`✅ 从文件加载了 ${data.length} 条数据: ${filePath}`);
        return data;
      } catch (error) {
        console.error(`❌ 读取文件失败: ${filePath}`, error);
      }
    }
  }

  console.log('\n⚠️ 未找到本地数据文件！');
  console.log('💡 请按照以下步骤操作：');
  console.log('   1. 在浏览器中打开应用（http://localhost:5173）');
  console.log('   2. 打开浏览器开发者工具（F12）');
  console.log('   3. 在 Console 中运行以下命令：');
  console.log('      copy(localStorage.getItem("badcaseList"))');
  console.log('   4. 创建文件 localStorage-backup.json 并粘贴内容');
  console.log('   5. 重新运行此脚本');
  
  return [];
}

async function migrateData(data: BadcaseData[]) {
  if (data.length === 0) {
    console.log('\n⚠️ 没有数据需要迁移！');
    return;
  }

  console.log(`\n🚀 开始迁移 ${data.length} 条数据到 Supabase...`);

  let successCount = 0;
  let failCount = 0;
  const errors: Array<{ id: string; error: string }> = [];

  for (let i = 0; i < data.length; i++) {
    const badcase = data[i];
    const supabaseData = convertToSupabaseFormat(badcase);

    try {
      // 先检查是否已存在
      const { data: existing } = await supabase
        .from('badcases')
        .select('id')
        .eq('id', badcase.id)
        .single();

      if (existing) {
        // 更新已存在的记录
        const { error } = await supabase
          .from('badcases')
          .update(supabaseData)
          .eq('id', badcase.id);

        if (error) {
          failCount++;
          errors.push({ id: badcase.id, error: error.message });
          console.log(`❌ [${i + 1}/${data.length}] 更新失败: ${badcase.id} - ${error.message}`);
        } else {
          successCount++;
          console.log(`✅ [${i + 1}/${data.length}] 更新成功: ${badcase.id}`);
        }
      } else {
        // 插入新记录
        const { error } = await supabase
          .from('badcases')
          .insert([supabaseData]);

        if (error) {
          failCount++;
          errors.push({ id: badcase.id, error: error.message });
          console.log(`❌ [${i + 1}/${data.length}] 插入失败: ${badcase.id} - ${error.message}`);
        } else {
          successCount++;
          console.log(`✅ [${i + 1}/${data.length}] 插入成功: ${badcase.id}`);
        }
      }
    } catch (error: any) {
      failCount++;
      errors.push({ id: badcase.id, error: error.message });
      console.log(`❌ [${i + 1}/${data.length}] 异常: ${badcase.id} - ${error.message}`);
    }

    // 每 10 条记录暂停一下，避免请求过快
    if ((i + 1) % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n📊 迁移完成！');
  console.log(`✅ 成功: ${successCount} 条`);
  console.log(`❌ 失败: ${failCount} 条`);

  if (errors.length > 0) {
    console.log('\n❌ 失败详情：');
    errors.forEach(({ id, error }) => {
      console.log(`   - ${id}: ${error}`);
    });
  }

  return { successCount, failCount, errors };
}

async function verifyMigration() {
  console.log('\n🔍 验证迁移结果...');
  try {
    const { count, error } = await supabase
      .from('badcases')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('❌ 查询失败:', error.message);
      return;
    }

    console.log(`✅ Supabase 中共有 ${count} 条记录`);
  } catch (error) {
    console.error('❌ 验证失败:', error);
  }
}

async function main() {
  console.log('🎯 数据迁移工具 - localStorage → Supabase\n');
  console.log('='.repeat(50));

  // 1. 检查连接
  const isConnected = await checkConnection();
  if (!isConnected) {
    console.error('\n❌ 无法连接到 Supabase，迁移终止！');
    process.exit(1);
  }

  // 2. 加载本地数据
  const localData = await loadLocalStorageData();
  if (localData.length === 0) {
    process.exit(0);
  }

  // 3. 确认迁移
  console.log(`\n⚠️ 即将迁移 ${localData.length} 条数据到 Supabase`);
  console.log('⚠️ 如果数据已存在，将会被更新');
  console.log('\n按 Ctrl+C 取消，或等待 5 秒后自动开始...\n');
  
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 4. 执行迁移
  await migrateData(localData);

  // 5. 验证结果
  await verifyMigration();

  console.log('\n✅ 迁移流程全部完成！');
  console.log('💡 现在可以刷新浏览器，数据将从 Supabase 加载');
}

main().catch((error) => {
  console.error('❌ 迁移过程发生错误:', error);
  process.exit(1);
});

