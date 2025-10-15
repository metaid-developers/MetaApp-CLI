# 使用指南

## 🎯 项目概述

这是一个完整的 Vue 3 现代化技术栈演示项目，集成了以下技术：

- **Vue 3**: 使用 Composition API 和 `<script setup>` 语法
- **TypeScript**: 提供完整的类型支持
- **Vite**: 快速的开发服务器和构建工具
- **Tailwind CSS**: 实用优先的 CSS 框架
- **SCSS**: 支持 SCSS 预处理器
- **Headless UI**: 无样式、完全可访问的 UI 组件库
- **Pinia**: Vue 3 官方推荐的状态管理库

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 查看应用

### 3. 构建生产版本

```bash
npm run build
```

### 4. 预览生产构建

```bash
npm run preview
```

## 📚 技术详解

### Vue 3 Composition API

项目中的组件都使用了 Composition API 的 `<script setup>` 语法糖：

```vue
<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
</script>
```

### TypeScript 集成

所有文件都使用 TypeScript，提供类型安全：

```typescript
// stores/counter.ts
export const useCounterStore = defineStore('counter', () => {
  const count = ref<number>(0)
  return { count }
})
```

### Tailwind CSS 使用

使用 Tailwind 的工具类来构建 UI：

```vue
<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
  <!-- 内容 -->
</div>
```

### SCSS 支持

在 Vue 组件中使用 SCSS：

```vue
<style scoped lang="scss">
.card {
  @apply bg-white rounded-lg;
  
  .card-header {
    @apply p-4 bg-blue-500;
  }
}
</style>
```

### Headless UI 组件

使用 Headless UI 的无样式组件：

```vue
<script setup>
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
</script>

<template>
  <Menu>
    <MenuButton>选项</MenuButton>
    <MenuItems>
      <MenuItem>项目 1</MenuItem>
    </MenuItems>
  </Menu>
</template>
```

### Pinia 状态管理

创建和使用 Store：

```typescript
// 定义 Store
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const increment = () => count.value++
  return { count, increment }
})

// 在组件中使用
const store = useCounterStore()
store.increment()
```

## 🎨 项目结构说明

```
metaid-demo-app/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── Counter.vue     # Pinia 状态管理示例
│   │   └── MenuExample.vue # Headless UI 组件示例
│   ├── stores/             # Pinia stores
│   │   ├── index.ts       # Pinia 实例配置
│   │   └── counter.ts     # 计数器 store
│   ├── App.vue            # 根组件
│   ├── main.ts            # 应用入口
│   ├── style.css          # Tailwind CSS 配置
│   └── vite-env.d.ts      # TypeScript 类型声明
├── public/                 # 静态资源
├── tailwind.config.js     # Tailwind CSS 配置
├── postcss.config.js      # PostCSS 配置
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
└── package.json           # 项目依赖
```

## 💡 开发建议

### 1. 创建新组件

```bash
# 在 src/components/ 目录下创建新的 .vue 文件
touch src/components/MyComponent.vue
```

### 2. 创建新的 Store

```bash
# 在 src/stores/ 目录下创建新的 TypeScript 文件
touch src/stores/myStore.ts
```

### 3. 添加新的路由（可选）

如需路由功能，可安装 Vue Router：

```bash
npm install vue-router@4
```

### 4. 自定义 Tailwind 主题

编辑 `tailwind.config.js`:

```javascript
export default {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
      },
    },
  },
}
```

## 🔧 常见问题

### Q: 如何添加新的依赖？

```bash
npm install package-name
```

### Q: 如何使用环境变量？

创建 `.env` 文件：

```
VITE_API_URL=https://api.example.com
```

在代码中使用：

```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

### Q: 如何配置代理？

编辑 `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
```

## 📖 更多资源

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vite 官方文档](https://cn.vitejs.dev/)
- [Tailwind CSS 官方文档](https://tailwindcss.com/)
- [Headless UI 官方文档](https://headlessui.com/)
- [Pinia 官方文档](https://pinia.vuejs.org/zh/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

