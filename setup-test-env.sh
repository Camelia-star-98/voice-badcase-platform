#!/bin/bash

# ================================================
# 测试环境快速设置助手
# ================================================

echo "🔒 测试环境设置助手"
echo "================================================"
echo ""

# 检查是否已有测试配置文件
if [ -f .env.local.test ]; then
  echo "✅ 测试环境配置文件已存在"
  echo ""
  read -p "是否要重新配置？(y/n): " reconfigure
  if [ "$reconfigure" != "y" ] && [ "$reconfigure" != "Y" ]; then
    echo "✅ 使用现有配置"
    exit 0
  fi
fi

echo "📋 请按照以下步骤操作："
echo ""
echo "1️⃣  创建 Supabase 测试项目"
echo "   - 访问：https://supabase.com/dashboard"
echo "   - 点击 'New Project'"
echo "   - 项目名建议：voice-badcase-test"
echo "   - 选择 Free 计划"
echo ""
read -p "按回车键继续，确认已创建测试项目..."

echo ""
echo "2️⃣  获取测试项目配置"
echo "   - 在测试项目中，点击 Settings → API"
echo "   - 复制 Project URL 和 anon public key"
echo ""

# 创建测试配置文件
if [ ! -f .env.local.example ]; then
  echo "❌ 错误：找不到 .env.local.example 文件"
  exit 1
fi

cp .env.local.example .env.local.test

echo "✅ 已创建测试配置文件模板：.env.local.test"
echo ""
echo "3️⃣  请编辑配置文件，填入测试项目的配置"
echo ""
echo "   文件位置：$(pwd)/.env.local.test"
echo ""
echo "   需要填入的内容："
echo "   VITE_SUPABASE_URL=https://你的测试项目ID.supabase.co"
echo "   VITE_SUPABASE_ANON_KEY=你的测试项目anon key"
echo ""

# 尝试用默认编辑器打开
if command -v code &> /dev/null; then
  read -p "是否用 VS Code 打开配置文件？(y/n): " open_editor
  if [ "$open_editor" == "y" ] || [ "$open_editor" == "Y" ]; then
    code .env.local.test
  fi
elif command -v nano &> /dev/null; then
  read -p "是否用 nano 打开配置文件？(y/n): " open_editor
  if [ "$open_editor" == "y" ] || [ "$open_editor" == "Y" ]; then
    nano .env.local.test
  fi
fi

echo ""
read -p "配置完成后，按回车键继续..."

# 验证配置
echo ""
echo "📋 验证配置..."
if grep -q "VITE_SUPABASE_URL" .env.local.test && grep -q "VITE_SUPABASE_ANON_KEY" .env.local.test; then
  SUPABASE_URL=$(grep "VITE_SUPABASE_URL" .env.local.test | cut -d '=' -f2 | tr -d ' ')
  if [ -n "$SUPABASE_URL" ] && [ "$SUPABASE_URL" != "your-project-id.supabase.co" ]; then
    echo "✅ 配置验证通过"
    echo ""
    echo "4️⃣  初始化测试数据库"
    echo "   - 在测试项目的 SQL Editor 中执行："
    echo "     1. database/create_badcases_table.sql"
    echo "     2. database/add_priority_column.sql"
    echo ""
    read -p "数据库初始化完成后，按回车键继续..."
    
    echo ""
    echo "================================================"
    echo "✅ 测试环境配置完成！"
    echo ""
    echo "🚀 启动测试环境："
    echo "   ./start-test-env.sh"
    echo ""
    echo "📍 访问地址：http://localhost:5173"
    echo ""
    echo "⚠️  重要："
    echo "   - 始终使用 ./start-test-env.sh 启动"
    echo "   - 不要直接运行 npm run dev"
    echo "   - 这样可以确保不会误操作生产数据库"
    echo "================================================"
  else
    echo "❌ 配置未完成，请检查 .env.local.test 文件"
    exit 1
  fi
else
  echo "❌ 配置文件格式错误，请检查 .env.local.test"
  exit 1
fi





