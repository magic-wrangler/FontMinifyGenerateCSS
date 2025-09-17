const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 创建临时目录用于存储上传的字体文件
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 保留原始文件名
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

module.exports = { upload };