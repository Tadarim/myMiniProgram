import { query } from "./query";
import { RowDataPacket } from "mysql2";
import { sendVerificationEmail } from "./email";

interface VerificationCodeRow extends RowDataPacket {
  id: number;
  email: string;
  code: string;
  created_at: Date;
  expires_at: Date;
  is_used: boolean;
}

// 存储验证码的 Map，key 为邮箱，value 为 { code, timestamp }
const codeMap = new Map<string, { code: string; timestamp: number }>();

// 验证码有效期（5分钟）
const CODE_EXPIRATION = 5 * 60 * 1000;

// 生成6位随机验证码
export const generateCode = (): string => {
  return Math.random().toString().slice(-6);
};

// 保存验证码
export const saveCode = async (email: string, code: string): Promise<void> => {
  try {
    // 发送验证码邮件
    await sendVerificationEmail(email, code);

    // 保存验证码
    codeMap.set(email, {
      code,
      timestamp: Date.now(),
    });

    console.log(`验证码已发送到 ${email}`);
  } catch (error) {
    console.error("发送验证码失败:", error);
    throw new Error("发送验证码失败");
  }
};

// 验证验证码
export const verifyCode = (email: string, code: string): boolean => {
  const stored = codeMap.get(email);

  if (!stored) {
    console.log(`未找到 ${email} 的验证码`);
    return false;
  }

  // 检查验证码是否过期
  if (Date.now() - stored.timestamp > CODE_EXPIRATION) {
    console.log(`${email} 的验证码已过期`);
    codeMap.delete(email);
    return false;
  }

  // 验证码正确
  if (stored.code === code) {
    console.log(`${email} 验证码验证成功`);
    codeMap.delete(email);
    return true;
  }

  console.log(`${email} 验证码错误`);
  return false;
};

// 删除验证码
export const deleteCode = (email: string): void => {
  codeMap.delete(email);
  console.log(`已删除 ${email} 的验证码`);
};

// 保存验证码
export async function saveCodeDB(email: string, code: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5分钟后过期
  const sql = `
    INSERT INTO verification_codes (email, code, expires_at)
    VALUES (?, ?, ?)
  `;
  await query(sql, [email, code, expiresAt]);
}

// 验证验证码
export async function verifyCodeDB(
  email: string,
  code: string
): Promise<boolean> {
  const sql = `
    SELECT * FROM verification_codes
    WHERE email = ? AND code = ? AND expires_at > NOW() AND is_used = FALSE
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const result = await query<VerificationCodeRow[]>(sql, [email, code]);

  if (result.length === 0) {
    return false;
  }

  // 标记验证码为已使用
  const updateSql = `
    UPDATE verification_codes
    SET is_used = TRUE
    WHERE id = ?
  `;
  await query(updateSql, [result[0].id]);

  return true;
}

// 删除验证码
export async function deleteCodeDB(email: string): Promise<void> {
  const sql = `
    DELETE FROM verification_codes
    WHERE email = ? AND expires_at <= NOW()
  `;
  await query(sql, [email]);
}
