// server/utils/logger.js
const winston = require('winston');
const { createLogger, format, transports } = winston;
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const config = require('../config/logger.config');
const fs = require('fs');

// 创建日志目录
const logDir = path.join(__dirname, '..', config.directory);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
if (!fs.existsSync(path.join(logDir, 'errors'))) {
  fs.mkdirSync(path.join(logDir, 'errors'), { recursive: true });
}
if (!fs.existsSync(path.join(logDir, 'access'))) {
  fs.mkdirSync(path.join(logDir, 'access'), { recursive: true });
}

// 定义日志格式
const logFormat = config.format === 'json' 
  ? format.json()
  : format.printf(({ level, message, timestamp, ...meta }) => {
      return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    });

// 创建文件传输
const fileTransport = new DailyRotateFile({
  dirname: logDir,
  filename: '%DATE%-app.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: config.file.maxSize,
  maxFiles: config.file.maxFiles,
  zippedArchive: config.file.zippedArchive
});

// 创建错误文件传输
const errorFileTransport = new DailyRotateFile({
  dirname: path.join(logDir, 'errors'),
  filename: '%DATE%-error.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: config.file.maxSize,
  maxFiles: config.file.maxFiles,
  level: 'error',
  zippedArchive: config.file.zippedArchive
});

// 创建访问日志传输
const accessFileTransport = new DailyRotateFile({
  dirname: path.join(logDir, 'access'),
  filename: '%DATE%-access.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: config.file.maxSize,
  maxFiles: config.file.maxFiles,
  zippedArchive: config.file.zippedArchive
});

// 定义传输数组
const logTransports = [fileTransport, errorFileTransport];

// 添加控制台传输（如果启用）
if (config.console.enabled) {
  logTransports.push(new transports.Console({
    level: config.console.level,
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

// 创建logger实例
const logger = createLogger({
  level: config.level,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    logFormat
  ),
  transports: logTransports,
  exitOnError: false
});

// 创建访问日志记录器
const accessLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [accessFileTransport],
  exitOnError: false
});

// 辅助函数：记录HTTP请求
const logAccess = (req, res, responseTime, responseData) => {
  const { method, originalUrl, ip, headers, query, body } = req;
  const userAgent = headers['user-agent'];
  const statusCode = res.statusCode;
  
  accessLogger.info('HTTP Access', {
    method,
    url: originalUrl,
    statusCode,
    responseTime,
    ip,
    userAgent,
    query,
    // 避免记录敏感信息
    body: sanitizeBody(body),
    // 记录响应结果
    response: responseData
  });
};

// 辅助函数：清理敏感信息
const sanitizeBody = (body) => {
  if (!body) return {};
  
  const sanitized = { ...body };
  // 移除敏感字段
  const sensitiveFields = ['password', 'token', 'secret'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) sanitized[field] = '[REDACTED]';
  });
  
  return sanitized;
};

module.exports = {
  logger,
  logAccess,
  // 导出常用日志方法
  debug: (...args) => logger.debug(...args),
  info: (...args) => logger.info(...args),
  warn: (...args) => logger.warn(...args),
  error: (...args) => logger.error(...args),
  // 用于中间件
  accessMiddleware: (req, res, next) => {
    const start = Date.now();
    
    // 保存原始的res.json方法
    const originalJson = res.json;
    let responseBody = null;
    
    // 重写res.json方法以捕获响应数据
    res.json = function(data) {
      responseBody = data;
      return originalJson.apply(this, arguments);
    };
    
    // 响应结束时记录访问日志
    res.on('finish', () => {
      const responseTime = Date.now() - start;
      logAccess(req, res, responseTime, responseBody);
    });
    
    next();
  }
};