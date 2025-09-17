const fs = require('fs');
const path = require('path');

/**
 * 日志管理模块 - 用于集中管理服务器日志
 */
class Logger {
  constructor() {
    // 日志根目录
    this.logDir = path.join(__dirname, '..', 'logs');
    this.ensureLogDirectory();
  }

  /**
   * 确保日志目录存在
   */
  ensureLogDirectory() {
    // 创建主日志目录
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    // 创建当前日期的日志目录
    const dateFolder = this.getCurrentDateFolder();
    const dateFolderPath = path.join(this.logDir, dateFolder);
    
    if (!fs.existsSync(dateFolderPath)) {
      fs.mkdirSync(dateFolderPath, { recursive: true });
    }

    // 创建错误日志目录
    const errorLogDir = path.join(dateFolderPath, 'errors');
    if (!fs.existsSync(errorLogDir)) {
      fs.mkdirSync(errorLogDir, { recursive: true });
    }

    // 创建访问日志目录
    const accessLogDir = path.join(dateFolderPath, 'access');
    if (!fs.existsSync(accessLogDir)) {
      fs.mkdirSync(accessLogDir, { recursive: true });
    }
  }

  /**
   * 获取当前日期文件夹名称
   * @returns {string} 日期文件夹名称，格式：YYYY-MM-DD
   */
  getCurrentDateFolder() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(now.getDate()).padStart(2, '0')}`;
  }

  /**
   * 记录错误日志
   * @param {string} message 错误消息
   * @param {Error} error 错误对象
   * @param {Object} metadata 元数据
   */
  logError(message, error, metadata = {}) {
    try {
      this.ensureLogDirectory();
      
      const dateFolder = this.getCurrentDateFolder();
      const errorLogDir = path.join(this.logDir, dateFolder, 'errors');
      
      // 确保错误日志目录存在
      if (!fs.existsSync(errorLogDir)) {
        fs.mkdirSync(errorLogDir, { recursive: true });
      }
      
      const errorLogPath = path.join(errorLogDir, 'error.log');
      
      const timestamp = new Date().toISOString();
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';
      
      const logEntry = {
        timestamp,
        message,
        errorMessage,
        errorStack,
        metadata,
      };
      
      const logString = JSON.stringify(logEntry, null, 2) + ',\n';
      
      fs.appendFileSync(errorLogPath, logString);
      
      // 同时输出到控制台
      console.error(`[ERROR] ${message}:`, errorMessage);
      if (errorStack) {
        console.error(errorStack);
      }
    } catch (err) {
      console.error('Failed to log error:', err);
    }
  }

  /**
   * 记录访问日志
   * @param {Object} req Express请求对象
   * @param {Object} res Express响应对象
   * @param {string} message 可选消息
   */
  logAccess(req, res, message = '') {
    try {
      this.ensureLogDirectory();
      
      const dateFolder = this.getCurrentDateFolder();
      const accessLogDir = path.join(this.logDir, dateFolder, 'access');
      
      // 确保访问日志目录存在
      if (!fs.existsSync(accessLogDir)) {
        fs.mkdirSync(accessLogDir, { recursive: true });
      }
      
      const accessLogPath = path.join(accessLogDir, 'access.log');
      
      const timestamp = new Date().toISOString();
      const method = req.method;
      const url = req.originalUrl || req.url;
      const ip = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || '';
      // 请求传参
      const queryParams = req.query;
      const bodyParams = req.body;
      // 响应结果
      const responseStatus = res.statusCode;
      const responseBody = res.locals.responseBody || {};
      
      const logEntry = {
        timestamp,
        method,
        url,
        ip,
        userAgent,
        message,
        queryParams,
        bodyParams,
        responseStatus,
        responseBody,
      };
      
      const logString = JSON.stringify(logEntry, null, 2) + ',\n';
      
      fs.appendFileSync(accessLogPath, logString);
      
      // 同时输出到控制台
      console.log(`[ACCESS] ${method} ${url} - ${responseStatus}`);
    } catch (err) {
      console.error('Failed to log access:', err);
    }
  }

  // logSuccess方法已移除
}

module.exports = new Logger();