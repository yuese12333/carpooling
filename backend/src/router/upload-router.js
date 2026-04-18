/**
 * 文件功能：文件上传路由层，定义上传接口路径与请求方法
 * 关联业务：用户头像上传、车辆照片上传
 * 说明：multer 在此层配置并挂载，仅处理 multipart/form-data 的单文件字段 file
 */

'use strict';

const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const { uploadFileController } = require('../controller/upload-controller');

const router = express.Router();

// 文件存储配置：保存到 backend/uploads/ 目录，文件名加随机后缀防冲突
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), uploadFileController);

module.exports = router;
