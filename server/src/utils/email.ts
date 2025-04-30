import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

interface SMTPError extends Error {
  code?: string;
  command?: string;
}

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: "smtp.qq.com",
  port: 465,
  secure: true, // 使用SSL
  auth: {
    user: process.env.EMAIL_USER, // QQ邮箱
    pass: process.env.EMAIL_PASS, // QQ邮箱授权码
  },
  authMethod: "PLAIN", // 明确指定使用PLAIN认证
});

// 测试邮件配置
transporter.verify(function (error: SMTPError | null, success) {
  if (error) {
    console.error("邮件服务配置错误:", error);
    console.error("详细错误信息:", {
      code: error.code,
      command: error.command,
      message: error.message,
    });
  } else {
    console.log("邮件服务配置成功");
  }
});

// 发送验证码邮件
export const sendVerificationEmail = async (to: string, code: string) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: "验证码 - 学习助手",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">学习助手验证码</h2>
          <p style="color: #666;">您的验证码是：</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #1890ff;">${code}</span>
          </div>
          <p style="color: #999; font-size: 12px;">此验证码5分钟内有效，请尽快使用。</p>
          <p style="color: #999; font-size: 12px;">如果不是您本人操作，请忽略此邮件。</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("邮件发送成功:", info.messageId);
    return true;
  } catch (error) {
    const smtpError = error as SMTPError;
    console.error("发送邮件失败:", smtpError);
    console.error("详细错误信息:", {
      code: smtpError.code,
      command: smtpError.command,
      message: smtpError.message,
    });
    throw error;
  }
};

// 发送重置密码邮件
export const sendResetPasswordEmail = async (to: string, resetLink: string) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: "重置密码 - 学习助手",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">重置密码</h2>
          <p style="color: #666;">请点击下面的链接重置您的密码：</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetLink}" 
               style="display: inline-block; padding: 10px 20px; background-color: #1890ff; color: white; text-decoration: none; border-radius: 4px;">
               重置密码
            </a>
          </div>
          <p style="color: #999; font-size: 12px;">此链接30分钟内有效，请尽快使用。</p>
          <p style="color: #999; font-size: 12px;">如果不是您本人操作，请忽略此邮件。</p>
      </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending reset password email:", error);
    throw error;
  }
};
