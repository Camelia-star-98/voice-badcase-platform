#!/bin/bash

echo "🔧 创建 .env.local 文件..."

cat > .env.local << 'ENVEOF'
VITE_SUPABASE_URL=https://bpivzznuvvbafsyvzxqm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwaXZ6em51dnZiYWZzeXZ6eHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MDg1NjIsImV4cCI6MjA0ODk4NDU2Mn0.cXDE2rwda9N9o_eBSZeW10_YuVNCN6BCHc0kcNCuTRw
ENVEOF

echo "✅ .env.local 文件已创建"
echo ""
echo "📋 文件内容："
cat .env.local
echo ""
echo "🌐 测试网络连接..."
if ping -c 1 bpivzznuvvbafsyvzxqm.supabase.co > /dev/null 2>&1; then
  echo "✅ 网络连接正常"
else
  echo "❌ 无法连接到 Supabase（可能是网络问题）"
fi
echo ""
echo "📢 下一步："
echo "1. 重启开发服务器：停止当前服务器（Ctrl+C），然后运行 npm run dev"
echo "2. 刷新浏览器：Cmd+Shift+R (Mac) 或 Ctrl+Shift+R (Windows)"

