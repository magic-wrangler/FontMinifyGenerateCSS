const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * 清理过期会话文件夹的定时任务
 * 删除超过7天未修改的会话文件夹
 */
function cleanupExpiredSessions() {
  try {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const outputDir = path.join(__dirname, '..', 'output');
    
    // 确保目录存在
    if (!fs.existsSync(uploadsDir) || !fs.existsSync(outputDir)) {
      return;
    }
    
    const now = Date.now();
    const expirationTime = 7 * 24 * 60 * 60 * 1000; // 7天的毫秒数
    
    // 清理上传目录
    cleanupDirectory(uploadsDir, now, expirationTime);
    
    // 清理输出目录
    cleanupDirectory(outputDir, now, expirationTime);
    
    logger.info('定期清理任务执行完成');
  } catch (error) {
    logger.error('执行定期清理任务时出错', error);
  }
}

/**
 * 清理指定目录中的过期文件
 * @param {string} directory 要清理的目录
 * @param {number} now 当前时间戳
 * @param {number} expirationTime 过期时间（毫秒）
 */
function cleanupDirectory(directory, now, expirationTime) {
  try {
    // 获取所有日期文件夹
    const dateFolders = fs.readdirSync(directory)
      .filter(folder => {
        try {
          return fs.statSync(path.join(directory, folder)).isDirectory() && 
                /^\d{4}-\d{2}-\d{2}$/.test(folder); // 确保是日期格式的文件夹
        } catch (err) {
          return false;
        }
      });
    
    dateFolders.forEach(dateFolder => {
      const dateFolderPath = path.join(directory, dateFolder);
      
      // 获取日期文件夹中的所有会话文件夹
      try {
        const sessionFolders = fs.readdirSync(dateFolderPath)
          .filter(folder => {
            try {
              return fs.statSync(path.join(dateFolderPath, folder)).isDirectory();
            } catch (err) {
              return false;
            }
          });
        
        let removedCount = 0;
        
        sessionFolders.forEach(sessionFolder => {
          try {
            const sessionFolderPath = path.join(dateFolderPath, sessionFolder);
            const stats = fs.statSync(sessionFolderPath);
            
            // 如果会话文件夹超过过期时间未修改，则删除
            if (now - stats.mtimeMs > expirationTime) {
              removeDirectory(sessionFolderPath);
              removedCount++;
            }
          } catch (err) {
            logger.error(`清理会话文件夹时出错: ${sessionFolder}`, err);
          }
        });
        
        if (removedCount > 0) {
          logger.info(`已清理 ${removedCount} 个过期会话文件夹，位于 ${dateFolderPath}`);
        }
        
        // 如果日期文件夹为空，也删除它
        try {
          const remainingItems = fs.readdirSync(dateFolderPath);
          if (remainingItems.length === 0) {
            fs.rmdirSync(dateFolderPath);
            logger.info(`已删除空的日期文件夹: ${dateFolderPath}`);
          }
        } catch (err) {
          logger.error(`检查日期文件夹是否为空时出错: ${dateFolderPath}`, err);
        }
      } catch (err) {
        logger.error(`读取日期文件夹内容时出错: ${dateFolderPath}`, err);
      }
    });
  } catch (err) {
    logger.error(`清理目录时出错: ${directory}`, err);
  }
}

/**
 * 递归删除目录及其内容
 * @param {string} directory 要删除的目录
 */
function removeDirectory(directory) {
  try {
    if (fs.existsSync(directory)) {
      fs.readdirSync(directory).forEach(file => {
        const curPath = path.join(directory, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          // 递归删除子目录
          removeDirectory(curPath);
        } else {
          // 删除文件
          fs.unlinkSync(curPath);
        }
      });
      // 删除空目录
      fs.rmdirSync(directory);
      logger.info(`已删除过期文件夹: ${directory}`);
    }
  } catch (err) {
    logger.error(`删除目录时出错: ${directory}`, err);
  }
}

// 导出清理函数
module.exports = {
  cleanupExpiredSessions
};