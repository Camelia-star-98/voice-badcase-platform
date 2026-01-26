#!/bin/bash

# ================================================
# 立即启动脚本 - 解决 ERR_CONNECTION_REFUSED
# ================================================

echo "🚀 启动 Badcase 提报平台"
echo "================================================"
echo ""

cd /Users/yanglurui/voice-badcase-platform

# 第1步：检查并安装依赖
echo "📦 第1步：检查依赖..."
if [ ! -d "node_modules" ]; then
  echo "   依赖未安装，开始安装..."
  npm install
  if [ $? -ne 0 ]; then
    echo "   ❌ 依赖安装失败，请检查网络连接"
    exit 1
  fi
  echo "   ✅ 依赖安装完成"
else
  echo "   ✅ 依赖已存在"
fi

echo ""

# 第2步：检查配置文件
echo "📋 第2步：检查配置文件..."
if [ ! -f ".env.local" ]; then
  echo "   配置文件不存在，创建模板..."
  if [ -f ".env.local.example" ]; then
    cp .env.local.example .env.local
    echo "   ✅ 已创建 .env.local 配置文件模板"
    echo ""
    echo "   ⚠️  重要：请编辑 .env.local 文件，填入 Supabase 配置"
    echo "   编辑命令：nano .env.local 或 code .env.local"
    echo ""
    read -p "   是否现在编辑配置文件？(y/n): " edit_now
    if [ "$edit_now" == "y" ] || [ "$edit_now" == "Y" ]; then
      if command -v code &> /dev/null; then
        code .env.local
      elif command -v nano &> /dev/null; then
        nano .env.local
      else
        echo "   请手动编辑 .env.local 文件"
      fi
      echo ""
      read -p "   配置完成后，按回车键继续..."
    fi
  else
    echo "   ❌ 找不到 .env.local.example 模板文件"
    echo "   请手动创建 .env.local 文件"
    exit 1
  fi
else
  echo "   ✅ 配置文件已存在"
fi

echo ""

# 第3步：验证配置
echo "🔍 第3步：验证配置..."
if grep -q "VITE_SUPABASE_URL" .env.local && ! grep -q "your-project-id" .env.local; then
  echo "   ✅ 配置看起来正确"
else
  echo "   ⚠️  警告：配置可能未完成"
  echo "   请确认 .env.local 中已填入正确的 Supabase 配置"
  read -p "   是否继续启动？(y/n): " continue_start
  if [ "$continue_start" != "y" ] && [ "$continue_start" != "Y" ]; then
    exit 1
  fi
fi

echo ""
echo "================================================"
echo "🚀 启动开发服务器..."
echo "📍 启动后访问：http://localhost:5173"
echo ""
echo "⚠️  提示："
echo "   - 如果看到错误，请检查 .env.local 配置"
echo "   - 按 Ctrl+C 可以停止服务器"
echo "================================================"
echo ""

# 启动开发服务器
npm run dev





