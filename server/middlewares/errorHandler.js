/**
 * 全局错误处理中间件
 */
const { AppError } = require('../utils/errors');
const { error } = require('../utils/logger');

/**
 * 错误处理中间件
 * 捕获并格式化所有应用错误
 */
const errorHandler = (err, req, res, next) => {
  // 记录错误日志
  error(`[错误] ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    stack: err.stack,
    errorCode: err.errorCode || 'INTERNAL_ERROR'
  });

  // 如果是自定义应用错误
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      success: false,
      message: err.message,
      errorCode: err.errorCode,
      errors: err.errors, // 用于验证错误
      timestamp: Date.now()
    });
  }

  // 处理Express验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      code: 400,
      success: false,
      message: '请求参数验证失败',
      errorCode: 'VALIDATION_ERROR',
      errors: Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      })),
      timestamp: Date.now()
    });
  }

  // 处理Multer文件上传错误
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      code: 400,
      success: false,
      message: '上传文件过大',
      errorCode: 'FILE_TOO_LARGE',
      timestamp: Date.now()
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      code: 400,
      success: false,
      message: '未预期的文件字段',
      errorCode: 'UNEXPECTED_FILE',
      timestamp: Date.now()
    });
  }

  // 默认服务器错误响应
  return res.status(500).json({
    code: 500,
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? '服务器内部错误' 
      : err.message || '服务器内部错误',
    errorCode: 'INTERNAL_SERVER_ERROR',
    timestamp: Date.now()
  });
};

/**
 * 404错误处理中间件
 * 处理所有未匹配的路由
 */
const notFoundHandler = (req, res) => {
  return res.status(404).json({
    code: 404,
    success: false,
    message: '请求的资源不存在',
    errorCode: 'NOT_FOUND',
    timestamp: Date.now()
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};