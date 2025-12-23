#!/bin/bash

# Vercel 环境变量配置脚本
# 使用前请确保已安装 Vercel CLI: npm i -g vercel

echo "🔧 正在配置 Vercel 环境变量..."

# 设置 VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_URL production preview development <<EOF
https://mcpyilgpotajpmgblorc.supabase.co
EOF

# 设置 VITE_SUPABASE_ANON_KEY
vercel env add VITE_SUPABASE_ANON_KEY production preview development <<EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jcHlpbGdwb3RhanBtZ2Jsb3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODUxNzMsImV4cCI6MjA4MTk2MTE3M30.mmVnFh6uDlRdlOKmtKQSd2WnLBKd4ApE4OWqIMu-41c
EOF

echo "✅ 环境变量配置完成！"
echo "⚠️  请在 Vercel 控制台重新部署项目以使更改生效"

