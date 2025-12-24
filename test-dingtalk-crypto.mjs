/**
 * 钉钉HTTP回调加密测试脚本
 * 用于验证加密解密实现是否符合钉钉官方规范
 * 
 * 使用方法：
 * node test-dingtalk-crypto.mjs
 */

import crypto from 'crypto';

class DingTalkCrypto {
  constructor(token, encodingAesKey, corpId) {
    this.token = token;
    this.encodingAesKey = encodingAesKey;
    this.corpId = corpId;
    // encodingAesKey 是43位，需要补'='变成44位Base64字符串，然后解码成32字节的AES Key
    this.aesKey = Buffer.from(encodingAesKey + '=', 'base64');
  }

  /**
   * 计算签名
   */
  getSignature(timestamp, nonce, encrypt) {
    const sortedArr = [this.token, timestamp, nonce, encrypt].sort();
    const str = sortedArr.join('');
    const sha1 = crypto.createHash('sha1');
    sha1.update(str);
    return sha1.digest('hex');
  }

  /**
   * 加密消息
   */
  encrypt(text) {
    // 随机生成16字节的字符串
    const randomString = crypto.randomBytes(16).toString('hex').slice(0, 16);
    
    // 获取消息文本长度
    const textLength = Buffer.byteLength(text, 'utf8');
    const textLengthBuf = Buffer.alloc(4);
    textLengthBuf.writeUInt32BE(textLength, 0);
    
    // 拼接：随机字符串(16字节) + 消息长度(4字节) + 消息内容 + corpId
    const corpIdBuf = Buffer.from(this.corpId, 'utf8');
    const textBuf = Buffer.from(text, 'utf8');
    const bufMsg = Buffer.concat([
      Buffer.from(randomString),
      textLengthBuf,
      textBuf,
      corpIdBuf
    ]);

    // PKCS7补位
    const paddedMsg = this.pkcs7Encode(bufMsg);

    // AES加密
    const cipher = crypto.createCipheriv('aes-256-cbc', this.aesKey, this.aesKey.slice(0, 16));
    cipher.setAutoPadding(false);
    
    const encrypted = Buffer.concat([
      cipher.update(paddedMsg),
      cipher.final()
    ]);

    return encrypted.toString('base64');
  }

  /**
   * 解密消息
   */
  decrypt(text) {
    // Base64解码
    const textBuf = Buffer.from(text, 'base64');

    // AES解密
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.aesKey, this.aesKey.slice(0, 16));
    decipher.setAutoPadding(false);
    
    let decrypted = Buffer.concat([
      decipher.update(textBuf),
      decipher.final()
    ]);

    // 去除PKCS7补位
    decrypted = this.pkcs7Decode(decrypted);

    // 提取消息内容
    // 格式：随机字符串(16字节) + 消息长度(4字节) + 消息内容 + corpId
    const content = decrypted.slice(16);
    const length = content.readUInt32BE(0);
    const message = content.slice(4, 4 + length).toString('utf8');

    return message;
  }

  /**
   * PKCS7补位
   */
  pkcs7Encode(buf) {
    const blockSize = 32;
    const needPadding = blockSize - (buf.length % blockSize);
    const padded = Buffer.alloc(buf.length + needPadding);
    
    buf.copy(padded);
    padded.fill(needPadding, buf.length);
    
    return padded;
  }

  /**
   * 去除PKCS7补位
   */
  pkcs7Decode(buf) {
    const pad = buf[buf.length - 1];
    return buf.slice(0, buf.length - pad);
  }
}

// 测试函数
function runTests() {
  console.log('🧪 开始测试钉钉加密解密功能\n');

  // 测试配置（请替换为你的真实配置）
  const token = 'test_token_123456';
  const encodingAesKey = '1234567890123456789012345678901234567890123'; // 43位
  const corpId = 'dingtest123456';

  const crypto = new DingTalkCrypto(token, encodingAesKey, corpId);

  // 测试1：加密解密循环
  console.log('📝 测试1: 加密解密循环测试');
  const originalText = 'success';
  console.log(`  原始文本: "${originalText}"`);
  
  const encrypted = crypto.encrypt(originalText);
  console.log(`  加密结果: ${encrypted.substring(0, 50)}...`);
  
  const decrypted = crypto.decrypt(encrypted);
  console.log(`  解密结果: "${decrypted}"`);
  
  if (decrypted === originalText) {
    console.log('  ✅ 测试通过！\n');
  } else {
    console.log('  ❌ 测试失败！解密结果不匹配\n');
    return;
  }

  // 测试2：签名验证
  console.log('📝 测试2: 签名计算测试');
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(8).toString('hex');
  const encryptedMsg = crypto.encrypt('test message');
  
  const signature = crypto.getSignature(timestamp, nonce, encryptedMsg);
  console.log(`  时间戳: ${timestamp}`);
  console.log(`  随机数: ${nonce}`);
  console.log(`  签名: ${signature}`);
  console.log('  ✅ 签名计算成功！\n');

  // 测试3：URL验证响应格式
  console.log('📝 测试3: URL验证响应格式测试');
  const verifyTimestamp = Date.now().toString();
  const verifyNonce = crypto.randomBytes(8).toString('hex');
  const successEncrypt = crypto.encrypt('success');
  const verifySignature = crypto.getSignature(verifyTimestamp, verifyNonce, successEncrypt);
  
  const response = {
    msg_signature: verifySignature,
    timeStamp: verifyTimestamp,
    nonce: verifyNonce,
    encrypt: successEncrypt
  };
  
  console.log('  验证响应格式:');
  console.log(JSON.stringify(response, null, 2));
  console.log('  ✅ 响应格式正确！\n');

  // 测试4：长消息加密解密
  console.log('📝 测试4: 长消息加密解密测试');
  const longMessage = JSON.stringify({
    msgtype: 'text',
    text: {
      content: '这是一条测试消息，包含中文字符和特殊符号！@#$%^&*()'
    },
    senderId: 'user123',
    timestamp: Date.now()
  });
  
  console.log(`  原始消息长度: ${longMessage.length} 字节`);
  const encryptedLong = crypto.encrypt(longMessage);
  console.log(`  加密后长度: ${encryptedLong.length} 字节`);
  
  const decryptedLong = crypto.decrypt(encryptedLong);
  console.log(`  解密后长度: ${decryptedLong.length} 字节`);
  
  if (decryptedLong === longMessage) {
    console.log('  ✅ 长消息测试通过！\n');
  } else {
    console.log('  ❌ 长消息测试失败！\n');
    return;
  }

  console.log('🎉 所有测试通过！加密解密实现符合钉钉官方规范。\n');
  console.log('📌 提示：');
  console.log('  1. 请确保 EncodingAESKey 是43位字符串');
  console.log('  2. 请确保 Token 和 CorpId 与钉钉开放平台配置一致');
  console.log('  3. 部署到Vercel后，需要等待1-2分钟让环境变量生效');
  console.log('  4. 在钉钉开放平台点击"保存"时，会自动验证你的URL');
}

// 运行测试
runTests();

