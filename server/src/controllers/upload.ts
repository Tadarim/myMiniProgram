import { Request, Response } from "express";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as fsPromises from "fs/promises";
import qiniu from "qiniu";
import { pipeline } from "stream/promises";
import dotenv from "dotenv";

import { formatDateToMySQL } from "../utils/formatDate";
import { query } from "../utils/query";

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

console.log(process.env.QINIU_ACCESS_KEY);

// 七牛云配置
const accessKey = process.env.QINIU_ACCESS_KEY;
const secretKey = process.env.QINIU_SECRET_KEY;
const bucket = process.env.QINIU_BUCKET;
const domain = process.env.QINIU_DOMAIN;

// 创建七牛云上传凭证
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const putPolicy = new qiniu.rs.PutPolicy({
  scope: bucket,
  expires: 7200,
});
const uploadToken = putPolicy.uploadToken(mac);

// 确保上传目录存在
const uploadDir = path.join(__dirname, "../../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 获取文件类型
function getFileType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case ".pdf":
      return "pdf";
    case ".doc":
    case ".docx":
      return "doc";
    case ".ppt":
    case ".pptx":
      return "ppt";
    case ".txt":
      return "txt";
    case ".jpg":
    case ".jpeg":
    case ".png":
    case ".gif":
      return "image";
    case ".mp4":
    case ".avi":
    case ".mov":
      return "video";
    case ".mp3":
    case ".wav":
      return "audio";
    default:
      return "other";
  }
}

// 定义上传到七牛云的函数
async function uploadToQiniu(
  filePath: string,
  fileName: string
): Promise<{ url: string; fileName: string; fileType: string }> {
  const key = `${uuidv4()}${path.extname(fileName)}`;
  console.log("准备上传到七牛云:", key);

  if (!domain) {
    throw new Error("七牛云域名未配置");
  }

  if (!accessKey || !secretKey) {
    throw new Error("七牛云密钥未配置");
  }

  // 检查文件是否存在
  if (!fs.existsSync(filePath)) {
    throw new Error("文件不存在");
  }

  // 检查文件大小
  const stats = fs.statSync(filePath);
  console.log("上传文件大小:", stats.size, "bytes");
  if (stats.size === 0) {
    throw new Error("文件大小为0");
  }

  const config = new qiniu.conf.Config();
  config.zone = qiniu.zone.Zone_z1; // 华北区域
  config.useCdnDomain = true;
  const formUploader = new qiniu.form_up.FormUploader(config);
  const putExtra = new qiniu.form_up.PutExtra();

  // 设置文件类型
  const mimeType = getMimeType(fileName);
  putExtra.mimeType = mimeType;

  return new Promise((resolve, reject) => {
    formUploader.putFile(
      uploadToken,
      key,
      filePath,
      putExtra,
      (err, body, info) => {
        if (err) {
          console.error("七牛云上传错误:", err);
          reject(err);
          return;
        }
        if (info.statusCode !== 200) {
          console.error("七牛云上传失败:", info);
          reject(new Error("七牛云上传失败"));
          return;
        }

        console.log("七牛云上传成功:", body);
        console.log("上传响应信息:", info);

        // 生成私有下载链接
        const deadline = Math.floor(Date.now() / 1000) + 3600; // 1小时有效期
        const bucketManager = new qiniu.rs.BucketManager(mac, config);
        
        // 确保域名格式正确
        const baseUrl = domain.startsWith('http') ? domain : `http://${domain}`;
        
        // 生成私有下载链接
        const encodedFileName = encodeURIComponent(fileName);
        const privateDownloadUrl = bucketManager.privateDownloadUrl(
          baseUrl,
          key,
          deadline
        ) + `&attname=${encodedFileName}`;

        console.log("生成的下载链接:", privateDownloadUrl);
        console.log("使用的域名:", baseUrl);
        console.log("文件key:", key);
        console.log("MIME类型:", mimeType);
        console.log("原始文件名:", fileName);
        console.log("编码后的文件名:", encodedFileName);

        resolve({
          url: privateDownloadUrl,
          fileName: fileName,
          fileType: getFileType(fileName),
        });
      }
    );
  });
}

// 获取文件的 MIME 类型
function getMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case '.pdf':
      return 'application/pdf';
    case '.doc':
      return 'application/msword';
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.ppt':
      return 'application/vnd.ms-powerpoint';
    case '.pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case '.txt':
      return 'text/plain';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.mp4':
      return 'video/mp4';
    case '.mp3':
      return 'audio/mpeg';
    default:
      return 'application/octet-stream';
  }
}

// 文件上传接口
export const uploadMaterial = async (req: Request, res: Response) => {
  try {
    console.log("请求体:", req.body);
    console.log("请求文件:", req.files);
    console.log("请求头:", req.headers);

    if (!req.files || !req.files.file) {
      console.error("未找到上传的文件，请求体:", req.body);
      return res.status(400).json({ error: "未找到上传的文件" });
    }

    const file = Array.isArray(req.files.file) ? req.files.file[0] : req.files.file;
    const fileName = req.body.fileName || file.name;
    const chapterId = req.body.chapterId;

    console.log("收到上传请求:", {
      fileName,
      fileSize: file.size,
      chapterId,
      mimeType: file.mimetype,
      path: file.tempFilePath
    });

    // 检查文件是否存在
    if (!fs.existsSync(file.tempFilePath)) {
      console.error("临时文件不存在:", file.tempFilePath);
      return res.status(400).json({ error: "临时文件不存在" });
    }

    // 检查文件大小
    const stats = fs.statSync(file.tempFilePath);
    console.log("文件实际大小:", stats.size, "bytes");
    if (stats.size === 0) {
      console.error("文件大小为0:", file.tempFilePath);
      return res.status(400).json({ error: "文件大小为0" });
    }

    // 上传到七牛云
    console.log("开始上传到七牛云...");
    const qiniuResult = await uploadToQiniu(file.tempFilePath, fileName);
    console.log("七牛云上传结果:", qiniuResult);

    // 保存到数据库
    const sql = `
      INSERT INTO materials (chapter_id, title, type, url, created_at, status, order_num)
      SELECT ?, ?, ?, ?, ?, 'pending', COALESCE(MAX(order_num), 0) + 1
      FROM materials
      WHERE chapter_id = ?
    `;
    
    const values = [
      chapterId,
      fileName,
      qiniuResult.fileType,
      qiniuResult.url,
      formatDateToMySQL(new Date()),
      chapterId
    ];

    const result = await query(sql, values);
    console.log("数据库保存结果:", result);

    // 删除临时文件
    try {
      await fsPromises.unlink(file.tempFilePath);
      console.log("临时文件已删除:", file.tempFilePath);
    } catch (unlinkError) {
      console.error("删除临时文件失败:", unlinkError);
    }

    res.json({
      success: true,
      data: {
        id: (result as any).insertId,
        fileName: fileName,
        fileType: qiniuResult.fileType,
        url: qiniuResult.url,
        created_at: formatDateToMySQL(new Date())
      }
    });
  } catch (error) {
    console.error("上传文件失败:", error);
    res.status(500).json({ 
      success: false,
      error: "上传文件失败",
      message: error instanceof Error ? error.message : "未知错误"
    });
  }
};

// 获取七牛云上传凭证接口
export const getQiniuToken = (req: Request, res: Response) => {
  try {
    const key = `${uuidv4()}${path.extname(
      (req.query.fileName as string) || ""
    )}`;
    res.json({
      uploadToken,
      key,
      domain,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "获取上传凭证失败",
    });
  }
};
