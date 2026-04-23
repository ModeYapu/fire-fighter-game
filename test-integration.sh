#!/bin/bash

# 消防灭火游戏 - 快速测试脚本
# 版本: v1.3.0

echo "🚒 消防灭火游戏 v1.3.0 - 集成测试"
echo "=================================="
echo ""

# 检查Python
if command -v python3 &> /dev/null; then
    echo "✅ Python3 已安装"
else
    echo "❌ Python3 未安装，请先安装Python3"
    exit 1
fi

# 检查关键文件
echo ""
echo "📁 检查关键文件..."
files_ok=true

check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1"
    else
        echo "❌ $1 不存在"
        files_ok=false
    fi
}

check_file "index.html"
check_file "src/core/Game.js"
check_file "src/main.js"
check_file "js/rescue.js"
check_file "js/upgrade.js"
check_file "js/vehicle.js"
check_file "js/extended-facilities.js"

if [ "$files_ok" = false ]; then
    echo ""
    echo "❌ 关键文件缺失，请检查"
    exit 1
fi

echo ""
echo "✅ 所有关键文件已就位"
echo ""

# 启动服务器
echo "🚀 启动HTTP服务器..."
echo "📍 服务地址: http://localhost:8080"
echo ""
echo "📝 测试清单:"
echo "  1. 打开浏览器访问上述地址"
echo "  2. 检查控制台是否有错误（F12）"
echo "  3. 测试主菜单所有按钮"
echo "  4. 开始游戏测试新功能"
echo ""
echo "💡 提示:"
echo "  - 按 Ctrl+C 停止服务器"
echo "  - 查看浏览器控制台（F12）获取调试信息"
echo ""
echo "=================================="
echo ""

python3 -m http.server 8080
