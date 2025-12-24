/**
 * 钉钉加密解密工具类
 * 用于处理钉钉HTTP回调的加密验证
 * 
 * 官方文档：https://open.dingtalk.com/document/development/http-callback-overview
 * 
 * 实现说明：
 * 1. 使用AES-256-CBC加密算法
 * 2. 使用SHA1算法计算签名
 * 3. 消息格式：random(16字节) + msgLength(4字节) + msg + corpId
 * 4. 使用PKCS7填充方式
 */

import crypto from 'crypto';

export class DingTalkCrypto {
  private token: string;
  private encodingAesKey: string;
  private corpId: string;
  private aesKey: Buffer;

  constructor(token: string, encodingAesKey: string, corpId: string) {
    this.token = token;
    this.encodingAesKey = encodingAesKey;
    this.corpId = corpId;
    // encodingAesKey 是43位，需要补'='变成44位Base64字符串，然后解码成32字节的AES Key
    this.aesKey = Buffer.from(encodingAesKey + '=', 'base64') as Buffer;
  }

  /**
   * 计算签名
   * 
   * 按照钉钉官方规范：
   * 1. 将token、timestamp、nonce、encrypt四个参数按字典序排序
   * 2. 将排序后的字符串拼接
   * 3. 使用SHA1算法计算签名
   * 4. 返回十六进制格式的签名
   */
  private getSignature(timestamp: string, nonce: string, encrypt: string): string {
    const sortedArr = [this.token, timestamp, nonce, encrypt].sort();
    const str = sortedArr.join('');
    const sha1 = crypto.createHash('sha1');
    sha1.update(str);
    return sha1.digest('hex');
  }

  /**
   * 加密消息
   * 
   * 按照钉钉官方规范：
   * 1. 生成16字节的随机字符串
   * 2. 计算消息的字节长度（网络字节序，4字节）
   * 3. 拼接：random + msgLength + msg + corpId
   * 4. 使用PKCS7填充到32字节的倍数
   * 5. 使用AES-256-CBC加密（key和iv都使用aesKey的前16字节）
   * 6. Base64编码返回
   */
  public encrypt(text: string): string {
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
   * 
   * 按照钉钉官方规范：
   * 1. Base64解码
   * 2. 使用AES-256-CBC解密
   * 3. 去除PKCS7填充
   * 4. 提取消息：跳过random(16字节)，读取msgLength(4字节)，提取msg内容
   * 5. 返回明文消息
   */
  public decrypt(text: string): string {
    // Base64解码
    const textBuf = Buffer.from(text, 'base64');

    // AES解密
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.aesKey, this.aesKey.slice(0, 16));
    decipher.setAutoPadding(false);
    
    const decrypted = Buffer.concat([
      decipher.update(textBuf),
      decipher.final()
    ]) as Buffer;

    // 去除PKCS7补位
    const unpaddedBuffer = this.pkcs7Decode(decrypted);

    // 提取消息内容
    // 格式：随机字符串(16字节) + 消息长度(4字节) + 消息内容 + corpId
    const content = unpaddedBuffer.slice(16);
    const length = content.readUInt32BE(0);
    const message = content.slice(4, 4 + length).toString('utf8');

    return message;
  }

  /**
   * 验证签名
   */
  public verifySignature(
    signature: string,
    timestamp: string,
    nonce: string,
    encrypt: string
  ): boolean {
    const calculatedSignature = this.getSignature(timestamp, nonce, encrypt);
    return signature === calculatedSignature;
  }

  /**
   * 创建加密响应
   */
  public createEncryptedResponse(text: string, timestamp: string, nonce: string): {
    msg_signature: string;
    timeStamp: string;
    nonce: string;
    encrypt: string;
  } {
    const encrypt = this.encrypt(text);
    const msg_signature = this.getSignature(timestamp, nonce, encrypt);

    return {
      msg_signature,
      timeStamp: timestamp,
      nonce,
      encrypt
    };
  }

  /**
   * PKCS7补位
   */
  private pkcs7Encode(buf: Buffer): Buffer {
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
  private pkcs7Decode(buf: Buffer): Buffer {
    const pad = buf[buf.length - 1];
    return buf.slice(0, buf.length - pad) as Buffer;
  }
}

