#!/usr/bin/env ts-node

/**
 * 修复 Badcase ID 重复问题的脚本
 * 
 * 功能：
 * 1. 检查数据库中是否有重复的 ID
 * 2. 删除重复的记录，只保留最早的一条
 * 3. 重新生成唯一ID（如果需要）
 */

import { supabase } from '../src/api/supabase';

interface BadcaseRecord {
  id: string;
  created_at: string;
  date: string;
  subject: string;
  reporter: string;
}

async function checkDuplicateIds() {
  console.log('🔍 检查重复的 Badcase ID...\n');
  
  // 获取所有记录
  const { data: allRecords, error } = await supabase
    .from('badcases')
    .select('id, created_at, date, subject, reporter')
    .order('id');
  
  if (error) {
    console.error('❌ 查询失败:', error);
    return;
  }
  
  if (!allRecords || allRecords.length === 0) {
    console.log('✅ 数据库中没有记录');
    return;
  }
  
  console.log(`📊 总共有 ${allRecords.length} 条记录\n`);
  
  // 统计重复的ID
  const idCounts = new Map<string, BadcaseRecord[]>();
  
  allRecords.forEach(record => {
    if (!idCounts.has(record.id)) {
      idCounts.set(record.id, []);
    }
    idCounts.get(record.id)!.push(record as BadcaseRecord);
  });
  
  // 找出重复的ID
  const duplicates = Array.from(idCounts.entries())
    .filter(([_, records]) => records.length > 1);
  
  if (duplicates.length === 0) {
    console.log('✅ 没有发现重复的 ID！');
    return;
  }
  
  console.log(`⚠️ 发现 ${duplicates.length} 个重复的 ID：\n`);
  
  duplicates.forEach(([id, records]) => {
    console.log(`ID: ${id} (重复 ${records.length} 次)`);
    records.forEach((record, index) => {
      console.log(`  ${index + 1}. 创建时间: ${record.created_at}, 学科: ${record.subject}, 提报人: ${record.reporter}`);
    });
    console.log('');
  });
  
  return duplicates;
}

async function fixDuplicateIds() {
  const duplicates = await checkDuplicateIds();
  
  if (!duplicates || duplicates.length === 0) {
    return;
  }
  
  console.log('\n🔧 开始修复重复问题...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const [id, records] of duplicates) {
    // 按创建时间排序，保留最早的
    records.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    const keepRecord = records[0];
    const deleteRecords = records.slice(1);
    
    console.log(`处理 ID: ${id}`);
    console.log(`  保留: 创建于 ${keepRecord.created_at}`);
    console.log(`  删除: ${deleteRecords.length} 条重复记录`);
    
    // 删除重复的记录
    for (const record of deleteRecords) {
      try {
        const { error } = await supabase
          .from('badcases')
          .delete()
          .eq('id', record.id)
          .eq('created_at', record.created_at);
        
        if (error) {
          console.error(`  ❌ 删除失败:`, error.message);
          failCount++;
        } else {
          console.log(`  ✅ 已删除: 创建于 ${record.created_at}`);
          successCount++;
        }
      } catch (error) {
        console.error(`  ❌ 删除异常:`, error);
        failCount++;
      }
    }
    console.log('');
  }
  
  console.log('\n📊 修复结果:');
  console.log(`  成功删除: ${successCount} 条`);
  console.log(`  删除失败: ${failCount} 条`);
  
  // 再次检查
  console.log('\n🔍 重新检查...\n');
  await checkDuplicateIds();
}

// 运行修复
fixDuplicateIds().catch(console.error);

