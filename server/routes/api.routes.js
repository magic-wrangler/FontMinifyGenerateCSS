const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const fontController = require('../controllers/fontController');
const { upload } = require('../config/multer.config');

// 上传字体文件的API端点
router.post('/upload-fonts', upload.array('fonts'), fontController.uploadFonts);

// 生成CSS的API端点
router.post('/generate-css', fontController.generateCSS);

// 获取会话信息的API端点
// router.get('/session/:sessionId', fontController.getSessionInfo);

// 获取指定文件内容的API端点
router.post('/get-files', fontController.getSpecificFiles);

module.exports = router;