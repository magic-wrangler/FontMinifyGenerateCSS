const logger = require('../utils/logger');

// 访问日志中间件
const requestLogger = (req, res, next) => {
  console.log('req.originalUrl', req.originalUrl);
  
  // 使用响应结束事件来记录日志，确保能获取到完整的响应信息
  res.on('finish', () => {
    logger.logAccess(req, res);
  });
  
  next();
};

module.exports = requestLogger;