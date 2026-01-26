#!/bin/bash

# 环境切换脚本
# 用法: ./switch-env.sh [test|prod]

ENV_TYPE=$1

if [ -z "$ENV_TYPE" ]; then
  echo "❌ 错误：请指定环境类型"
  echo "用法: ./switch-env.sh [test|prod]"
  exit 1
fi

if [ "$ENV_TYPE" == "test" ]; then
  if [ -f .env.local.test ]; then
    # 备份当前配置（如果存在）
    if [ -f .env.local ]; then
      cp .env.local .env.local.backup
      echo "✅ 已备份当前配置到 .env.local.backup"
    fi
    # 切换到测试环境
    cp .env.local.test .env.local
    echo "✅ 已切换到测试环境"
    echo "📝 提示：测试完成后运行 './switch-env.sh prod' 切换回生产环境"
  else
    echo "❌ 错误：.env.local.test 文件不存在"
    echo "请先创建测试环境配置文件："
    echo "  1. 复制 .env.local.example 为 .env.local.test"
    echo "  2. 填入测试 Supabase 项目的配置"
    exit 1
  fi
elif [ "$ENV_TYPE" == "prod" ]; then
  if [ -f .env.local.prod ]; then
    cp .env.local.prod .env.local
    echo "✅ 已切换到生产环境"
  elif [ -f .env.local.backup ]; then
    mv .env.local.backup .env.local
    echo "✅ 已恢复生产环境配置（从备份）"
  else
    echo "❌ 错误：找不到生产环境配置文件"
    echo "请手动配置 .env.local 文件"
    exit 1
  fi
else
  echo "❌ 错误：无效的环境类型 '$ENV_TYPE'"
  echo "用法: ./switch-env.sh [test|prod]"
  exit 1
fi





