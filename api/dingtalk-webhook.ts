/**
 * 钉钉机器人Webhook接收端点
 * 接收钉钉消息并创建Badcase
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Supabase配置
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// 钉钉机器人密钥（用于验证消息来源）
const DINGTALK_SECRET = process.env.DINGTALK_SECRET || '';

/**
 * 验证钉钉签名
 */
function verifyDingTalkSignature(timestamp: string, sign: string): boolean {
  if (!DINGTALK_SECRET) return true; // 如果没有配置密钥，跳过验证
  
  const stringToSign = `${timestamp}\n${DINGTALK_SECRET}`;
  const hmac = crypto.createHmac('sha256', DINGTALK_SECRET);
  const signature = hmac.update(stringToSign).digest('base64');
  
  return signature === sign;
}

/**
 * 解析钉钉消息内容，提取Badcase信息
 */
function parseBadcaseFromMessage(text: string): any {
  // 支持的消息格式示例：
  // 提报问题
  // 学科：英语
  // 位置：行课互动
  // CMS课节ID：123456
  // 分类：读音错误
  // 描述：A相关的单词发音不准确
  // 提报人：张三
  // 期望修复：2025-12-30
  
  const lines = text.split('\n').map(line => line.trim());
  const data: any = {
    subject: '',
    location: '',
    category: '',
    description: '',
    reporter: '',
    cms_section_id: null,
    tts_section_id: null,
    model_id: null,
    expected_fix_date: null,
    submit_date: new Date().toISOString().split('T')[0],
    status: 'pending',
  };
  
  for (const line of lines) {
    if (line.includes('学科：') || line.includes('学科:')) {
      data.subject = line.split(/[：:]/)[1]?.trim() || '';
    } else if (line.includes('位置：') || line.includes('位置:') || line.includes('出现位置：') || line.includes('出现位置:')) {
      const location = line.split(/[：:]/)[1]?.trim() || '';
      data.location = location.includes('TTS') ? 'full_tts' : 'interactive';
    } else if (line.includes('CMS课节ID：') || line.includes('CMS课节ID:') || line.includes('课节ID：') || line.includes('课节ID:')) {
      data.cms_section_id = line.split(/[：:]/)[1]?.trim() || null;
    } else if (line.includes('TTS课节ID：') || line.includes('TTS课节ID:')) {
      data.tts_section_id = line.split(/[：:]/)[1]?.trim() || null;
    } else if (line.includes('模型ID：') || line.includes('模型ID:') || line.includes('问题模型ID：') || line.includes('问题模型ID:')) {
      data.model_id = line.split(/[：:]/)[1]?.trim() || null;
    } else if (line.includes('分类：') || line.includes('分类:')) {
      data.category = line.split(/[：:]/)[1]?.trim() || '';
    } else if (line.includes('描述：') || line.includes('描述:') || line.includes('问题描述：') || line.includes('问题描述:')) {
      data.description = line.split(/[：:]/)[1]?.trim() || '';
    } else if (line.includes('提报人：') || line.includes('提报人:') || line.includes('提报：') || line.includes('提报:')) {
      data.reporter = line.split(/[：:]/)[1]?.trim() || '';
    } else if (line.includes('期望修复：') || line.includes('期望修复:') || line.includes('期望修复时间：') || line.includes('期望修复时间:')) {
      data.expected_fix_date = line.split(/[：:]/)[1]?.trim() || null;
    }
  }
  
  // 如果描述为空，尝试获取所有非字段行作为描述
  if (!data.description) {
    const descLines = lines.filter(line => 
      !line.includes('：') && 
      !line.includes(':') && 
      !line.includes('提报问题') &&
      line.length > 0
    );
    data.description = descLines.join('\n');
  }
  
  return data;
}

/**
 * 生成唯一ID
 */
function generateUniqueId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const part1 = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `BC_${part1}_${part2}`;
}

/**
 * 主处理函数
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 只接受POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // 验证钉钉签名（如果配置了密钥）
    const timestamp = req.headers['timestamp'] as string;
    const sign = req.headers['sign'] as string;
    
    if (DINGTALK_SECRET && (!timestamp || !sign || !verifyDingTalkSignature(timestamp, sign))) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // 解析钉钉消息
    const { text, msgtype } = req.body;
    
    if (msgtype !== 'text' || !text?.content) {
      return res.status(400).json({ error: 'Invalid message format' });
    }
    
    const messageContent = text.content;
    
    // 检查是否是提报问题的消息
    if (!messageContent.includes('提报问题') && !messageContent.includes('新建badcase')) {
      return res.status(200).json({ 
        msg_type: 'text',
        content: { text: '消息格式不正确。请使用"提报问题"开头，然后换行填写各字段信息。' }
      });
    }
    
    // 解析Badcase信息
    const badcaseData = parseBadcaseFromMessage(messageContent);
    
    // 验证必填字段
    if (!badcaseData.subject || !badcaseData.category || !badcaseData.description) {
      return res.status(200).json({
        msg_type: 'text',
        content: { 
          text: '❌ 提报失败！缺少必填字段。\n\n必填字段：\n• 学科\n• 分类\n• 描述' 
        }
      });
    }
    
    // 生成ID和时间戳
    const now = new Date().toISOString();
    const newBadcase = {
      id: generateUniqueId(),
      ...badcaseData,
      created_at: now,
      updated_at: now,
    };
    
    // 插入数据库
    const { data, error } = await supabase
      .from('badcases')
      .insert([newBadcase])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(200).json({
        msg_type: 'text',
        content: { text: `❌ 数据库写入失败：${error.message}` }
      });
    }
    
    // 返回成功响应给钉钉
    return res.status(200).json({
      msg_type: 'text',
      content: { 
        text: `✅ Badcase提报成功！\n\nID: ${data.id}\n学科: ${data.subject}\n分类: ${data.category}\n提报人: ${data.reporter || '未填写'}\n\n已同步到平台，可前往查看详情。` 
      }
    });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ 
      msg_type: 'text',
      content: { text: '❌ 服务器错误，请稍后重试' }
    });
  }
}

