#!/bin/bash

# 数据迁移一键脚本
# 使用方法: chmod +x migrate.sh && ./migrate.sh

echo "🎯 Voice Badcase Platform - 数据迁移工具"
echo "========================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 错误: 未安装 Node.js${NC}"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js 已安装: $(node -v)${NC}"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ 错误: 未安装 npm${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm 已安装: $(npm -v)${NC}"
echo ""

# 检查数据文件
if [ ! -f "localStorage-backup.json" ]; then
    echo -e "${YELLOW}⚠️  未找到 localStorage-backup.json 文件${NC}"
    echo ""
    echo "请按照以下步骤操作："
    echo "1. 在浏览器中打开应用并确保有数据"
    echo "2. 打开 export-localStorage-data.html"
    echo "3. 导出并下载 localStorage-backup.json"
    echo "4. 将文件放到项目根目录"
    echo "5. 重新运行此脚本"
    echo ""
    
    # 尝试打开导出页面
    if command -v open &> /dev/null; then
        read -p "是否打开导出工具？(y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            open export-localStorage-data.html
            echo -e "${GREEN}✅ 已打开导出工具${NC}"
        fi
    fi
    
    exit 1
fi

echo -e "${GREEN}✅ 找到数据文件: localStorage-backup.json${NC}"

# 统计数据
DATA_COUNT=$(cat localStorage-backup.json | jq '. | length' 2>/dev/null || echo "unknown")
if [ "$DATA_COUNT" != "unknown" ]; then
    echo -e "${GREEN}📊 数据记录数: $DATA_COUNT 条${NC}"
fi

echo ""
echo -e "${YELLOW}⚠️  准备迁移数据到 Supabase${NC}"
echo "   - 已存在的记录将被更新"
echo "   - 新记录将被插入"
echo ""

# 倒计时
for i in 5 4 3 2 1; do
    echo -ne "${YELLOW}开始迁移倒计时: $i 秒... (Ctrl+C 取消)${NC}\r"
    sleep 1
done

echo ""
echo ""

# 执行迁移
echo -e "${GREEN}🚀 开始执行迁移...${NC}"
echo "========================================"
echo ""

npx tsx migrate-to-supabase.ts

# 检查执行结果
if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo -e "${GREEN}✅ 迁移完成！${NC}"
    echo ""
    echo "下一步："
    echo "1. 刷新浏览器页面"
    echo "2. 检查控制台是否显示 '使用 Supabase 数据库'"
    echo "3. 验证数据是否正确显示"
    echo ""
    echo "💡 提示: 现在可以删除 localStorage-backup.json 或将其保存为备份"
else
    echo ""
    echo "========================================"
    echo -e "${RED}❌ 迁移失败！${NC}"
    echo ""
    echo "请检查："
    echo "1. Supabase 配置是否正确"
    echo "2. 网络连接是否正常"
    echo "3. 数据格式是否正确"
    echo ""
    echo "查看上方错误信息获取详细原因"
    exit 1
fi

