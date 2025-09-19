# Nginx代理配置方案

## 1. 概述

本文档提供了FontMinifyGenerateCSS项目在生产环境中使用Nginx作为反向代理的配置方案。Nginx将负责处理以下任务：

- 提供前端静态资源服务
- 反向代理后端API请求
- 反向代理监控服务（Grafana和Loki）
- 配置HTTPS安全访问
- 实现基本的负载均衡和缓存策略

## 2. 基本配置

### 2.1 服务器要求

- 操作系统：Linux (推荐Ubuntu 20.04+或CentOS 8+)
- Nginx版本：1.18.0+
- 内存：至少2GB RAM
- 存储：至少20GB可用空间

### 2.2 目录结构

```
/var/www/
  └── fontminify/
      ├── frontend/       # 前端静态文件
      ├── server/         # 后端Node.js应用
      ├── logs/           # Nginx日志
      └── ssl/            # SSL证书
```

### 2.3 基础Nginx配置

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Gzip配置
    gzip on;
    gzip_disable "msie6";
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 包含其他配置文件
    include /etc/nginx/conf.d/*.conf;
}
```

## 3. 前端静态资源配置

创建`/etc/nginx/conf.d/fontminify-frontend.conf`文件：

```nginx
server {
    listen 80;
    server_name fontminify.yourdomain.com;
    root /var/www/fontminify/frontend;
    index index.html;

    # 静态资源缓存策略
    location ~* \.(css|js)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    location ~* \.(jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 错误页面
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

## 4. 后端服务代理配置

创建`/etc/nginx/conf.d/fontminify-backend.conf`文件：

```nginx
upstream fontminify_backend {
    server 127.0.0.1:3000;
    # 如果有多个后端实例，可以添加更多server行
    # server 127.0.0.1:3001;
    # server 127.0.0.1:3002;
}

server {
    listen 80;
    server_name api.fontminify.yourdomain.com;

    # API代理
    location /api/ {
        proxy_pass http://fontminify_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 健康检查端点
    location /health {
        proxy_pass http://fontminify_backend/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        access_log off;
    }

    # 日志文件访问（可选，用于调试）
    location /logs/ {
        deny all; # 生产环境中禁止直接访问日志
    }
}
```

## 5. 监控服务代理配置

创建`/etc/nginx/conf.d/fontminify-monitoring.conf`文件：

```nginx
# Grafana代理
server {
    listen 80;
    server_name grafana.fontminify.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 基本认证（可选）
        auth_basic "Restricted Access";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }
}

# Loki代理（可选，通常只在内部网络访问）
server {
    listen 80;
    server_name loki.fontminify.yourdomain.com;

    location / {
        proxy_pass http://localhost:3100;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # 限制访问来源
        allow 127.0.0.1;
        allow 192.168.0.0/16; # 内部网络
        deny all;
    }
}
```

## 6. HTTPS配置

为所有服务器块添加HTTPS支持：

```nginx
# 将此配置添加到每个server块中

# 重定向HTTP到HTTPS
server {
    listen 80;
    server_name fontminify.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name fontminify.yourdomain.com;
    
    # SSL证书配置
    ssl_certificate /var/www/fontminify/ssl/fullchain.pem;
    ssl_certificate_key /var/www/fontminify/ssl/privkey.pem;
    
    # SSL参数优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # HSTS (可选，谨慎启用)
    # add_header Strict-Transport-Security "max-age=63072000" always;
    
    # 其余配置与HTTP版本相同
    ...
}
```

## 7. 部署步骤

### 7.1 安装Nginx

```bash
# Ubuntu
sudo apt update
sudo apt install nginx

# CentOS
sudo yum install epel-release
sudo yum install nginx
```

### 7.2 创建目录结构

```bash
sudo mkdir -p /var/www/fontminify/{frontend,server,logs,ssl}
sudo chown -R $USER:$USER /var/www/fontminify
```

### 7.3 部署前端文件

```bash
# 构建前端项目
npm run build

# 复制到Nginx目录
cp -r dist/* /var/www/fontminify/frontend/
```

### 7.4 配置后端服务

```bash
# 使用PM2管理Node.js应用
npm install -g pm2
cd /var/www/fontminify/server
npm install
pm2 start index.js --name "fontminify-backend"
pm2 save
pm2 startup
```

### 7.5 配置Nginx

```bash
# 复制配置文件
sudo cp /path/to/fontminify-*.conf /etc/nginx/conf.d/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 7.6 配置SSL证书

```bash
# 使用Let's Encrypt获取免费SSL证书
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d fontminify.yourdomain.com -d api.fontminify.yourdomain.com -d grafana.fontminify.yourdomain.com
```

### 7.7 测试部署

1. 访问前端: https://fontminify.yourdomain.com
2. 测试API: https://api.fontminify.yourdomain.com/api/health
3. 访问Grafana: https://grafana.fontminify.yourdomain.com

## 8. 维护与监控

### 8.1 日志轮转

配置logrotate以管理Nginx日志：

```
# /etc/logrotate.d/nginx
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 nginx adm
    sharedscripts
    postrotate
        [ -s /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

### 8.2 性能监控

使用Prometheus和Grafana监控Nginx性能：

1. 安装Nginx Prometheus Exporter
2. 配置Prometheus抓取Nginx指标
3. 导入Grafana仪表盘模板

### 8.3 安全更新

定期更新Nginx和SSL证书：

```bash
# 更新系统和Nginx
sudo apt update
sudo apt upgrade

# 更新SSL证书
sudo certbot renew
```

## 9. 故障排除

### 9.1 常见问题

1. **502 Bad Gateway**
   - 检查后端服务是否运行
   - 检查Nginx与后端的连接配置

2. **SSL证书问题**
   - 检查证书路径和权限
   - 确认证书未过期

3. **性能问题**
   - 调整worker_processes和worker_connections
   - 优化缓存配置

### 9.2 调试技巧

```bash
# 检查Nginx配置
sudo nginx -t

# 查看错误日志
tail -f /var/log/nginx/error.log

# 测试后端连接
curl -I http://localhost:3000/health
```

## 10. 参考资料

- [Nginx官方文档](https://nginx.org/en/docs/)
- [Nginx安全最佳实践](https://www.nginx.com/blog/security-hardening-nginx/)
- [Let's Encrypt文档](https://letsencrypt.org/docs/)