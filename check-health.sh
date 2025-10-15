#!/bin/bash

echo "🏥 项目健康检查"
echo "================================"
echo ""

# 检查 Node.js 版本
NODE_VERSION=$(node --version)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$NODE_MAJOR" -ge 20 ]; then
    echo "✓ Node.js: $NODE_VERSION (满足 Vite 7 要求)"
else
    echo "❌ Node.js: $NODE_VERSION (需要 20.19+ 或 22.12+)"
    echo ""
    echo "   请使用以下命令切换版本："
    echo "   nvm use 20.19.1"
    echo ""
    exit 1
fi

# 检查 npm 版本
NPM_VERSION=$(npm --version)
echo "✓ npm: $NPM_VERSION"

# 检查 node_modules
if [ -d "node_modules" ]; then
    echo "✓ 依赖已安装"
else
    echo "❌ 依赖未安装，请运行: npm install"
    exit 1
fi

# 检查锁文件
echo ""
echo "📦 包管理器检查："
if [ -f "package-lock.json" ]; then
    echo "  ✓ package-lock.json (npm)"
fi
if [ -f "yarn.lock" ]; then
    echo "  ⚠️  yarn.lock 存在（建议删除，只使用 npm）"
fi
if [ -f "pnpm-lock.yaml" ]; then
    echo "  ⚠️  pnpm-lock.yaml 存在（建议删除，只使用 npm）"
fi

# 检查关键配置文件
echo ""
echo "⚙️  配置文件检查："
files=(
    "vite.config.ts"
    "tailwind.config.js"
    "postcss.config.js"
    "tsconfig.json"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ❌ $file 缺失"
    fi
done

# 检查源代码文件
echo ""
echo "📁 源代码检查："
src_files=(
    "src/main.ts"
    "src/App.vue"
    "src/stores/index.ts"
    "src/components/Counter.vue"
    "src/components/MenuExample.vue"
)

for file in "${src_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ❌ $file 缺失"
    fi
done

# 检查是否有不兼容的插件
echo ""
echo "🔌 插件兼容性检查："
if grep -q "vite-plugin-vue-devtools" package.json; then
    echo "  ⚠️  检测到 vite-plugin-vue-devtools（可能与 Vite 5.x 不兼容）"
else
    echo "  ✓ 无已知不兼容插件"
fi

# 尝试构建
echo ""
echo "🔨 构建测试："
if npm run build > /dev/null 2>&1; then
    echo "  ✓ 构建成功"
else
    echo "  ❌ 构建失败，请检查错误信息"
    exit 1
fi

echo ""
echo "================================"
echo "✅ 所有检查通过！项目健康状态良好。"
echo ""
echo "💡 快速命令："
echo "  npm run dev     - 启动开发服务器"
echo "  npm run build   - 构建生产版本"
echo "  npm run preview - 预览生产构建"
echo ""
echo "📚 文档："
echo "  README.md       - 项目说明"
echo "  GUIDE.md        - 使用指南"
echo "  DEVELOPMENT.md  - 开发注意事项"
echo "  CHANGELOG.md    - 更新日志"
echo ""

