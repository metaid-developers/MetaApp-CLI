#!/bin/bash

if [ -f ".nvmrc" ]; then
    REQUIRED_VERSION=$(cat .nvmrc)
    CURRENT_VERSION=$(node -v 2>/dev/null || echo "none")
    
    if [ "$CURRENT_VERSION" != "v$REQUIRED_VERSION" ]; then
        echo "🔁 切换到 Node.js v$REQUIRED_VERSION (根据 .nvmrc)"
        nvm use "$REQUIRED_VERSION" 2>/dev/null || (echo "❌ 版本 v$REQUIRED_VERSION 未安装，请运行: nvm install" && exit 1)
    fi
fi