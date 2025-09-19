const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { promisify } = require('util');
const Fontmin = require('fontmin');

/**
 * 处理字体文件并生成CSS
 * @param {string} sessionId 会话ID
 * @param {Array<string>} fontNames 字体名称列表
 * @param {string} text 要提取的文字
 * @param {string} uploadsDir 上传目录
 * @param {string} outputDir 输出目录
 * @returns {Object} 处理结果
 */
async function processFontFiles(sessionId, fontNames, text, uploadsDir, outputDir) {
  // 查找会话目录
  const sessionDir = findSessionDir(sessionId, uploadsDir);
  if (!sessionDir) {
    throw new Error(`Session directory not found for ID: ${sessionId}`);
  }

  // 确保输出目录存在
  const now = new Date();
  const dateFolder = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const outputDateDir = path.join(outputDir, dateFolder);
  if (!fs.existsSync(outputDateDir)) {
    fs.mkdirSync(outputDateDir, { recursive: true });
  }

  const outputSessionDir = path.join(outputDateDir, sessionId);
  if (!fs.existsSync(outputSessionDir)) {
    fs.mkdirSync(outputSessionDir, { recursive: true });
  }

  // 处理每个字体
  const results = [];
  for (const fontName of fontNames) {
    // 在循环外部声明变量，避免作用域问题
    let fontDir;
    let fontFiles = [];
    let fontFile;
    let fontPath;
    let outputFontDir;
    
    try {
      // 处理字体名称，替换特殊字符为下划线，确保路径有效
      const sanitizedFontName = fontName.replace(/\s+/g, '_').replace(/[^\w\-\.]/g, '_');
      
      // 移除可能的文件扩展名（如.TTF、.OTF等）
      const fontNameWithoutExt = fontName.replace(/\.(ttf|otf|woff|woff2)$/i, '');
      
      // 尝试查找原始名称的目录（不带扩展名）
      fontDir = path.join(sessionDir, fontNameWithoutExt);
      
      // 如果原始名称目录不存在，尝试使用清理后的名称
      if (!fs.existsSync(fontDir)) {
        // 同样移除清理后名称中可能的文件扩展名
        const sanitizedFontNameWithoutExt = sanitizedFontName.replace(/\.(ttf|otf|woff|woff2)$/i, '');
        fontDir = path.join(sessionDir, sanitizedFontNameWithoutExt);
      }
      
      // 如果目录仍然不存在，记录错误并跳过
      if (!fs.existsSync(fontDir)) {
        logger.error(`Font directory not found: ${fontDir}`, new Error('Font not found'));
        continue;
      }

      // 查找字体文件（不区分大小写）
      fontFiles = fs.readdirSync(fontDir).filter(
        (file) => /\.(ttf|otf|woff|woff2)$/i.test(file)
      );

      // 如果没有找到字体文件，尝试查找任何文件作为备选
      if (!fontFiles || fontFiles.length === 0) {
        // 获取目录中的所有文件
        const allFiles = fs.readdirSync(fontDir);
        
        // 如果有任何文件，使用第一个文件
        if (allFiles && allFiles.length > 0) {
          logger.info(`No standard font files found in: ${fontDir}, using available file: ${allFiles[0]}`);
          fontFiles = [allFiles[0]];
        } else {
          logger.error(`No files found in: ${fontDir}`, new Error('No font files'));
          continue;
        }
      }
    } catch (err) {
      logger.error(`Error processing font ${fontName}`, err);
      continue;
    }

    try {
      // 处理字体文件
      fontFile = fontFiles[0]; // 使用第一个字体文件
      fontPath = path.join(fontDir, fontFile);
      
      // 移除字体名称中的扩展名，确保输出文件夹名称不包含扩展名
      const cleanFontName = fontName.replace(/\.(ttf|otf|woff|woff2)$/i, '');
      outputFontDir = path.join(outputSessionDir, cleanFontName);
      
      if (!fs.existsSync(outputFontDir)) {
        fs.mkdirSync(outputFontDir, { recursive: true });
      }
    } catch (err) {
      logger.error(`Error creating output directory for ${fontName}`, err);
      continue;
    }

    // 使用 fontmin 处理字体文件
    const outputFontPath = path.join(outputFontDir, fontFile);
    
    try {
      // 创建 Fontmin 实例
      const fontmin = new Fontmin()
        .src(fontPath)
        .dest(outputFontDir)
        .use(Fontmin.glyph({
          text: text || '',  // 如果没有提供文本，则使用空字符串
          hinting: false     // 禁用 hinting 以减小文件大小
        }));

      // 根据字体类型添加适当的插件
      if (fontFile.endsWith('.ttf')) {
        fontmin.use(Fontmin.ttf2woff());  // 转换为 woff 格式
      }

      // 执行字体处理
       await new Promise((resolve, reject) => {
         fontmin.run((err, files) => {
           if (err) {
             logger.error(`Fontmin processing error: ${err.message}`, err);
             return reject(err);
           }
            
            logger.info(`Fontmin processed ${files.length} files for ${fontName}`);
            resolve();
          });
        });
        
        logger.info(`Successfully processed font ${fontName} with Fontmin`);
     } catch (fontminErr) {
       logger.error(`Error processing font with Fontmin: ${fontName}`, fontminErr);
       // 如果 fontmin 处理失败，回退到简单复制
       fs.copyFileSync(fontPath, outputFontPath);
     }

    // 获取字体文件的base64编码
    let base64Data = null;
    try {
      base64Data = getBase64FontData(outputFontPath);
    } catch (base64Err) {
      logger.error(`Error generating base64 data for ${fontName}`, base64Err);
      // 继续处理，不使用base64
    }
    
    // 创建CSS文件，如果有base64数据则包含base64 URL
    const cssContent = generateCSS(fontName, fontFile, text, { base64Data });
    
    // 移除字体名称中的扩展名，确保CSS文件名称不包含扩展名
    const cleanFontName = fontName.replace(/\.(ttf|otf|woff|woff2)$/i, '');
    const cssPath = path.join(outputFontDir, `${cleanFontName}.css`);
    fs.writeFileSync(cssPath, cssContent);

    results.push({
      fontName,
      cssPath,
      fontPath: outputFontPath,
      hasBase64: !!base64Data // 标记是否包含base64数据
    });
  }

  return {
    sessionId,
    outputDir: outputSessionDir,
    results,
  };
}

/**
 * 查找会话目录
 * @param {string} sessionId 会话ID
 * @param {string} uploadsDir 上传目录
 * @returns {string|null} 会话目录路径或null
 */
function findSessionDir(sessionId, uploadsDir) {
  // 获取所有日期文件夹并按日期降序排序（最新的日期在前）
  const dateFolders = fs.readdirSync(uploadsDir)
    .filter(folder => {
      try {
        return fs.statSync(path.join(uploadsDir, folder)).isDirectory() && 
               /^\d{4}-\d{2}-\d{2}$/.test(folder); // 确保是日期格式的文件夹
      } catch (err) {
        return false;
      }
    })
    .sort((a, b) => {
      // 按日期降序排序
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateB - dateA;
    });

  // 先检查今天的日期文件夹
  const today = new Date();
  const todayFolder = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const todayPath = path.join(uploadsDir, todayFolder, sessionId);
  
  if (fs.existsSync(todayPath)) {
    return todayPath;
  }

  // 然后按日期降序检查其他文件夹
  for (const dateFolder of dateFolders) {
    const sessionPath = path.join(uploadsDir, dateFolder, sessionId);
    if (fs.existsSync(sessionPath)) {
      return sessionPath;
    }
  }

  return null;
}

/**
 * 生成CSS内容
 * @param {string} fontName 字体名称
 * @param {string} fontFile 字体文件名
 * @param {string} text 要提取的文字
 * @returns {string} CSS内容
 */
function generateCSS(fontName, fontFile, text, options = {}) {
  // 获取字体格式
  const format = getFormatFromFileName(fontFile);
  
  // 移除字体名称中的扩展名
  const cleanFontName = fontName.replace(/\.(ttf|otf|woff|woff2)$/i, '');
  
  // 构建 src 属性
  let srcAttribute = '';
  
  // 如果提供了 base64 数据，添加 base64 URL
  if (options.base64Data) {
    const base64Url = `data:application/x-font-ttf;charset=utf-8;base64,${options.base64Data}`;
    srcAttribute += `  src: url('${base64Url}') format('${format}');\n`;
  }
  
  // 添加文件 URL
  srcAttribute += `  /* src: url('./${fontFile}') format('${format}') */`;
  
  // 创建 @font-face 规则
  return `@font-face {
  font-family: '${cleanFontName}';
${srcAttribute};
}
`;
}

/**
 * 根据文件名获取字体格式
 * @param {string} fileName 字体文件名
 * @returns {string} 字体格式
 */
function getFormatFromFileName(fileName) {
  if (fileName.endsWith('.ttf')) return 'truetype';
  if (fileName.endsWith('.otf')) return 'opentype';
  if (fileName.endsWith('.woff')) return 'woff';
  if (fileName.endsWith('.woff2')) return 'woff2';
  return 'truetype'; // 默认格式
}

/**
 * 将字体文件转换为base64编码
 * @param {string} filePath 字体文件路径
 * @returns {string} base64编码的字体数据
 */
function getBase64FontData(filePath) {
  try {
    // 读取文件内容
    const fontData = fs.readFileSync(filePath);
    // 转换为base64
    return fontData.toString('base64');
  } catch (err) {
    logger.error(`Error converting font to base64: ${filePath}`, err);
    return null;
  }
}

module.exports = {
  processFontFiles,
  findSessionDir,
  getBase64FontData,
};