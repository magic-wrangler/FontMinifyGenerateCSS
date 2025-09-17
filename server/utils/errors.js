/**
 * 自定义错误类
 * 提供标准化的错误类型定义
 */

/**
 * 基础应用错误类
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 验证错误
 */
class ValidationError extends AppError {
  constructor(message = '请求参数验证失败', errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

/**
 * 未找到资源错误
 */
class NotFoundError extends AppError {
  constructor(message = '请求的资源不存在') {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * 未授权错误
 */
class UnauthorizedError extends AppError {
  constructor(message = '未授权的访问') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * 禁止访问错误
 */
class ForbiddenError extends AppError {
  constructor(message = '禁止访问') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * 业务逻辑错误
 */
class BusinessError extends AppError {
  constructor(message = '业务处理失败', errorCode = 'BUSINESS_ERROR') {
    super(message, 400, errorCode);
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  BusinessError
};