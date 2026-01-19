#!/bin/bash

echo "🚀 开始部署到 Vercel..."
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 检查是否在 main 分支
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "⚠️  警告：当前不在 main 分支（当前：$current_branch）"
    read -p "是否继续？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 确保代码是最新的
echo "📥 拉取最新代码..."
git pull origin main

# 检查是否有未提交的更改
if [[ -n $(git status -s) ]]; then
    echo "⚠️  警告：有未提交的更改"
    git status -s
    read -p "是否继续？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🔧 准备部署..."
echo ""

# 方式1：使用 npx vercel（推荐）
echo "选择部署方式："
echo "1) 使用 CLI 部署（需要登录）"
echo "2) 查看 Web 部署指南"
echo ""
read -p "请选择 (1/2): " choice

case $choice in
    1)
        echo ""
        echo "🌐 开始 Vercel CLI 部署..."
        echo ""
        
        # 检查是否已登录
        if ! npx vercel whoami &>/dev/null; then
            echo "📝 需要先登录 Vercel..."
            echo "如果浏览器没有自动打开，请手动访问显示的链接"
            npx vercel login
        fi
        
        echo ""
        echo "🚀 部署到生产环境..."
        npx vercel --prod
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ 部署成功！"
            echo ""
            echo "📋 后续步骤："
            echo "1. 访问 Vercel Dashboard 查看部署状态"
            echo "2. 配置环境变量（如果还没配置）"
            echo "3. 更新钉钉回调地址"
            echo "4. 测试所有功能"
        else
            echo ""
            echo "❌ 部署失败，请检查错误信息"
            exit 1
        fi
        ;;
    2)
        echo ""
        echo "📘 Web 部署指南"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "1️⃣  访问：https://vercel.com/new"
        echo ""
        echo "2️⃣  导入仓库：voice-badcase-platform"
        echo ""
        echo "3️⃣  添加环境变量："
        echo "   📌 VITE_SUPABASE_URL"
        echo "   📌 VITE_SUPABASE_ANON_KEY"
        echo "   📌 DINGTALK_APP_KEY"
        echo "   📌 DINGTALK_APP_SECRET"
        echo "   📌 DINGTALK_AGENT_ID"
        echo "   📌 DINGTALK_CORP_ID"
        echo "   📌 DINGTALK_TOKEN"
        echo "   📌 DINGTALK_AES_KEY"
        echo ""
        echo "4️⃣  点击 Deploy 按钮"
        echo ""
        echo "5️⃣  等待 2-3 分钟"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "📖 详细步骤请查看：DEPLOY_NOW.md"
        echo ""
        
        # 询问是否打开文档
        read -p "是否打开详细部署文档？(y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if command -v open &> /dev/null; then
                open DEPLOY_NOW.md
            elif command -v xdg-open &> /dev/null; then
                xdg-open DEPLOY_NOW.md
            else
                echo "请手动打开：DEPLOY_NOW.md"
            fi
        fi
        ;;
    *)
        echo "❌ 无效的选择"
        exit 1
        ;;
esac

echo ""
echo "🎉 部署流程完成！"

