const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// 导入中间件
const responseInterceptor = require('./middlewares/responseInterceptor');
const requestLogger = require('./middlewares/requestLogger');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

// 导入路由
const apiRoutes = require('./routes/api.routes');

// 创建Express应用
const app = express();

// 启用CORS
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 响应拦截中间件 - 捕获响应结果
app.use(responseInterceptor);

// 访问日志中间件 - 放在所有路由之前，确保记录所有请求
app.use(requestLogger);

// 注册API路由
app.use('/api', apiRoutes);

// 404错误处理 - 放在所有路由之后
app.use(notFoundHandler);

// 全局错误处理中间件 - 必须放在最后
app.use(errorHandler);

// 启动服务器
const PORT = 7199;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // 确保上传和输出目录存在
  const uploadsDir = path.join(__dirname, 'uploads');
  const outputDir = path.join(__dirname, 'output');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log('Server initialized successfully');
});
