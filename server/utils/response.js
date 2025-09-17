/**
 * 统一响应工具类
 * 提供标准化的响应格式处理函数
 */

/**
 * 成功响应
 * @param {Object} res - Express响应对象
 * @param {Object} data - 响应数据
 * @param {String} message - 响应消息
 * @param {Number} code - 状态码
 * @returns {Object} 响应对象
 */
const success = (res, data = {}, message = '操作成功', code = 200) => {
  return res.status(code).json({
    code,
    success: true,
    data,
    message,
    timestamp: Date.now()
  });
};

/**
 * 失败响应
 * @param {Object} res - Express响应对象
 * @param {String} message - 错误消息
 * @param {Number} code - 状态码
 * @param {String} errorCode - 错误代码
 * @returns {Object} 响应对象
 */
const error = (res, message = '操作失败', code = 500, errorCode = 'INTERNAL_ERROR') => {
  return res.status(code).json({
    code,
    success: false,
    message,
    errorCode,
    timestamp: Date.now()
  });
};

/**
 * 参数验证错误响应
 * @param {Object} res - Express响应对象
 * @param {Array} errors - 验证错误数组
 * @returns {Object} 响应对象
 */
const validationError = (res, errors) => {
  return res.status(400).json({
    code: 400,
    success: false,
    message: '请求参数验证失败',
    errors,
    errorCode: 'VALIDATION_ERROR',
    timestamp: Date.now()
  });
};

/**
 * 未找到资源响应
 * @param {Object} res - Express响应对象
 * @param {String} message - 错误消息
 * @returns {Object} 响应对象
 */
const notFound = (res, message = '请求的资源不存在') => {
  return res.status(404).json({
    code: 404,
    success: false,
    message,
    errorCode: 'NOT_FOUND',
    timestamp: Date.now()
  });
};

/**
 * 未授权响应
 * @param {Object} res - Express响应对象
 * @param {String} message - 错误消息
 * @returns {Object} 响应对象
 */
const unauthorized = (res, message = '未授权的访问') => {
  return res.status(401).json({
    code: 401,
    success: false,
    message,
    errorCode: 'UNAUTHORIZED',
    timestamp: Date.now()
  });
};

module.exports = {
  success,
  error,
  validationError,
  notFound,
  unauthorized
};