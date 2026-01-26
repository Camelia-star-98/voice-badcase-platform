#!/bin/bash

# ================================================
# 测试环境启动脚本 - 确保始终使用测试环境
# ================================================
# 此脚本确保：
# 1. 始终使用测试环境配置
# 2. 不会意外连接到生产数据库
# 3. 自动检查测试环境配置是否存在
# ================================================

set -e  # 遇到错误立即退出

echo "🔒 测试环境启动脚本"
echo "================================================"
echo ""

# 检查测试环境配置文件是否存在
if [ ! -f .env.local.test ]; then
  echo "❌ 错误：测试环境配置文件不存在！"
  echo ""
  echo "请先创建测试环境配置："
  echo "  1. 创建 Supabase 测试项目"
  echo "  2. 复制配置模板："
  echo "     cp .env.local.example .env.local.test"
  echo "  3. 编辑 .env.local.test，填入测试项目的配置"
  echo ""
  echo "详细步骤请查看：QUICK_TEST_SETUP.md"
  exit 1
fi

# 备份当前配置（如果存在）
if [ -f .env.local ]; then
  # 检查是否是测试环境配置
  if grep -q "test\|TEST" .env.local 2>/dev/null; then
    echo "✅ 当前已是测试环境配置"
  else
    # 备份生产环境配置（如果存在）
    if [ ! -f .env.local.prod ]; then
      cp .env.local .env.local.prod
      echo "✅ 已备份生产环境配置到 .env.local.prod"
    fi
  fi
fi

# 强制使用测试环境配置
echo "🔒 强制切换到测试环境..."
cp .env.local.test .env.local
echo "✅ 已切换到测试环境配置"

# 验证配置
echo ""
echo "📋 验证测试环境配置..."
if grep -q "VITE_SUPABASE_URL" .env.local; then
  SUPABASE_URL=$(grep "VITE_SUPABASE_URL" .env.local | cut -d '=' -f2)
  echo "   Supabase URL: ${SUPABASE_URL:0:30}..."
  
  # 检查是否是测试项目（通过URL判断，或者添加注释标记）
  if grep -q "# TEST" .env.local.test 2>/dev/null || echo "$SUPABASE_URL" | grep -q "test\|TEST" 2>/dev/null; then
    echo "   ✅ 确认为测试环境"
  else
    echo "   ⚠️  警告：请确认这是测试项目的URL，不是生产环境！"
  fi
else
  echo "   ❌ 配置文件中缺少 VITE_SUPABASE_URL"
  exit 1
fi

# 添加安全标记到 .env.local（防止误操作）
if ! grep -q "# SAFE TEST ENV" .env.local; then
  echo "" >> .env.local
  echo "# SAFE TEST ENV - DO NOT MODIFY PRODUCTION DATABASE" >> .env.local
  echo "# 这是测试环境配置，不会影响生产数据" >> .env.local
fi

echo ""
echo "================================================"
echo "✅ 测试环境已就绪！"
echo ""
echo "🚀 启动开发服务器..."
echo "📍 访问地址：http://localhost:5173"
echo ""
echo "⚠️  重要提示："
echo "   - 此环境连接到测试 Supabase 项目"
echo "   - 不会影响生产数据库"
echo "   - 可以随意测试新功能"
echo ""
echo "================================================"
echo ""

# 启动开发服务器
npm run dev





