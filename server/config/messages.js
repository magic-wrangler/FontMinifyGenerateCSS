// 错误消息
const ERROR_MESSAGES_EN = {
  // 没有上传文件
  NO_FILES_UPLOADED: 'No font files were uploaded',
  // 上传文件处理错误
  UPLOAD_PROCESSING_ERROR: 'Error processing uploaded files',
  // 缺少会话ID
  MISSING_SESSION_ID: 'Session ID is required',
  // 字体名称列表格式不正确或为空
  INVALID_FONT_NAMES_FORMAT: 'Invalid font names format',
  // 生成CSS处理错误
  GENERATE_PROCESSING_ERROR: 'Error generating CSS',
  // 会话不存在
  SESSION_NOT_FOUND: 'Session not found',
  // 会话处理错误
  SESSION_PROCESSING_ERROR: 'Error processing session information'
};

// 成功消息
const SUCCESS_MESSAGES_EN = {
  // 上传成功
  UPLOAD_SUCCESS: 'Font files uploaded successfully',
  // 生成成功
  GENERATE_SUCCESS: 'CSS generated successfully',
  // 会话存在
  SESSION_FOUND: 'Session found'
};

// 日志消息
const LOG_MESSAGES_EN = {
  // 字体上传
  FONT_UPLOAD: 'Font files uploaded',
  // CSS生成
  CSS_GENERATE: 'CSS generated',
  // 会话信息获取
  SESSION_INFO: 'Session information retrieved'
};

module.exports = {
  ERROR_MESSAGES_EN,
  SUCCESS_MESSAGES_EN,
  LOG_MESSAGES_EN
};