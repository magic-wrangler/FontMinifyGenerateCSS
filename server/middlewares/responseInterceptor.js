// 响应拦截中间件
const responseInterceptor = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(body) {
    res.locals.responseBody = body;
    
    // 如果是JSON字符串，尝试解析
    if (typeof body === 'string') {
      try {
        res.locals.responseBody = JSON.parse(body);
      } catch (e) {
        // 不是有效的JSON，保持原样
      }
    }
    
    return originalSend.apply(res, arguments);
  };
  
  next();
};

module.exports = responseInterceptor;