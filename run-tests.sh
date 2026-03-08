#!/bin/bash

# 消防灭火策略游戏测试脚本

echo "🧪 消防灭火策略游戏 - 测试套件"
echo "================================"
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: Node.js 未安装"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: npm 未安装"
    echo "请先安装 npm: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo "✅ npm 版本: $(npm --version)"
echo ""

# 检查node_modules是否存在
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
    echo ""
fi

# 运行测试
echo "🚀 运行测试..."
echo ""

case "$1" in
    "watch")
        npm run test:watch
        ;;
    "coverage")
        npm run test:coverage
        ;;
    *)
        npm test
        ;;
esac

# 检查测试结果
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 所有测试通过！"
else
    echo ""
    echo "❌ 测试失败，请检查错误信息"
fi
