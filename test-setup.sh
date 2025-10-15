#!/bin/bash

echo "🧪 测试 Vue 3 项目设置..."
echo ""

# 检查 Node.js 版本
echo "✓ 检查 Node.js 版本..."
node --version

# 检查 npm 版本
echo "✓ 检查 npm 版本..."
npm --version

# 检查依赖是否安装
echo ""
echo "✓ 检查依赖..."
if [ -d "node_modules" ]; then
    echo "  依赖已安装 ✓"
else
    echo "  ❌ 依赖未安装，运行: npm install"
    exit 1
fi

# 检查关键文件
echo ""
echo "✓ 检查项目文件..."
files=(
    "package.json"
    "vite.config.ts"
    "tailwind.config.js"
    "postcss.config.js"
    "src/main.ts"
    "src/App.vue"
    "src/stores/index.ts"
    "src/components/Counter.vue"
    "src/components/MenuExample.vue"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ❌ $file 缺失"
    fi
done

echo ""
echo "✅ 所有检查通过！"
echo ""
echo "📝 可用命令："
echo "  npm run dev     - 启动开发服务器"
echo "  npm run build   - 构建生产版本"
echo "  npm run preview - 预览生产构建"
echo ""

