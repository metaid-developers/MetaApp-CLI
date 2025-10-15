#!/bin/bash

# 自动使用正确的 Node.js 版本启动开发服务器

echo "🚀 启动 Vue 3 开发服务器..."
echo ""

# 检查 nvm 是否可用
if [ -s "$NVM_DIR/nvm.sh" ]; then
    source "$NVM_DIR/nvm.sh"
elif [ -s "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh"
else
    echo "⚠️  未找到 nvm，尝试直接使用当前 Node.js 版本..."
fi

# 如果有 .nvmrc 文件，使用指定的 Node.js 版本
if [ -f ".nvmrc" ] && command -v nvm &> /dev/null; then
    echo "📦 切换到项目指定的 Node.js 版本..."
    nvm use
    echo ""
fi

# 显示当前 Node.js 版本
echo "✓ Node.js: $(node --version)"
echo "✓ npm: $(npm --version)"
echo ""

# 检查 Node.js 版本是否满足要求
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ 错误：Vite 7 需要 Node.js 20.19+ 或 22.12+"
    echo "   当前版本：$(node --version)"
    echo ""
    echo "请运行以下命令切换 Node.js 版本："
    echo "  nvm use 20.19.1"
    echo ""
    exit 1
fi

# 启动开发服务器
npm run dev

