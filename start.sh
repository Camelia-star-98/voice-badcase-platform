#!/bin/bash

echo "================================"
echo "语音Badcase流转平台 - 启动脚本"
echo "================================"
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi

echo "✅ Node.js版本: $(node --version)"
echo ""

# 检查PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  警告: 未找到PostgreSQL命令行工具"
    echo "   请确保PostgreSQL已安装并正在运行"
else
    echo "✅ PostgreSQL已安装"
fi

echo ""
echo "1️⃣  检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "   未找到node_modules，正在安装依赖..."
    npm install
else
    echo "   ✅ 依赖已安装"
fi

echo ""
echo "2️⃣  启动后端服务..."
npm run server &
BACKEND_PID=$!
echo "   后端服务PID: $BACKEND_PID"

sleep 3

echo ""
echo "3️⃣  启动前端服务..."
npm run dev &
FRONTEND_PID=$!
echo "   前端服务PID: $FRONTEND_PID"

echo ""
echo "================================"
echo "🎉 服务启动完成！"
echo "================================"
echo "后端地址: http://localhost:3000"
echo "前端地址: http://localhost:5173"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo "================================"
echo ""

# 等待用户中断
trap "echo ''; echo '正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

wait

