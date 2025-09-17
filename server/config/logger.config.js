// server/config/logger.config.js
module.exports = {
  // 日志级别
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  
  // 日志目录
  directory: 'logs',
  
  // 文件配置
  file: {
    maxSize: '10m',      // 单个文件最大大小
    maxFiles: '14d',     // 保留日志时间
    zippedArchive: true, // 是否压缩归档
  },
  
  // 格式配置
  format: 'json',        // 'json' 或 'text'
  
  // 控制台输出
  console: {
    enabled: true,
    level: 'debug',
  }
};