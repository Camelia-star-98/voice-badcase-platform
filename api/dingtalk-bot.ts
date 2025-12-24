/**
 * 钉钉企业内部应用机器人接收端点
 * 支持HTTP回调模式，接收用户消息并创建Badcase
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Supabase配置
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// 钉钉企业应用配置
const DINGTALK_APP_KEY = process.env.DINGTALK_APP_KEY || '';
const DINGTALK_APP_SECRET = process.env.DINGTALK_APP_SECRET || '';
const DINGTALK_AGENT_ID = process.env.DINGTALK_AGENT_ID || '';

/**
 * 验证钉钉签名
 */
function verifyDingTalkSignature(
  timestamp: string,
  sign: string,
  content: string
): boolean {
  if (!DINGTALK_APP_SECRET) return true; // 开发环境跳过验证

  const stringToSign = `${timestamp}\n${content}`;
  const hmac = crypto.createHmac('sha256', DINGTALK_APP_SECRET);
  const signature = hmac.update(stringToSign).digest('base64');

  return signature === sign;
}

/**
 * 解析钉钉消息内容，提取Badcase信息
 */
function parseBadcaseFromMessage(text: string): any {
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
    // 跳过空行和标题行
    if (!line || line.includes('提报问题') || line.includes('新建badcase')) {
      continue;
    }

    if (line.includes('学科：') || line.includes('学科:')) {
      data.subject = line.split(/[：:]/)[1]?.trim() || '';
    } else if (line.includes('位置：') || line.includes('位置:')) {
      const location = line.split(/[：:]/)[1]?.trim() || '';
      // 智能识别位置
      if (location.includes('TTS') || location.includes('全流程')) {
        data.location = 'full_tts';
      } else if (location.includes('互动') || location.includes('行课')) {
        data.location = 'interactive';
      } else {
        data.location = location;
      }
    } else if (line.includes('CMS课节ID：') || line.includes('CMS课节ID:') || 
               line.includes('课节ID：') || line.includes('课节ID:')) {
      data.cms_section_id = line.split(/[：:]/)[1]?.trim() || null;
    } else if (line.includes('TTS课节ID：') || line.includes('TTS课节ID:')) {
      data.tts_section_id = line.split(/[：:]/)[1]?.trim() || null;
    } else if (line.includes('模型ID：') || line.includes('模型ID:')) {
      data.model_id = line.split(/[：:]/)[1]?.trim() || null;
    } else if (line.includes('分类：') || line.includes('分类:')) {
      data.category = line.split(/[：:]/)[1]?.trim() || '';
    } else if (line.includes('描述：') || line.includes('描述:') || 
               line.includes('问题描述：') || line.includes('问题描述:')) {
      data.description = line.split(/[：:]/)[1]?.trim() || '';
    } else if (line.includes('提报人：') || line.includes('提报人:')) {
      data.reporter = line.split(/[：:]/)[1]?.trim() || '';
    } else if (line.includes('期望修复：') || line.includes('期望修复:') || 
               line.includes('期望修复时间：') || line.includes('期望修复时间:')) {
      data.expected_fix_date = line.split(/[：:]/)[1]?.trim() || null;
    }
  }

  // 如果描述为空，尝试获取所有非字段行作为描述
  if (!data.description) {
    const descLines = lines.filter(line => 
      !line.includes('：') && 
      !line.includes(':') && 
      !line.includes('提报问题') &&
      !line.includes('新建badcase') &&
      line.length > 0
    );
    if (descLines.length > 0) {
      data.description = descLines.join('\n');
    }
  }

  return data;
}

/**
 * 生成唯一ID
 */
function generateUniqueId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const part1 = Array.from({ length: 8 }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  const part2 = Array.from({ length: 8 }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  return `BC_${part1}_${part2}`;
}

/**
 * 发送消息到钉钉（使用企业应用接口）
 */
async function sendMessageToDingTalk(
  userId: string,
  message: string
): Promise<boolean> {
  try {
    // 1. 获取access_token
    const tokenResponse = await fetch(
      `https://oapi.dingtalk.com/gettoken?appkey=${DINGTALK_APP_KEY}&appsecret=${DINGTALK_APP_SECRET}`
    );
    const tokenData = await tokenResponse.json();
    
    if (tokenData.errcode !== 0) {
      console.error('获取access_token失败:', tokenData);
      return false;
    }

    const accessToken = tokenData.access_token;

    // 2. 发送消息
    const sendResponse = await fetch(
      `https://oapi.dingtalk.com/topapi/message/corpconversation/asyncsend_v2?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: DINGTALK_AGENT_ID,
          userid_list: userId,
          msg: {
            msgtype: 'text',
            text: {
              content: message
            }
          }
        })
      }
    );

    const sendData = await sendResponse.json();
    
    if (sendData.errcode !== 0) {
      console.error('发送消息失败:', sendData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('发送消息异常:', error);
    return false;
  }
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
    const body = req.body;

    // 处理钉钉的URL验证请求
    if (body.msgtype === 'text' && body.text?.content === 'validation') {
      return res.status(200).json({
        msg_signature: body.msg_signature,
        timestamp: body.timestamp,
        nonce: body.nonce,
        encrypt: body.encrypt
      });
    }

    // 验证签名（生产环境）
    const timestamp = body.timestamp || '';
    const sign = body.sign || '';
    const content = JSON.stringify(body);

    if (DINGTALK_APP_SECRET && !verifyDingTalkSignature(timestamp, sign, content)) {
      console.error('签名验证失败');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // 解析消息内容
    const msgtype = body.msgtype;
    
    if (msgtype !== 'text') {
      return res.status(200).json({
        success: false,
        msg: '仅支持文本消息'
      });
    }

    const messageContent = body.text?.content || '';
    const senderId = body.senderId || body.senderStaffId || '';

    // 检查是否是提报问题的消息
    if (!messageContent.includes('提报问题') && !messageContent.includes('新建badcase')) {
      return res.status(200).json({
        success: true,
        msg: '如需提报Badcase，请使用"提报问题"开头，然后换行填写各字段信息。\n\n示例：\n提报问题\n学科：英语\n分类：读音错误\n描述：具体问题描述'
      });
    }

    // 解析Badcase信息
    const badcaseData = parseBadcaseFromMessage(messageContent);

    // 验证必填字段
    if (!badcaseData.subject || !badcaseData.category || !badcaseData.description) {
      const missingFields = [];
      if (!badcaseData.subject) missingFields.push('学科');
      if (!badcaseData.category) missingFields.push('分类');
      if (!badcaseData.description) missingFields.push('描述');
      
      return res.status(200).json({
        success: false,
        msg: `❌ 提报失败！缺少必填字段：${missingFields.join('、')}\n\n请检查消息格式。`
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
      
      // 发送错误消息
      await sendMessageToDingTalk(
        senderId,
        `❌ 数据库写入失败：${error.message}\n\n请联系管理员或稍后重试。`
      );
      
      return res.status(200).json({
        success: false,
        msg: `❌ 数据库写入失败`
      });
    }

    // 构造成功消息
    const successMessage = `✅ Badcase提报成功！

📋 ID: ${data.id}
📚 学科: ${data.subject}
📂 分类: ${data.category}
${data.location ? `📍 位置: ${data.location === 'full_tts' ? '全流程TTS' : '行课互动'}` : ''}
${data.reporter ? `👤 提报人: ${data.reporter}` : ''}
${data.cms_section_id ? `🆔 CMS课节ID: ${data.cms_section_id}` : ''}

✅ 已同步到平台，可前往查看详情。`;

    // 发送成功消息给用户
    await sendMessageToDingTalk(senderId, successMessage);

    // 返回响应
    return res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({
      success: false,
      error: '服务器错误，请稍后重试'
    });
  }
}

