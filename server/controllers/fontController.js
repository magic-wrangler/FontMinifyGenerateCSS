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
// exports.getSessionInfo = (req, res, next) => {
//   try {
//     const sessionId = req.params.sessionId;
//     if (!sessionId) {
//       return validationError(res, [{ field: 'sessionId', message: ERROR_MESSAGES.MISSING_SESSION_ID }]);
//     }

//     // 查找会话目录
//     const uploadsDir = path.join(__dirname, '..', 'uploads');
//     const sessionInfo = {
//       sessionId: sessionId,
//       fonts: [],
//       exists: false
//     };

//     // 遍历日期目录查找会话
//     const dateFolders = fs.readdirSync(uploadsDir).filter(folder => 
//       fs.statSync(path.join(uploadsDir, folder)).isDirectory()
//     );

//     for (const dateFolder of dateFolders) {
//       const sessionPath = path.join(uploadsDir, dateFolder, sessionId);
//       if (fs.existsSync(sessionPath)) {
//         sessionInfo.exists = true;
//         sessionInfo.dateFolder = dateFolder;
        
//         // 获取字体信息
//         const fontFolders = fs.readdirSync(sessionPath).filter(folder => 
//           fs.statSync(path.join(sessionPath, folder)).isDirectory()
//         );
        
//         for (const fontFolder of fontFolders) {
//           const fontPath = path.join(sessionPath, fontFolder);
//           const fontFiles = fs.readdirSync(fontPath).filter(file => 
//             file.endsWith('.ttf') || file.endsWith('.otf')
//           );
          
//           if (fontFiles.length > 0) {
//             sessionInfo.fonts.push({
//               name: fontFolder,
//               files: fontFiles
//             });
//           }
//         }
        
//         break;
//       }
//     }

//     if (!sessionInfo.exists) {
//       return notFound(res, ERROR_MESSAGES.SESSION_NOT_FOUND);
//     }

//     return success(res, sessionInfo, SUCCESS_MESSAGES.SESSION_FOUND);
//   } catch (err) {
//     logger.error(ERROR_MESSAGES.SESSION_PROCESSING_ERROR, err, {
//       sessionId: req.params.sessionId,
//     });
//     return next(new BusinessError(ERROR_MESSAGES.SESSION_PROCESSING_ERROR));
//   }
// };

// 获取指定文件内容
exports.getSpecificFiles = (req, res, next) => {
  try {
    const { sessionId, fileNames } = req.body;
    
    // 验证参数
    if (!sessionId) {
      return validationError(res, [{ field: 'sessionId', message: ERROR_MESSAGES.MISSING_SESSION_ID }]);
    }
    
    if (!fileNames || !Array.isArray(fileNames) || fileNames.length === 0) {
      return validationError(res, [{ field: 'fileNames', message: '文件名列表不能为空且必须是数组' }]);
    }
    
    // 查找会话目录
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const outputDir = path.join(__dirname, '..', 'output');
    
    // 遍历日期目录查找会话
    const dateFolders = fs.readdirSync(uploadsDir).filter(folder => 
      fs.statSync(path.join(uploadsDir, folder)).isDirectory()
    );
    
    const result = {
      sessionId: sessionId,
      exists: false,
      files: []
    };
    
    // 首先检查输出目录中的压缩文件
    // 获取当前日期作为文件夹名
    const currentDate = new Date();
    const dateFolder = currentDate.getFullYear() + '-' + 
                      String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(currentDate.getDate()).padStart(2, '0');
    
    // 检查输出目录中是否存在日期文件夹
    let outputSessionPath = '';
    let foundOutputPath = false;
    
    // 首先尝试在日期文件夹中查找
    if (fs.existsSync(outputDir)) {
      const outputDateFolders = fs.readdirSync(outputDir).filter(folder => 
        fs.statSync(path.join(outputDir, folder)).isDirectory()
      );
      
      for (const dateDir of outputDateFolders) {
        const testPath = path.join(outputDir, dateDir, sessionId);
        if (fs.existsSync(testPath)) {
          outputSessionPath = testPath;
          foundOutputPath = true;
          break;
        }
      }
    }
    
    // 如果在日期文件夹中没找到，尝试直接在输出目录中查找（兼容旧结构）
    if (!foundOutputPath) {
      const legacyPath = path.join(outputDir, sessionId);
      if (fs.existsSync(legacyPath)) {
        outputSessionPath = legacyPath;
        foundOutputPath = true;
      }
    }
    
    if (foundOutputPath) {
      result.exists = true;
      const files = fs.readdirSync(outputSessionPath);
      
      // 获取指定压缩文件的信息
      for (const fileName of fileNames) {
        // 首先检查是否直接在会话目录下
        const directMatch = files.find(file => file.toLowerCase() === fileName.toLowerCase());
        if (directMatch) {
          const filePath = path.join(outputSessionPath, directMatch);
          const stats = fs.statSync(filePath);
          
          if (stats.isFile()) {
            try {
              const fileContent = fs.readFileSync(filePath);
              const fileType = path.extname(directMatch).substring(1).toLowerCase();
              result.files.push({
                name: directMatch,
                size: stats.size,
                type: fileType,
                location: 'output',
                content: fileType === 'css' ? fileContent.toString('utf8') : fileContent.toString('base64'),
                contentEncoding: fileType === 'css' ? 'utf8' : 'base64',
                lastModified: stats.mtime
              });
              continue; // 找到文件后继续下一个
            } catch (fileErr) {
              logger.error(`Error reading file ${directMatch}`, fileErr);
            }
          } else if (stats.isDirectory()) {
            // 处理文件夹情况，获取文件夹下所有文件
            try {
              const folderFiles = fs.readdirSync(filePath);
              
              // 遍历文件夹中的所有文件
              for (const folderFile of folderFiles) {
                const folderFilePath = path.join(filePath, folderFile);
                const folderFileStats = fs.statSync(folderFilePath);
                
                if (folderFileStats.isFile()) {
                  try {
                    const folderFileContent = fs.readFileSync(folderFilePath);
                    const fileType = path.extname(folderFile).substring(1).toLowerCase();
                    result.files.push({
                      name: folderFile,
                      size: folderFileStats.size,
                      type: fileType,
                      location: 'output',
                      content: fileType === 'css' ? folderFileContent.toString('utf8') : folderFileContent.toString('base64'),
                      contentEncoding: fileType === 'css' ? 'utf8' : 'base64',
                      lastModified: folderFileStats.mtime,
                      parentFolder: directMatch
                    });
                  } catch (folderFileErr) {
                    logger.error(`Error reading file ${folderFile} in folder ${directMatch}`, folderFileErr);
                  }
                }
              }
              continue; // 处理完文件夹后继续下一个
            } catch (folderErr) {
              logger.error(`Error reading directory ${directMatch}`, folderErr);
            }
          }
        }
        
        // 如果直接在会话目录下没找到，检查子文件夹
        // 获取字体文件夹
        const fontFolders = files.filter(folder => 
          fs.existsSync(path.join(outputSessionPath, folder)) && 
          fs.statSync(path.join(outputSessionPath, folder)).isDirectory()
        );
        
        // 在每个字体文件夹中查找文件
        let fileFound = false;
        for (const fontFolder of fontFolders) {
          if (fileFound) break;
          
          const fontPath = path.join(outputSessionPath, fontFolder);
          try {
            const fontFiles = fs.readdirSync(fontPath);
            
            // 在字体文件夹中查找匹配的文件
            const matchedFile = fontFiles.find(file => file.toLowerCase() === fileName.toLowerCase());
            if (matchedFile) {
              const filePath = path.join(fontPath, matchedFile);
              const stats = fs.statSync(filePath);
              
              if (stats.isFile()) {
                try {
                  const fileContent = fs.readFileSync(filePath);
                  result.files.push({
                    name: matchedFile,
                    size: stats.size,
                    type: path.extname(matchedFile).substring(1),
                    location: 'output',
                    fontFolder: fontFolder,
                    content: fileContent.toString('base64'),
                    lastModified: stats.mtime
                  });
                  fileFound = true;
                } catch (fileErr) {
                  logger.error(`Error reading file ${matchedFile} in folder ${fontFolder}`, fileErr);
                }
              }
            }
          } catch (dirErr) {
            logger.error(`Error reading directory ${fontPath}`, dirErr);
          }
        }
      }
    }
    
    // 然后检查上传目录中的原始文件
    let sessionFound = false;
    for (const dateFolder of dateFolders) {
      const sessionPath = path.join(uploadsDir, dateFolder, sessionId);
      if (fs.existsSync(sessionPath)) {
        result.exists = true;
        result.dateFolder = dateFolder;
        sessionFound = true;
        
        // 获取字体文件夹
        const fontFolders = fs.readdirSync(sessionPath).filter(folder => 
          fs.statSync(path.join(sessionPath, folder)).isDirectory()
        );
        
        // 遍历所有字体文件夹查找指定文件
        for (const fontFolder of fontFolders) {
          const fontPath = path.join(sessionPath, fontFolder);
          const fontFiles = fs.readdirSync(fontPath);
          
          for (const fileName of fileNames) {
            // 不区分大小写查找文件
            const matchedFile = fontFiles.find(file => file.toLowerCase() === fileName.toLowerCase());
            if (matchedFile) {
              const filePath = path.join(fontPath, matchedFile);
              const stats = fs.statSync(filePath);
              
              // 只添加尚未添加的文件（避免重复）
              const existingFile = result.files.find(f => f.name.toLowerCase() === matchedFile.toLowerCase());
              if (!existingFile) {
                try {
                  const fileContent = fs.readFileSync(filePath);
                  result.files.push({
                    name: matchedFile,
                    size: stats.size,
                    type: path.extname(matchedFile).substring(1),
                    location: 'uploads',
                    fontFolder: fontFolder,
                    content: fileContent.toString('base64'),
                    lastModified: stats.mtime
                  });
                } catch (fileErr) {
                  logger.error(`Error reading file ${matchedFile}`, fileErr);
                }
              }
            }
          }
        }
        
        break; // 找到会话后退出循环
      }
    }
    
    if (!result.exists) {
      return notFound(res, ERROR_MESSAGES.SESSION_NOT_FOUND);
    }
    
    // 检查是否找到了所有请求的文件
    const foundFileNames = result.files.map(file => file.name.toLowerCase());
    const notFoundFiles = fileNames.filter(name => !foundFileNames.includes(name.toLowerCase()));
    
    if (notFoundFiles.length > 0) {
      result.notFoundFiles = notFoundFiles;
    }
    
    // 确保返回文件内容
    logger.info(`Found ${result.files.length} files for session ${sessionId}`);
    
    return success(res, result, SUCCESS_MESSAGES.SESSION_FOUND);
  } catch (err) {
    logger.error('Error processing specific files request', err, {
      sessionId: req.body.sessionId,
      fileNames: req.body.fileNames
    });
    return next(new BusinessError('获取指定文件内容时发生错误'));
  }
};
