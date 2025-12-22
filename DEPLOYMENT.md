# 部署指南

## 开发环境部署

参考 `启动说明.md`

## 生产环境部署

### 方案一：使用Nginx + PM2

#### 1. 构建前端

```bash
npm run build
```

#### 2. 使用PM2管理Node.js进程

```bash
# 安装PM2
npm install -g pm2

# 启动后端服务
pm2 start server/index.js --name voice-badcase-api

# 保存配置
pm2 save

# 设置开机自启
pm2 startup
```

#### 3. 配置Nginx

创建配置文件 `/etc/nginx/sites-available/voice-badcase`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/voice-badcase-platform/dist;
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 上传的文件
    location /uploads {
        proxy_pass http://localhost:3000;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/voice-badcase /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 方案二：Docker部署

#### 1. 创建Dockerfile

```dockerfile
# 前端构建阶段
FROM node:18 AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 后端运行阶段
FROM node:18-slim
WORKDIR /app

# 安装生产依赖
COPY package*.json ./
RUN npm install --production

# 复制服务器代码
COPY server ./server

# 复制前端构建产物
COPY --from=frontend-build /app/dist ./dist

# 创建上传目录
RUN mkdir -p uploads

EXPOSE 3000

CMD ["node", "server/index.js"]
```

#### 2. 创建docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: voice_badcase
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DB_USER: postgres
      DB_HOST: postgres
      DB_NAME: voice_badcase
      DB_PASSWORD: your_password
      DB_PORT: 5432
    depends_on:
      - postgres
    volumes:
      - ./uploads:/app/uploads

volumes:
  postgres_data:
```

#### 3. 启动服务

```bash
docker-compose up -d
```

### 方案三：Vercel + Supabase

#### 1. 前端部署到Vercel

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel
```

创建 `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-api-server.com/api/:path*"
    }
  ]
}
```

#### 2. 数据库迁移到Supabase

1. 在 [Supabase](https://supabase.com) 创建项目
2. 在SQL编辑器中运行数据库初始化脚本
3. 更新API代码中的数据库连接配置

#### 3. 后端部署到云服务器

可以使用：
- Railway
- Render
- Heroku
- AWS EC2
- Google Cloud Run

## 环境变量配置

生产环境建议使用环境变量：

```bash
# .env.production
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=voice_badcase
DB_PASSWORD=your_secure_password
DB_PORT=5432

PORT=3000
NODE_ENV=production

UPLOAD_DIR=/var/app/uploads
MAX_FILE_SIZE=52428800
```

修改 `server/index.js` 使用环境变量：

```javascript
import dotenv from 'dotenv'
dotenv.config()

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
})

const port = process.env.PORT || 3000
```

## 性能优化

### 1. 启用Gzip压缩

```javascript
import compression from 'compression'
app.use(compression())
```

### 2. 添加缓存控制

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 数据库索引

```sql
CREATE INDEX idx_badcases_status ON badcases(status);
CREATE INDEX idx_badcases_priority ON badcases(priority);
CREATE INDEX idx_badcases_feedback_date ON badcases(feedback_date);
CREATE INDEX idx_badcases_created_at ON badcases(created_at);
```

### 4. CDN加速

将静态资源和上传的文件部署到CDN：
- 阿里云OSS
- 腾讯云COS
- AWS S3
- 七牛云

## 安全加固

### 1. HTTPS配置

使用Let's Encrypt免费SSL证书：

```bash
sudo certbot --nginx -d your-domain.com
```

### 2. 添加认证

安装依赖：

```bash
npm install jsonwebtoken bcryptjs
```

实现JWT认证中间件

### 3. 限流保护

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
})

app.use('/api', limiter)
```

### 4. SQL注入防护

使用参数化查询（已实现）

### 5. XSS防护

```bash
npm install helmet
```

```javascript
import helmet from 'helmet'
app.use(helmet())
```

## 监控和日志

### 1. PM2监控

```bash
pm2 monit
pm2 logs
```

### 2. 日志管理

使用winston或pino记录日志：

```bash
npm install winston
```

### 3. 错误追踪

集成Sentry：

```bash
npm install @sentry/node
```

## 备份策略

### 数据库备份

```bash
# 每日自动备份
0 2 * * * pg_dump -U postgres voice_badcase > /backup/voice_badcase_$(date +\%Y\%m\%d).sql
```

### 文件备份

定期备份 `uploads/` 目录到对象存储

## 更新和维护

### 更新代码

```bash
# 拉取最新代码
git pull

# 安装依赖
npm install

# 重新构建
npm run build

# 重启服务
pm2 restart voice-badcase-api
```

### 数据库迁移

创建迁移脚本并按顺序执行

## 回滚方案

1. 保留前一版本的构建产物
2. 使用PM2的回滚功能
3. 数据库备份恢复

## 健康检查

添加健康检查接口：

```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})
```

## 故障排查

常见问题和解决方案：

1. **服务无响应** - 检查进程状态和日志
2. **数据库连接失败** - 检查连接配置和网络
3. **文件上传失败** - 检查磁盘空间和权限
4. **内存泄漏** - 使用PM2自动重启

