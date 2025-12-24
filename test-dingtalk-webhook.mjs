/**
 * 测试钉钉Webhook集成
 * 用法：node test-dingtalk-webhook.mjs
 */

const WEBHOOK_URL = 'http://localhost:3000/api/dingtalk-webhook'; // 本地测试
// const WEBHOOK_URL = 'https://your-project.vercel.app/api/dingtalk-webhook'; // 生产环境

// 测试用例
const testCases = [
  {
    name: '✅ 最简格式 - 只包含必填字段',
    payload: {
      msgtype: 'text',
      text: {
        content: `提报问题
学科：英语
分类：读音错误
描述：A相关的单词发音不准确`
      }
    }
  },
  {
    name: '✅ 完整格式 - 包含所有字段',
    payload: {
      msgtype: 'text',
      text: {
        content: `提报问题
学科：英语
位置：行课互动
CMS课节ID：123456
模型ID：model_abc123
分类：读音错误
描述：A相关的单词发音不准确，目前测到的文本：aim, able
提报人：张三
期望修复：2025-12-30`
      }
    }
  },
  {
    name: '✅ 全程TTS问题',
    payload: {
      msgtype: 'text',
      text: {
        content: `提报问题
学科：数学
位置：全程TTS
TTS课节ID：789012
分类：停顿不当
描述：讲解过程中停顿位置不合理
提报人：李四`
      }
    }
  },
  {
    name: '❌ 缺少必填字段 - 应该返回错误',
    payload: {
      msgtype: 'text',
      text: {
        content: `提报问题
学科：英语
描述：缺少分类字段`
      }
    }
  },
  {
    name: '⚠️  非提报消息 - 应该被忽略',
    payload: {
      msgtype: 'text',
      text: {
        content: `这是一条普通消息，不应该被处理`
      }
    }
  }
];

/**
 * 发送测试请求
 */
async function testWebhook(testCase) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`测试用例: ${testCase.name}`);
  console.log('='.repeat(60));
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase.payload)
    });
    
    const result = await response.json();
    
    console.log(`\n状态码: ${response.status}`);
    console.log('\n响应内容:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.content?.text) {
      console.log('\n机器人回复:');
      console.log(result.content.text);
    }
    
    return response.status === 200;
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
    return false;
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 开始测试钉钉Webhook集成...\n');
  console.log(`目标URL: ${WEBHOOK_URL}`);
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    const result = await testWebhook(testCase);
    if (result) {
      passed++;
    } else {
      failed++;
    }
    
    // 等待1秒后执行下一个测试
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试结果汇总');
  console.log('='.repeat(60));
  console.log(`总计: ${testCases.length} 个测试`);
  console.log(`✅ 成功: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  console.log('='.repeat(60) + '\n');
}

// 运行测试
runAllTests().catch(console.error);

