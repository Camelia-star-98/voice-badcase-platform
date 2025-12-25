# 使用 Node.js 18 镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建前端
RUN npm run build

# 安装 serve 用于服务静态文件
RUN npm install -g serve

# 暴露端口
EXPOSE 3000

# 启动命令：同时运行 API 和前端
CMD ["sh", "-c", "serve -s dist -l 3000"]

