#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Supabase 数据同步 - 快速部署脚本${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# 检查是否在项目目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 项目目录检查通过${NC}"
echo ""

# 步骤 1: 检查 Vercel CLI
echo -e "${YELLOW}[1/5] 检查 Vercel CLI...${NC}"
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI 未安装，正在安装...${NC}"
    npm install -g vercel
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Vercel CLI 安装失败${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Vercel CLI 安装成功${NC}"
else
    echo -e "${GREEN}✅ Vercel CLI 已安装${NC}"
fi
echo ""

# 步骤 2: 登录 Vercel
echo -e "${YELLOW}[2/5] 登录 Vercel...${NC}"
vercel whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  需要登录 Vercel${NC}"
    vercel login
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Vercel 登录失败${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✅ Vercel 登录成功${NC}"
echo ""

# 步骤 3: 设置环境变量
echo -e "${YELLOW}[3/5] 配置环境变量...${NC}"
echo ""
echo -e "${BLUE}请选择环境:${NC}"
echo "  1) Production (生产环境)"
echo "  2) Preview (预览环境)"  
echo "  3) Development (开发环境)"
echo "  4) 全部环境"
echo ""
read -p "请输入选择 (1-4): " env_choice

case $env_choice in
    1)
        ENV_NAME="production"
        ;;
    2)
        ENV_NAME="preview"
        ;;
    3)
        ENV_NAME="development"
        ;;
    4)
        ENV_NAME="production,preview,development"
        ;;
    *)
        echo -e "${RED}❌ 无效选择${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}设置 VITE_SUPABASE_URL...${NC}"
echo "https://bpivzznuvvbafsyvzxqm.supabase.co" | vercel env add VITE_SUPABASE_URL $ENV_NAME

echo ""
echo -e "${BLUE}设置 VITE_SUPABASE_ANON_KEY...${NC}"
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwaXZ6em51dnZiYWZzeXZ6eHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MDg1NjIsImV4cCI6MjA0ODk4NDU2Mn0.cXDE2rwda9N9o_eBSZeW10_YuVNCN6BCHc0kcNCuTRw" | vercel env add VITE_SUPABASE_ANON_KEY $ENV_NAME

echo ""
echo -e "${GREEN}✅ 环境变量配置完成${NC}"
echo ""

# 步骤 4: 构建项目
echo -e "${YELLOW}[4/5] 构建项目...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 构建失败${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 项目构建成功${NC}"
echo ""

# 步骤 5: 部署到 Vercel
echo -e "${YELLOW}[5/5] 部署到 Vercel...${NC}"
echo ""
echo -e "${BLUE}请选择部署类型:${NC}"
echo "  1) Production (生产环境)"
echo "  2) Preview (预览环境)"
echo ""
read -p "请输入选择 (1-2): " deploy_choice

case $deploy_choice in
    1)
        echo -e "${YELLOW}正在部署到生产环境...${NC}"
        vercel --prod
        ;;
    2)
        echo -e "${YELLOW}正在部署到预览环境...${NC}"
        vercel
        ;;
    *)
        echo -e "${RED}❌ 无效选择${NC}"
        exit 1
        ;;
esac

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 部署失败${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  ✅ 部署完成！${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${BLUE}下一步:${NC}"
echo "1. 访问你的应用网址"
echo "2. 按 F12 打开浏览器控制台"
echo "3. 查看是否显示 '✅ Supabase 客户端已初始化'"
echo "4. 测试删除功能，在另一台电脑验证同步"
echo ""
echo -e "${YELLOW}如果遇到问题，请查看文档:${NC}"
echo "  - SUPABASE_SYNC_FIX.md"
echo "  - 或运行: open test-supabase-connection.html"
echo ""

