const path = require('path');
const fs = require('fs');
const { processFontFiles } = require('../services/fontProcessor');
const logger = require('../utils/logger');
const { 
  ERROR_MESSAGES_EN: ERROR_MESSAGES, 
  SUCCESS_MESSAGES_EN: SUCCESS_MESSAGES 
} = require('../config/messages');
const { success, error, validationError, notFound } = require('../utils/response');
const { BusinessError, NotFoundError } = require('../utils/errors');

// 生成唯一的会话ID
function generateSessionId() {
  return (
    'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15)
  );
}

// 上传字体文件处理
exports.uploadFonts = (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return validationError(res, [{ field: 'files', message: ERROR_MESSAGES.NO_FILES_UPLOADED }]);
    }

    const text = req.body.text || '';

    // 获取会话ID，如果不存在则创建新的
    const sessionId = req.body.sessionId || generateSessionId();

    // 为每个上传的字体文件创建一个目录
    const fontDirs = [];

    // 创建以当前日期命名的文件夹（格式：YYYY-MM-DD）
    const now = new Date();
    const dateFolder = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const dateFolderPath = path.join(__dirname, '..', 'uploads', dateFolder);

    // 确保日期文件夹存在
    if (!fs.existsSync(dateFolderPath)) {
      fs.mkdirSync(dateFolderPath, { recursive: true });
    }

    // 创建会话文件夹
    const sessionFolder = path.join(dateFolderPath, sessionId);
    if (!fs.existsSync(sessionFolder)) {
      fs.mkdirSync(sessionFolder, { recursive: true });
    }

    req.files.forEach((file) => {
      const fontName = path.basename(
        file.originalname,
        path.extname(file.originalname)
      );

      // 在会话文件夹中使用字体名称作为文件夹名
      const fontDir = path.join(sessionFolder, fontName);

      // 创建字体目录
      if (!fs.existsSync(fontDir)) {
        fs.mkdirSync(fontDir, { recursive: true });
      }

      // 移动字体文件到对应目录
      fs.copyFileSync(file.path, path.join(fontDir, file.originalname));

      // 删除临时上传文件
      fs.unlinkSync(file.path);

      // 创建index.txt文件，包含要提取的文字
      fs.writeFileSync(path.join(fontDir, 'index.txt'), text);

      fontDirs.push(fontDir);
    });

    const responseData = {
      code: 0,
      msg: SUCCESS_MESSAGES.UPLOAD_SUCCESS,
      data: {
        sessionId: sessionId,
        fontDirs: fontDirs,
      },
    };

    // 记录成功信息到控制台
    console.log(`[SUCCESS] /api/upload-fonts - sessionId: ${sessionId}, fontCount: ${req.files.length}`);

    return success(res, {
      sessionId: sessionId,
      fontDirs: fontDirs,
    }, SUCCESS_MESSAGES.UPLOAD_SUCCESS);
  } catch (err) {
    // 记录错误到日志文件
    logger.error(ERROR_MESSAGES.UPLOAD_PROCESSING_ERROR, err, {
      sessionId: req.body.sessionId,
    });
    return next(new BusinessError(ERROR_MESSAGES.UPLOAD_PROCESSING_ERROR));
  }
};

// 生成CSS处理
exports.generateCSS = async (req, res, next) => {
  try {
    // 获取会话ID
    const sessionId = req.body.sessionId;
    if (!sessionId) {
      return validationError(res, [{ field: 'sessionId', message: ERROR_MESSAGES.MISSING_SESSION_ID }]);
    }

    const text = req.body.text || '';
    const outputDir = path.join(__dirname, '..', 'output');
    const uploadsDir = path.join(__dirname, '..', 'uploads');

    // 获取要处理的字体名称列表
    const fontNames = req.body.fontNames
      ? Array.isArray(req.body.fontNames)
        ? req.body.fontNames
        : JSON.parse(req.body.fontNames)
      : null;
    
    if (!fontNames || !Array.isArray(fontNames) || fontNames.length === 0) {
      return validationError(res, [{ field: 'fontNames', message: ERROR_MESSAGES.INVALID_FONT_NAMES_FORMAT }]);
    }

    // 处理字体文件并生成CSS
    const result = await processFontFiles(sessionId, fontNames, text, uploadsDir, outputDir);

    const responseData = {
      code: 0,
      msg: SUCCESS_MESSAGES.GENERATE_SUCCESS,
      data: result,
    };

    // 记录成功信息到控制台
    console.log(`[SUCCESS] /api/generate-css - sessionId: ${sessionId}, fontCount: ${fontNames.length}`);

    return success(res, result, SUCCESS_MESSAGES.GENERATE_SUCCESS);
  } catch (err) {
    // 记录错误到日志文件
    logger.error(ERROR_MESSAGES.GENERATE_PROCESSING_ERROR, err, {
      sessionId: req.body.sessionId,
    });
    return next(new BusinessError(ERROR_MESSAGES.GENERATE_PROCESSING_ERROR));
  }
};

// 获取会话信息
exports.getSessionInfo = (req, res, next) => {
  try {
    const sessionId = req.params.sessionId;
    if (!sessionId) {
      return validationError(res, [{ field: 'sessionId', message: ERROR_MESSAGES.MISSING_SESSION_ID }]);
    }

    // 查找会话目录
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const sessionInfo = {
      sessionId: sessionId,
      fonts: [],
      exists: false
    };

    // 遍历日期目录查找会话
    const dateFolders = fs.readdirSync(uploadsDir).filter(folder => 
      fs.statSync(path.join(uploadsDir, folder)).isDirectory()
    );

    for (const dateFolder of dateFolders) {
      const sessionPath = path.join(uploadsDir, dateFolder, sessionId);
      if (fs.existsSync(sessionPath)) {
        sessionInfo.exists = true;
        sessionInfo.dateFolder = dateFolder;
        
        // 获取字体信息
        const fontFolders = fs.readdirSync(sessionPath).filter(folder => 
          fs.statSync(path.join(sessionPath, folder)).isDirectory()
        );
        
        for (const fontFolder of fontFolders) {
          const fontPath = path.join(sessionPath, fontFolder);
          const fontFiles = fs.readdirSync(fontPath).filter(file => 
            file.endsWith('.ttf') || file.endsWith('.otf')
          );
          
          if (fontFiles.length > 0) {
            sessionInfo.fonts.push({
              name: fontFolder,
              files: fontFiles
            });
          }
        }
        
        break;
      }
    }

    if (!sessionInfo.exists) {
      return notFound(res, ERROR_MESSAGES.SESSION_NOT_FOUND);
    }

    return success(res, sessionInfo, SUCCESS_MESSAGES.SESSION_FOUND);
  } catch (err) {
    logger.error(ERROR_MESSAGES.SESSION_PROCESSING_ERROR, err, {
      sessionId: req.params.sessionId,
    });
    return next(new BusinessError(ERROR_MESSAGES.SESSION_PROCESSING_ERROR));
  }
};