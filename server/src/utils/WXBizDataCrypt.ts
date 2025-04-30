import crypto from 'crypto';

interface DecryptedData {
  [key: string]: any;
}

class WXBizDataCrypt {
  private sessionKey: string;

  constructor(sessionKey: string) {
    this.sessionKey = sessionKey;
  }

  decryptData(encryptedData: string, iv: string): DecryptedData {
    // base64 decode
    const sessionKey = Buffer.from(this.sessionKey, 'base64');
    let decoded: DecryptedData | null = null;

    const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
    const ivBuffer = Buffer.from(iv, 'base64');

    try {
      // 解密
      const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, ivBuffer);
      // 设置自动 padding 为 true，删除填充补位
      decipher.setAutoPadding(true);
      let decrypted = decipher.update(encryptedDataBuffer, 'binary', 'utf8');
      decrypted += decipher.final('utf8');

      decoded = JSON.parse(decrypted);
    } catch (err) {
      throw new Error('Illegal Buffer');
    }

    return decoded;
  }
}

export default WXBizDataCrypt; 