# 使用 Node.js 18 镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装所有依赖（包括 devDependencies，构建需要）
RUN npm ci

# 复制源代码
COPY . .

# 构建前端（先用占位符构建，运行时动态注入环境变量）
RUN npm run build

# 删除 devDependencies 以减小镜像大小
RUN npm prune --production

# 暴露端口
EXPOSE 3000

# 启动命令：运行 Express 服务器（同时服务前端和 API）
CMD ["node", "server/railway-server.js"]

