# 快速启动指南

## 🚀 5 分钟开始使用

### 第一步：确认 Node.js 版本

```bash
node --version
```

**要求：Node.js 20.19+ 或 22.12+**

如果版本不符合要求：

```bash
# 安装 nvm（如果还没有）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 安装并使用 Node.js 20.19.1
nvm install 20.19.1
nvm use 20.19.1
```

### 第二步：安装依赖

```bash
npm install
```

### 第三步：启动开发服务器

#### 方式 A：使用启动脚本（推荐）

```bash
./dev.sh
```

✨ 脚本会自动：
- 切换到正确的 Node.js 版本
- 检查环境要求
- 启动开发服务器

#### 方式 B：手动启动

```bash
# 如果使用 nvm
nvm use

# 启动开发服务器
npm run dev
```

### 第四步：打开浏览器

访问：**http://localhost:5173**

## 🎯 特色功能

### 1. 内置 Vue DevTools

开发服务器启动后，可以通过以下方式使用 Vue DevTools：

- **独立窗口**：访问 `http://localhost:5173/__devtools__/`
- **快捷键**：在应用中按 `Option(⌥) + Shift(⇧) + D`

### 2. 热模块替换（HMR）

修改代码后，浏览器会自动刷新，无需手动重载。

### 3. 示例组件

项目包含两个示例组件：

- **Counter（计数器）**：演示 Pinia 状态管理
- **Menu（菜单）**：演示 Headless UI 组件

## 📁 项目结构

```
metaid-demo-app/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── Counter.vue     # Pinia 状态管理示例
│   │   └── MenuExample.vue # Headless UI 组件示例
│   ├── stores/             # Pinia stores
│   │   ├── index.ts       # Pinia 配置
│   │   └── counter.ts     # 计数器 store
│   ├── styles/             # SCSS 样式
│   │   └── variables.scss # SCSS 变量
│   ├── App.vue            # 根组件
│   ├── main.ts            # 应用入口
│   └── style.css          # Tailwind CSS 配置
├── .nvmrc                  # Node.js 版本配置
├── dev.sh                  # 启动脚本
├── package.json            # 依赖配置
├── vite.config.ts         # Vite 配置
├── tailwind.config.js     # Tailwind CSS 配置
└── tsconfig.json          # TypeScript 配置
```

## 🛠️ 常用命令

```bash
# 启动开发服务器
./dev.sh                # 推荐方式
npm run dev             # 直接启动

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 项目健康检查
./check-health.sh

# 安装新依赖
npm install <package-name>
```

## 🎨 技术栈

- **Vue 3.5** - 渐进式 JavaScript 框架
- **TypeScript 5.9** - 类型安全
- **Vite 7.1** - 下一代构建工具
- **Tailwind CSS 3.4** - 实用优先的 CSS
- **SCSS** - CSS 预处理器
- **Headless UI** - 无样式 UI 组件
- **Pinia 3.0** - 状态管理
- **Vue DevTools 8.0** - 内置调试工具

## 🐛 常见问题

### Q: 启动失败，提示 Node.js 版本不对？

**A:** 确保使用 Node.js 20.19+ 或 22.12+

```bash
nvm use 20.19.1
```

### Q: 看到 SCSS 弃用警告？

**A:** 这是 Dart Sass 的警告，不影响功能。未来版本会解决。

### Q: 如何添加新的 Vue 组件？

**A:** 在 `src/components/` 目录下创建 `.vue` 文件：

```vue
<script setup lang="ts">
// 你的逻辑
</script>

<template>
  <!-- 你的模板 -->
</template>

<style scoped lang="scss">
/* 你的样式 */
</style>
```

### Q: 如何使用 Pinia 状态管理？

**A:** 参考 `src/stores/counter.ts` 示例：

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMyStore = defineStore('myStore', () => {
  const data = ref('')
  
  function updateData(value: string) {
    data.value = value
  }
  
  return { data, updateData }
})
```

## 📚 进阶文档

- [README.md](./README.md) - 项目完整说明
- [GUIDE.md](./GUIDE.md) - 详细使用指南
- [DEVELOPMENT.md](./DEVELOPMENT.md) - 开发注意事项
- [CHANGELOG.md](./CHANGELOG.md) - 更新日志

## 💡 小贴士

1. **使用启动脚本** - `./dev.sh` 会自动处理 Node.js 版本
2. **安装 VS Code 扩展** - Volar、Tailwind CSS IntelliSense
3. **使用 Vue DevTools** - 按 `Option + Shift + D` 快速切换
4. **查看健康状态** - 运行 `./check-health.sh` 检查项目状态

## 🎉 开始开发

现在你已经准备好了！打开浏览器访问 `http://localhost:5173` 开始开发你的应用吧！

有问题？查看 [DEVELOPMENT.md](./DEVELOPMENT.md) 获取更多帮助。

