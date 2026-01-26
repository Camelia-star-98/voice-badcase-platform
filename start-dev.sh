#!/bin/bash

# ================================================
# 开发环境启动脚本（连接正式 Supabase）
# ================================================

echo "🚀 启动开发环境"
echo "================================================"
echo ""

# 检查配置文件是否存在
if [ ! -f .env.local ]; then
  echo "❌ 错误：.env.local 配置文件不存在！"
  echo ""
  echo "请先创建配置文件："
  echo "  1. 复制配置模板："
  echo "     cp .env.local.example .env.local"
  echo "  2. 编辑 .env.local，填入正式 Supabase 项目的配置"
  echo ""
  exit 1
fi

# 验证配置
echo "📋 检查配置..."
if grep -q "VITE_SUPABASE_URL" .env.local; then
  SUPABASE_URL=$(grep "VITE_SUPABASE_URL" .env.local | cut -d '=' -f2 | tr -d ' ')
  if [ -n "$SUPABASE_URL" ] && [ "$SUPABASE_URL" != "your-project-id.supabase.co" ]; then
    echo "   ✅ Supabase URL 已配置"
    echo "   📍 URL: ${SUPABASE_URL:0:40}..."
  else
    echo "   ❌ Supabase URL 未正确配置"
    exit 1
  fi
else
  echo "   ❌ 配置文件中缺少 VITE_SUPABASE_URL"
  exit 1
fi

echo ""
echo "⚠️  重要提示："
echo "   - 此环境连接到正式 Supabase 项目"
echo "   - 数据操作会直接影响生产数据库"
echo "   - 请谨慎操作，建议先备份重要数据"
echo ""
echo "================================================"
echo "✅ 开发环境已就绪！"
echo ""
echo "🚀 启动开发服务器..."
echo "📍 访问地址：http://localhost:5173"
echo ""
echo "================================================"
echo ""

# 启动开发服务器
npm run dev





