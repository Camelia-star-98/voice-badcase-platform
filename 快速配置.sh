#!/bin/bash

# ================================================
# 快速配置助手
# ================================================

echo "🚀 Badcase 平台配置助手"
echo "================================================"
echo ""

cd /Users/yanglurui/voice-badcase-platform

# 检查配置文件
if [ ! -f ".env.local" ]; then
  echo "❌ 配置文件不存在，正在创建..."
  if [ -f ".env.local.example" ]; then
    cp .env.local.example .env.local
    echo "✅ 已创建配置文件模板"
  else
    echo "⚠️  创建空配置文件..."
    cat > .env.local << EOF
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
EOF
    echo "✅ 已创建配置文件"
  fi
else
  echo "✅ 配置文件已存在"
fi

echo ""
echo "================================================"
echo "📋 下一步操作："
echo ""
echo "1️⃣  编辑配置文件："
echo "   nano .env.local"
echo "   或"
echo "   code .env.local"
echo ""
echo "   填入你的 Supabase 配置："
echo "   VITE_SUPABASE_URL=https://你的项目ID.supabase.co"
echo "   VITE_SUPABASE_ANON_KEY=你的anon key"
echo ""
echo "2️⃣  执行数据库迁移："
echo "   - 访问：https://supabase.com/dashboard"
echo "   - 选择你的项目 → SQL Editor → New query"
echo "   - 执行：database/add_priority_column.sql"
echo ""
echo "3️⃣  启动服务器："
echo "   npm run dev"
echo ""
echo "4️⃣  访问平台："
echo "   http://localhost:5173"
echo ""
echo "================================================"
echo ""

# 询问是否现在编辑配置文件
read -p "是否现在编辑配置文件？(y/n): " edit_now
if [ "$edit_now" == "y" ] || [ "$edit_now" == "Y" ]; then
  if command -v code &> /dev/null; then
    code .env.local
  elif command -v nano &> /dev/null; then
    nano .env.local
  else
    echo "请手动编辑 .env.local 文件"
  fi
fi

echo ""
echo "✅ 配置助手完成！"
echo "详细步骤请查看：配置完成指南.md"




