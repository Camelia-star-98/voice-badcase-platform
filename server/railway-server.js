/**
 * Railway 服务器入口文件
 * 同时提供前端静态文件和 API 端点
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { DingTalkCrypto } from '../api/dingtalk-crypto.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Supabase 配置
console.log('🔍 检查 Supabase 环境变量:');
console.log('  SUPABASE_URL:', process.env.SUPABASE_URL ? `✅ ${process.env.SUPABASE_URL}` : '❌ 未设置');
console.log('  VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? `✅ ${process.env.VITE_SUPABASE_URL}` : '❌ 未设置');
console.log('  SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已设置' : '❌ 未设置');
console.log('  VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ 已设置' : '❌ 未设置');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

// 延迟创建 Supabase 客户端，避免启动时因缺少环境变量而崩溃
let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase 客户端初始化成功');
} else {
  console.warn('⚠️  Supabase 环境变量未配置，数据库功能将不可用');
}

// 钉钉配置
console.log('🔍 检查钉钉环境变量:');
console.log('  DINGTALK_APP_KEY:', process.env.DINGTALK_APP_KEY ? '✅ 已设置' : '❌ 未设置');
console.log('  VITE_DINGTALK_APP_KEY:', process.env.VITE_DINGTALK_APP_KEY ? '✅ 已设置' : '❌ 未设置');
console.log('  DINGTALK_TOKEN:', process.env.DINGTALK_TOKEN ? '✅ 已设置' : '❌ 未设置');
console.log('  VITE_DINGTALK_TOKEN:', process.env.VITE_DINGTALK_TOKEN ? '✅ 已设置' : '❌ 未设置');

const DINGTALK_APP_KEY = process.env.VITE_DINGTALK_APP_KEY || process.env.DINGTALK_APP_KEY || '';
const DINGTALK_APP_SECRET = process.env.VITE_DINGTALK_APP_SECRET || process.env.DINGTALK_APP_SECRET || '';
const DINGTALK_AGENT_ID = process.env.VITE_DINGTALK_AGENT_ID || process.env.DINGTALK_AGENT_ID || '';
const DINGTALK_TOKEN = process.env.VITE_DINGTALK_TOKEN || process.env.DINGTALK_TOKEN || '';
const DINGTALK_AES_KEY = process.env.VITE_DINGTALK_ENCODING_AES_KEY || process.env.DINGTALK_ENCODING_AES_KEY || '';
const DINGTALK_CORP_ID = process.env.VITE_DINGTALK_CORP_ID || process.env.DINGTALK_CORP_ID || '';

// 初始化加密工具
let cryptoHelper = null;
if (DINGTALK_TOKEN && DINGTALK_AES_KEY && DINGTALK_CORP_ID) {
  cryptoHelper = new DingTalkCrypto(DINGTALK_TOKEN, DINGTALK_AES_KEY, DINGTALK_CORP_ID);
  console.log('✅ 加密工具初始化成功');
}

// 读取并处理 index.html，注入环境变量
let indexHtmlCache = null;
function getIndexHtml() {
  if (indexHtmlCache) return indexHtmlCache;
  
  const indexPath = path.join(__dirname, '../dist/index.html');
  let html = fs.readFileSync(indexPath, 'utf-8');
  
  // 在 <head> 中注入环境变量
  const envScript = `
    <script>
      window.ENV = {
        VITE_SUPABASE_URL: '${supabaseUrl || ''}',
        VITE_SUPABASE_ANON_KEY: '${supabaseKey || ''}',
        VITE_DINGTALK_APP_KEY: '${DINGTALK_APP_KEY || ''}',
        VITE_DINGTALK_APP_SECRET: '${DINGTALK_APP_SECRET || ''}',
        VITE_DINGTALK_AGENT_ID: '${DINGTALK_AGENT_ID || ''}',
        VITE_DINGTALK_CORP_ID: '${DINGTALK_CORP_ID || ''}',
        VITE_DINGTALK_ENCODING_AES_KEY: '${DINGTALK_AES_KEY || ''}'
      };
    </script>
  `;
  
  html = html.replace('</head>', `${envScript}</head>`);
  indexHtmlCache = html;
  
  return html;
}

// 日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    config: {
      hasSupabase: !!supabaseUrl && !!supabaseKey,
      hasDingTalk: !!DINGTALK_APP_KEY && !!DINGTALK_APP_SECRET,
      hasCrypto: !!cryptoHelper
    }
  });
});

/**
 * 验证钉钉签名
 */
function verifyDingTalkSignature(timestamp, sign, content) {
  if (!DINGTALK_APP_SECRET) return true;
  
  const stringToSign = `${timestamp}\n${content}`;
  const hmac = crypto.createHmac('sha256', DINGTALK_APP_SECRET);
  const signature = hmac.update(stringToSign).digest('base64');
  
  return signature === sign;
}

/**
 * 解析 Badcase 信息
 */
function parseBadcaseFromMessage(text) {
  const lines = text.split('\n').map(line => line.trim());
  const data = {
    subject: '',
    location: '',
    category: '',
    description: '',
    reporter: '',
    priority: 'P2',
    cms_section_id: null,
    tts_section_id: null,
    model_id: null,
    expected_fix_date: null,
    submit_date: new Date().toISOString().split('T')[0],
    status: 'pending',
  };

  for (const line of lines) {
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
      if (location.includes('大班衔接课互动')) {
        data.location = 'large_class_interactive';
      } else if (location.includes('一对一衔接课互动')) {
        data.location = 'one_on_one_interactive';
      } else if (location.includes('全程TTS做课') || (location.includes('全程') && location.includes('做课'))) {
        data.location = 'full_tts_lesson';
      } else if (location.includes('全程TTS互动') || (location.includes('全程') && location.includes('互动'))) {
        data.location = 'full_tts_interactive';
      } else if (location.includes('英语背单词')) {
        data.location = 'english_word_recitation';
      } else if (location.includes('TTS') || location.includes('做课') || location.includes('全程')) {
        // 兼容旧格式
        data.location = 'full_tts_lesson';
      } else if (location.includes('互动') || location.includes('行课')) {
        // 兼容旧格式，默认为大班衔接课互动
        data.location = 'large_class_interactive';
      } else if (location) {
        data.location = location;
      }
    } else if (line.includes('优先级：') || line.includes('优先级:')) {
      const priority = line.split(/[：:]/)[1]?.trim().toUpperCase().replace(/【.*?】/g, '') || 'P2';
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
 * 生成唯一 ID
 */
function generateUniqueId() {
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
 * 发送消息到钉钉
 */
async function sendMessageToDingTalk(userId, message) {
  try {
    const tokenResponse = await fetch(
      `https://oapi.dingtalk.com/gettoken?appkey=${DINGTALK_APP_KEY}&appsecret=${DINGTALK_APP_SECRET}`
    );
    const tokenData = await tokenResponse.json();
    
    if (tokenData.errcode !== 0) {
      console.error('获取access_token失败:', tokenData);
      return false;
    }

    const accessToken = tokenData.access_token;

    const sendResponse = await fetch(
      `https://oapi.dingtalk.com/topapi/message/corpconversation/asyncsend_v2?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: DINGTALK_AGENT_ID,
          userid_list: userId,
          msg: {
            msgtype: 'text',
            text: { content: message }
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
 * 钉钉机器人回调端点
 */
app.all('/api/dingtalk-bot', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // HEAD 请求
    if (req.method === 'HEAD') {
      return res.status(200).end();
    }
    
    // GET 请求 - 验证端点
    if (req.method === 'GET') {
      const { msg_signature, timestamp, nonce } = req.query;
      return res.status(200).json({
        msg_signature,
        timestamp,
        nonce,
        message: 'DingTalk bot endpoint is ready',
        config: {
          hasToken: !!DINGTALK_TOKEN,
          hasAESKey: !!DINGTALK_AES_KEY,
          hasCorpId: !!DINGTALK_CORP_ID,
          hasCryptoHelper: !!cryptoHelper
        }
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = req.body;
    console.log('POST请求Body:', JSON.stringify(body, null, 2));

    // 处理加密消息
    if (body.encrypt && cryptoHelper) {
      const { msg_signature, timestamp, nonce, encrypt } = body;
      
      if (!cryptoHelper.verifySignature(msg_signature, timestamp, nonce, encrypt)) {
        console.error('❌ 签名校验失败');
        return res.status(401).json({ error: 'Invalid signature' });
      }

      try {
        const decrypted = cryptoHelper.decrypt(encrypt);
        console.log('✅ 解密成功:', decrypted);
        
        try {
          const decryptedData = JSON.parse(decrypted);
          if (decryptedData.msgtype) {
            const response = cryptoHelper.createEncryptedResponse('success', timestamp, nonce);
            return res.status(200).json(response);
          }
        } catch {
          // URL 验证
        }
        
        const response = cryptoHelper.createEncryptedResponse('success', timestamp, nonce);
        const elapsed = Date.now() - startTime;
        console.log(`处理完成，耗时: ${elapsed}ms`);
        return res.status(200).json(response);
      } catch (decryptError) {
        console.error('❌ 解密失败:', decryptError);
        return res.status(400).json({ error: 'Decrypt failed' });
      }
    }

    // 处理文本消息
    const msgtype = body.msgtype;
    
    if (msgtype !== 'text') {
      return res.status(200).json({
        success: false,
        msg: '仅支持文本消息'
      });
    }

    const messageContent = body.text?.content || '';
    const senderId = body.senderId || body.senderStaffId || '';

    const trimmedContent = messageContent.trim();
    const lines = messageContent.split('\n').filter(line => line.trim());
    
    const isTemplateRequest = 
      (trimmedContent === '提报问题' || trimmedContent === '新建badcase') ||
      (lines.length === 1 && (lines[0].includes('提报问题') || lines[0].includes('新建badcase')));
    
    if (isTemplateRequest) {
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

    const badcaseData = parseBadcaseFromMessage(messageContent);

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

    const now = new Date().toISOString();
    const newBadcase = {
      id: generateUniqueId(),
      ...badcaseData,
      created_at: now,
      updated_at: now,
    };

    // 检查 Supabase 是否已初始化
    if (!supabase) {
      console.error('Supabase 未初始化');
      
      await sendMessageToDingTalk(
        senderId,
        `❌ 数据库未配置，无法保存Badcase\n\n请联系管理员配置环境变量。`
      );
      
      return res.status(200).json({
        success: false,
        msg: `❌ 数据库未配置`
      });
    }

    const { data, error } = await supabase
      .from('badcases')
      .insert([newBadcase])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      
      await sendMessageToDingTalk(
        senderId,
        `❌ 数据库写入失败：${error.message}\n\n请联系管理员或稍后重试。`
      );
      
      return res.status(200).json({
        success: false,
        msg: `❌ 数据库写入失败`
      });
    }

    const priorityEmoji = data.priority === 'P0' ? '🔴' : data.priority === 'P1' ? '🟡' : '🟢';
    const locationTextMap = {
      'large_class_interactive': '大班衔接课互动',
      'one_on_one_interactive': '一对一衔接课互动',
      'full_tts_lesson': '全程TTS做课',
      'full_tts_interactive': '全程TTS互动',
      'english_word_recitation': '英语背单词',
      // 兼容旧格式
      'full_tts': '全程TTS做课',
      'interactive': '行课互动部分',
    };
    const locationText = locationTextMap[data.location] || data.location || '';
    
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

    await sendMessageToDingTalk(senderId, successMessage);

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
});

// 静态文件服务（前端）
app.use(express.static(path.join(__dirname, '../dist')));

// 所有其他路由返回动态注入环境变量的 index.html（SPA）
app.get('*', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(getIndexHtml());
});

// 启动服务器
// Railway 需要监听 0.0.0.0 而不是 localhost
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 服务器启动成功！`);
  console.log(`📍 监听端口: ${PORT}`);
  console.log(`🌐 环境: ${process.env.NODE_ENV || 'production'}`);
  console.log(`✅ Supabase: ${supabaseUrl ? '已配置' : '未配置'}`);
  console.log(`✅ 钉钉: ${DINGTALK_APP_KEY ? '已配置' : '未配置'}`);
});

