#!/bin/bash

# 消防灭火策略游戏启动脚本

echo "🔥 消防灭火策略游戏"
echo "=================="
echo ""

# 检查端口是否被占用
PORT=8080
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 $PORT 已被占用"
    echo "尝试终止占用进程..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null
    sleep 1
fi

# 启动HTTP服务器
echo "🚀 启动服务器..."
echo "📍 访问地址: http://localhost:$PORT"
echo ""
echo "💡 提示:"
echo "   - 按 Ctrl+C 停止服务器"
echo "   - 游戏支持键盘和鼠标操作"
echo "   - 建议使用Chrome或Firefox浏览器"
echo ""

# 使用Python启动HTTP服务器
cd "$(dirname "$0")"
python3 -m http.server $PORT
