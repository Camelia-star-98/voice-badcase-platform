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
    priority: 'P2', // 默认优先级
    cms_section_id: null,
    tts_section_id: null,
    model_id: null,
    expected_fix_date: null,
    submit_date: new Date().toISOString().split('T')[0],
    status: 'pending',
  };

  for (const line of lines) {
    // 跳过空行、标题行、模板提示
    if (!line || 
        line.includes('提报问题') || 
        line.includes('新建badcase') ||
        line.includes('【必填') ||
        line.includes('【选填') ||
        line.includes('———') ||
        line.includes('💡 提示')) {
      continue;
    }

    if (line.includes('学科：') || line.includes('学科:')) {
      data.subject = line.split(/[：:]/)[1]?.trim().replace(/【.*?】/g, '') || '';
    } else if (line.includes('出现位置：') || line.includes('出现位置:') || 
               line.includes('位置：') || line.includes('位置:')) {
      const location = line.split(/[：:]/)[1]?.trim().replace(/【.*?】/g, '') || '';
      // 智能识别位置
      if (location.includes('TTS') || location.includes('做课') || location.includes('全程')) {
        data.location = 'full_tts';
      } else if (location.includes('互动') || location.includes('行课')) {
        data.location = 'interactive';
      } else if (location) {
        data.location = location;
      }
    } else if (line.includes('优先级：') || line.includes('优先级:')) {
      const priority = line.split(/[：:]/)[1]?.trim().toUpperCase().replace(/【.*?】/g, '') || 'P2';
      // 验证优先级格式
      if (['P0', 'P1', 'P2'].includes(priority)) {
        data.priority = priority;
      }
    } else if (line.includes('课节ID：') || line.includes('课节ID:') || 
               line.includes('CMS课节ID：') || line.includes('CMS课节ID:')) {
      const value = line.split(/[：:]/)[1]?.trim().replace(/【.*?】/g, '');
      data.cms_section_id = value || null;
    } else if (line.includes('TTS课节ID：') || line.includes('TTS课节ID:')) {
      const value = line.split(/[：:]/)[1]?.trim().replace(/【.*?】/g, '');
      data.tts_section_id = value || null;
    } else if (line.includes('问题模型ID：') || line.includes('问题模型ID:') || 
               line.includes('模型ID：') || line.includes('模型ID:')) {
      const value = line.split(/[：:]/)[1]?.trim().replace(/【.*?】/g, '');
      data.model_id = value || null;
    } else if (line.includes('分类：') || line.includes('分类:')) {
      data.category = line.split(/[：:]/)[1]?.trim().replace(/【.*?】/g, '') || '';
    } else if (line.includes('描述：') || line.includes('描述:') || 
               line.includes('问题描述：') || line.includes('问题描述:')) {
      data.description = line.split(/[：:]/)[1]?.trim().replace(/【.*?】/g, '') || '';
    } else if (line.includes('问题提报人：') || line.includes('问题提报人:') || 
               line.includes('提报人：') || line.includes('提报人:')) {
      data.reporter = line.split(/[：:]/)[1]?.trim().replace(/【.*?】/g, '') || '';
    } else if (line.includes('期望修复：') || line.includes('期望修复:') || 
               line.includes('期望修复时间：') || line.includes('期望修复时间:')) {
      const value = line.split(/[：:]/)[1]?.trim().replace(/【.*?】/g, '');
      data.expected_fix_date = value || null;
    }
  }

  // 如果描述为空，尝试获取所有非字段行作为描述
  if (!data.description) {
    const descLines = lines.filter(line => 
      !line.includes('：') && 
      !line.includes(':') && 
      !line.includes('提报问题') &&
      !line.includes('新建badcase') &&
      !line.includes('【') &&
      !line.includes('———') &&
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
  // 支持GET和POST请求
  if (req.method === 'GET') {
    // 处理钉钉的GET验证请求
    const { msg_signature, timestamp, nonce } = req.query;
    
    // 简单响应验证
    return res.status(200).json({
      msg_signature,
      timestamp,
      nonce,
      message: 'DingTalk bot endpoint is ready'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;

    // 处理钉钉的URL验证请求（POST方式）
    // 钉钉企业内部应用验证时会发送这种请求
    if (body.msgtype === 'text' && body.text?.content === 'validation') {
      return res.status(200).json({
        msg_signature: body.msg_signature,
        timestamp: body.timestamp,
        nonce: body.nonce,
        encrypt: body.encrypt
      });
    }
    
    // 处理空消息验证（有些情况钉钉会发这种）
    if (!body.msgtype && !body.text) {
      return res.status(200).json({
        success: true,
        message: 'Endpoint verified'
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

    // 检查是否只是请求模板（用户发送"提报问题"但没有其他内容）
    const trimmedContent = messageContent.trim();
    const lines = messageContent.split('\n').filter(line => line.trim());
    
    // 判断是否只是请求模板
    const isTemplateRequest = 
      (trimmedContent === '提报问题' || trimmedContent === '新建badcase') ||
      (lines.length === 1 && (lines[0].includes('提报问题') || lines[0].includes('新建badcase')));
    
    if (isTemplateRequest) {
      // 发送模板消息
      const templateMessage = `📝 Badcase提报模板

请复制以下模板，填写完整后 @我 发送：

———————————————
提报问题
学科：【必填，如：英语/数学/语文/物理/化学】
分类：【必填，如：读音错误/停顿不当/重读不对/语速突变/音量突变/音质问题/其他】
优先级：【选填，P0/P1/P2，默认P2】
问题描述：【必填，详细描述问题】
出现位置：【选填，如：全程TTS做课部分/行课互动部分】
问题提报人：【必填，您的姓名】
课节ID：【选填】
问题模型ID：【必填】
期望修复时间：【必填，格式：2024-12-25】
———————————————

💡 提示：
• 【必填】字段不能为空
• 【选填】字段可删除或留空
• 优先级说明：
  P0-严重影响使用
  P1-重要需尽快修复
  P2-一般问题正常排期`;

      await sendMessageToDingTalk(senderId, templateMessage);
      
      return res.status(200).json({
        success: true,
        msg: '已发送模板'
      });
    }

    // 检查是否是提报问题的消息（包含完整信息）
    if (!messageContent.includes('提报问题') && !messageContent.includes('新建badcase')) {
      const helpMessage = `👋 您好！我是Badcase提报助手

🔹 如需提报问题，请发送：
   @我 提报问题

🔹 我会回复模板，您填写后再 @我 发送即可

🔹 查看帮助：
   @我 帮助`;

      await sendMessageToDingTalk(senderId, helpMessage);
      
      return res.status(200).json({
        success: true,
        msg: '已发送帮助信息'
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
    const priorityEmoji = data.priority === 'P0' ? '🔴' : data.priority === 'P1' ? '🟡' : '🟢';
    const locationText = data.location === 'full_tts' ? '全程TTS做课部分' : 
                        data.location === 'interactive' ? '行课互动部分' : data.location;
    
    const successMessage = `✅ Badcase提报成功！

📋 ID: ${data.id}
📚 学科: ${data.subject}
📂 分类: ${data.category}
${priorityEmoji} 优先级: ${data.priority}
${data.location ? `📍 出现位置: ${locationText}` : ''}
👤 问题提报人: ${data.reporter}
${data.cms_section_id ? `🆔 课节ID: ${data.cms_section_id}` : ''}
${data.model_id ? `🤖 问题模型ID: ${data.model_id}` : ''}
${data.expected_fix_date ? `⏰ 期望修复时间: ${data.expected_fix_date}` : ''}

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

