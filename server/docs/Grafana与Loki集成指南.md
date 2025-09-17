# Grafana与Loki集成完成指南

## 1. 概述

本文档提供了在FontMinifyGenerateCSS项目中集成Grafana和Loki进行日志监控和可视化的完整指南。通过本指南，您将能够设置一个完整的日志监控系统，实现日志的集中收集、查询和可视化分析。

### 1.1 组件介绍

- **Grafana**：开源的可视化和监控平台，提供丰富的图表和仪表盘功能
- **Loki**：由Grafana Labs开发的水平可扩展、高可用的日志聚合系统
- **Promtail**：Loki的代理，负责收集日志并发送到Loki服务器

### 1.2 集成优势

- 集中式日志管理和查询
- 强大的日志搜索和过滤能力
- 实时日志监控和告警
- 自定义仪表盘和可视化
- 与现有系统的无缝集成

## 2. 环境准备

### 2.1 前置条件

- Docker和Docker Compose已安装
- Node.js应用已配置Winston日志系统
- 具有管理员权限的账户

### 2.2 系统要求

- Docker Engine 19.03.0+
- Docker Compose 1.27.0+
- 至少2GB可用内存
- 至少10GB可用磁盘空间

## 3. Docker环境配置

### 3.1 创建Docker Compose配置

在项目的`server`目录下创建`docker-compose.yml`文件：

```yaml
version: '3'

services:
  loki:
    image: grafana/loki:2.8.0
    ports:
      - "3100:3100"
    volumes:
      - loki-data:/loki
    command: -config.file=/etc/loki/local-config.yaml
    networks:
      - monitoring

  promtail:
    image: grafana/promtail:2.8.0
    volumes:
      - ./promtail-config.yml:/etc/promtail/config.yml
      - ./logs:/var/log/app
    command: -config.file=/etc/promtail/config.yml
    depends_on:
      - loki
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:9.5.1
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-data:/var/lib/grafana
    depends_on:
      - loki
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge

volumes:
  loki-data:
  grafana-data:
```

### 3.2 配置Promtail

创建`promtail-config.yml`文件：

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: app-logs
    static_configs:
      - targets:
          - localhost
        labels:
          job: fontminify
          app: font-service
          __path__: /var/log/app/**/*.log

  - job_name: system-logs
    static_configs:
      - targets:
          - localhost
        labels:
          job: system
          __path__: /var/log/messages
```

## 4. 日志系统配置

### 4.1 更新Logger配置

修改`server/config/logger.config.js`文件，添加Loki集成配置：

```javascript
module.exports = {
  // 现有配置...
  
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
  },
  
  // Loki集成配置
  loki: {
    enabled: true,       // 是否启用Loki
    host: 'http://localhost:3100', // Loki服务地址
    labels: {            // 标签配置
      app: 'font-service',
      environment: process.env.NODE_ENV || 'development'
    }
  }
};
```

### 4.2 安装依赖

在服务器项目目录下安装必要的依赖：

```bash
npm install winston-loki
```

### 4.3 更新Logger实现

修改`server/utils/logger.js`文件，添加Loki传输支持：

```javascript
const winston = require('winston');
const { createLogger, format, transports } = winston;
const DailyRotateFile = require('winston-daily-rotate-file');
const LokiTransport = require('winston-loki');
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

// 添加Loki传输（如果启用）
if (config.loki && config.loki.enabled) {
  logTransports.push(new LokiTransport({
    host: config.loki.host,
    labels: config.loki.labels,
    json: true,
    format: format.json(),
    replaceTimestamp: true,
    onConnectionError: (err) => console.error('Loki连接错误:', err)
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
  transports: [
    accessFileTransport,
    // 如果启用Loki，也将访问日志发送到Loki
    ...(config.loki && config.loki.enabled ? [
      new LokiTransport({
        host: config.loki.host,
        labels: { ...config.loki.labels, type: 'access' },
        json: true,
        format: format.json(),
        replaceTimestamp: true
      })
    ] : [])
  ],
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
    // 添加响应数据
    response: sanitizeResponse(responseData)
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

// 辅助函数：清理响应数据
const sanitizeResponse = (response) => {
  if (!response) return {};
  
  // 如果响应数据过大，只返回状态信息
  if (JSON.stringify(response).length > 1024) {
    return {
      truncated: true,
      size: JSON.stringify(response).length,
      summary: response.message || response.code || '响应数据过大，已截断'
    };
  }
  
  return response;
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
    
    // 保存原始json方法
    const originalJson = res.json;
    
    // 重写json方法以捕获响应数据
    res.json = function(data) {
      res.locals.responseBody = data;
      return originalJson.call(this, data);
    };
    
    // 响应结束时记录访问日志
    res.on('finish', () => {
      const responseTime = Date.now() - start;
      logAccess(req, res, responseTime, res.locals.responseBody);
    });
    
    next();
  }
};
```

## 5. Grafana仪表盘配置

### 5.1 启动服务

在项目的`server`目录下运行：

```bash
docker-compose up -d
```

### 5.2 访问Grafana

打开浏览器访问：http://localhost:3000

- 默认用户名：admin
- 默认密码：admin

首次登录会要求修改密码。

### 5.3 配置Loki数据源

1. 登录Grafana后，点击左侧菜单的"Configuration"（齿轮图标）
2. 选择"Data sources"
3. 点击"Add data source"
4. 选择"Loki"
5. 在URL字段中输入：`http://loki:3100`
6. 点击"Save & Test"确保连接成功

### 5.4 导入仪表盘

#### 5.4.1 创建仪表盘JSON

创建`server/grafana-dashboard.json`文件：

```json
{
  "annotations": {
    "list": [
      {
        "builtIn": 1,
        "datasource": {
          "type": "grafana",
          "uid": "-- Grafana --"
        },
        "enable": true,
        "hide": true,
        "iconColor": "rgba(0, 211, 255, 1)",
        "name": "Annotations & Alerts",
        "type": "dashboard"
      }
    ]
  },
  "editable": true,
  "fiscalYearStartMonth": 0,
  "graphTooltip": 0,
  "id": null,
  "links": [],
  "liveNow": false,
  "panels": [
    {
      "datasource": {
        "type": "loki",
        "uid": "${DS_LOKI}"
      },
      "gridPos": {
        "h": 9,
        "w": 24,
        "x": 0,
        "y": 0
      },
      "id": 1,
      "options": {
        "dedupStrategy": "none",
        "enableLogDetails": true,
        "prettifyLogMessage": false,
        "showCommonLabels": false,
        "showLabels": false,
        "showTime": true,
        "sortOrder": "Descending",
        "wrapLogMessage": false
      },
      "targets": [
        {
          "datasource": {
            "type": "loki",
            "uid": "${DS_LOKI}"
          },
          "editorMode": "builder",
          "expr": "{app=\"font-service\"}",
          "queryType": "range",
          "refId": "A"
        }
      ],
      "title": "应用日志",
      "type": "logs"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "${DS_LOKI}"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 0.5,
            "gradientMode": "none",
            "hideFrom": {
              "legend": false,
              "tooltip": false,
              "viz": false
            },
            "lineInterpolation": "linear",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "auto",
            "spanNulls": false,
            "stacking": {
              "group": "A",
              "mode": "none"
            },
            "thresholdsStyle": {
              "mode": "off"
            }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              },
              {
                "color": "red",
                "value": 80
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 0,
        "y": 9
      },
      "id": 2,
      "options": {
        "legend": {
          "calcs": [],
          "displayMode": "list",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": {
          "mode": "single",
          "sort": "none"
        }
      },
      "targets": [
        {
          "datasource": {
            "type": "loki",
            "uid": "${DS_LOKI}"
          },
          "editorMode": "builder",
          "expr": "sum(count_over_time({app=\"font-service\", level=\"error\"}[5m]))",
          "legendFormat": "错误数",
          "queryType": "range",
          "refId": "A"
        }
      ],
      "title": "错误数量",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "loki",
        "uid": "${DS_LOKI}"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 0.5,
            "gradientMode": "none",
            "hideFrom": {
              "legend": false,
              "tooltip": false,
              "viz": false
            },
            "lineInterpolation": "linear",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "auto",
            "spanNulls": false,
            "stacking": {
              "group": "A",
              "mode": "none"
            },
            "thresholdsStyle": {
              "mode": "off"
            }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              },
              {
                "color": "red",
                "value": 80
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 12,
        "y": 9
      },
      "id": 3,
      "options": {
        "legend": {
          "calcs": [],
          "displayMode": "list",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": {
          "mode": "single",
          "sort": "none"
        }
      },
      "targets": [
        {
          "datasource": {
            "type": "loki",
            "uid": "${DS_LOKI}"
          },
          "editorMode": "builder",
          "expr": "sum(count_over_time({app=\"font-service\", type=\"access\"}[5m]))",
          "legendFormat": "请求数",
          "queryType": "range",
          "refId": "A"
        }
      ],
      "title": "HTTP请求数",
      "type": "timeseries"
    }
  ],
  "refresh": "5s",
  "schemaVersion": 38,
  "style": "dark",
  "tags": [],
  "templating": {
    "list": []
  },
  "time": {
    "from": "now-1h",
    "to": "now"
  },
  "timepicker": {},
  "timezone": "",
  "title": "字体服务监控",
  "uid": "font-service-dashboard",
  "version": 1,
  "weekStart": ""
}
```

#### 5.4.2 导入仪表盘

1. 在Grafana中，点击左侧菜单的"+"图标
2. 选择"Import"
3. 点击"Upload JSON file"并选择刚才创建的`grafana-dashboard.json`文件
4. 在"Loki"数据源下拉菜单中选择之前配置的Loki数据源
5. 点击"Import"完成导入

## 6. 使用LogQL查询日志

Loki使用LogQL查询语言，以下是一些常用查询示例：

### 6.1 基本查询

- 查询所有应用日志：
  ```
  {app="font-service"}
  ```

- 查询错误日志：
  ```
  {app="font-service", level="error"}
  ```

- 查询包含特定关键词的日志：
  ```
  {app="font-service"} |= "字体处理"
  ```

### 6.2 高级查询

- 统计错误数量：
  ```
  sum(count_over_time({app="font-service", level="error"}[1h]))
  ```

- 按状态码分组的HTTP请求数：
  ```
  sum by(statusCode) (count_over_time({app="font-service", type="access"}[1h]))
  ```

- 提取并分析响应时间：
  ```
  {app="font-service", type="access"} | json | responseTime > 1000
  ```

## 7. 故障排除

### 7.1 常见问题

#### 7.1.1 Loki连接失败

**症状**：Grafana无法连接到Loki数据源

**解决方案**：
- 确认Docker容器正在运行：`docker-compose ps`
- 检查Loki日志：`docker-compose logs loki`
- 确认Loki URL配置正确（在Docker网络中应为`http://loki:3100`）

#### 7.1.2 日志未显示在Grafana中

**症状**：应用正在生成日志，但在Grafana中看不到

**解决方案**：
- 确认winston-loki传输配置正确
- 检查Promtail配置和日志路径
- 验证日志格式是否为JSON
- 检查Promtail日志：`docker-compose logs promtail`

#### 7.1.3 查询性能问题

**症状**：日志查询速度慢或超时

**解决方案**：
- 优化查询，添加标签过滤
- 减少查询时间范围
- 考虑增加Loki的资源限制

### 7.2 性能优化

- 使用标签进行高效过滤，而不是全文搜索
- 保持日志量在合理范围内
- 定期清理旧日志数据
- 为高频查询创建预设仪表盘

## 8. 最佳实践

### 8.1 日志结构化

- 使用JSON格式记录日志
- 保持日志字段一致性
- 为重要信息添加专用字段，而不是嵌入消息文本
- 使用标准化的错误代码和消息

### 8.2 标签策略

- 使用有意义的标签：app、environment、service
- 避免高基数标签（如用户ID、会话ID）
- 保持标签数量合理（通常不超过10个）

### 8.3 告警配置

1. 在Grafana中创建告警规则：
   - 错误率超过阈值
   - 响应时间异常
   - 服务不可用

2. 配置通知渠道：
   - 电子邮件
   - Slack/钉钉
   - Webhook

## 9. 结论

通过本指南，您已经成功集成了Grafana和Loki到FontMinifyGenerateCSS项目中，实现了日志的集中管理、查询和可视化。这一集成将帮助您更有效地监控应用性能、排查问题并优化系统。

随着应用的发展，您可以进一步扩展此监控系统，添加更多指标和仪表盘，以满足不断增长的需求。

## 10. 参考资源

- [Grafana官方文档](https://grafana.com/docs/)
- [Loki官方文档](https://grafana.com/docs/loki/latest/)
- [LogQL查询语言参考](https://grafana.com/docs/loki/latest/logql/)
- [Promtail配置参考](https://grafana.com/docs/loki/latest/clients/promtail/configuration/)
- [Winston-Loki文档](https://github.com/JaniAnttonen/winston-loki)