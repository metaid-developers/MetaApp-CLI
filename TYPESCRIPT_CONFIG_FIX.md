# TypeScript 配置修复文档

## 🔧 修复的问题

### 1. `@/` 路径别名找不到模块
**问题描述**: 
- TypeScript 无法识别 `@/` 路径别名
- 导入语句如 `import { xxx } from '@/stores/xxx'` 报错

**解决方案**:
在 `tsconfig.app.json` 中添加路径映射配置：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 2. 找不到命名空间 "NodeJS"
**问题描述**:
- 使用 `NodeJS.Timeout` 等 Node.js 类型时报错
- 错误信息：`找不到命名空间"NodeJS"`

**解决方案**:
在 `tsconfig.app.json` 中添加 Node.js 类型定义：

```json
{
  "compilerOptions": {
    "types": ["vite/client", "node"]
  }
}
```

## 📝 完整的 tsconfig.app.json

```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "types": ["vite/client", "node"],
    
    /* Path Mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

## 📋 配置说明

### baseUrl
- 设置为 `"."` 表示基础路径是项目根目录
- 用于解析非相对路径的模块导入

### paths
- `"@/*": ["./src/*"]` - 将 `@/` 映射到 `src/` 目录
- 允许使用 `@/stores/user` 代替 `../stores/user` 或 `../../stores/user`

### types
- `"vite/client"` - Vite 客户端类型（import.meta.env 等）
- `"node"` - Node.js 类型（NodeJS.Timeout, process, Buffer 等）

## ✅ 修复后的效果

### 路径别名可以正常使用
```typescript
// ✅ 这些导入现在都能正常工作
import { useUserStore } from '@/stores/user'
import { getUserInfoByAddress } from '@/api/man'
import { useConnectionStore } from '@/stores/connection'
import type { MetaletAccount } from '@/types/metalet'
```

### NodeJS 类型可以正常使用
```typescript
// ✅ 可以正常使用 NodeJS 命名空间
const timer = ref<NodeJS.Timeout | null>(null)
const interval: NodeJS.Timeout = setInterval(() => {}, 1000)
```

## 🔄 Vite 配置对照

`vite.config.ts` 中的别名配置（运行时使用）：
```typescript
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

`tsconfig.app.json` 中的路径映射（编译时类型检查）：
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**注意**: 这两个配置必须保持一致！

## 🎯 验证配置

### 方法 1: 重启 TypeScript 服务器
在 VSCode 中：
1. 按 `Cmd+Shift+P` (Mac) 或 `Ctrl+Shift+P` (Windows/Linux)
2. 输入 `TypeScript: Restart TS Server`
3. 回车执行

### 方法 2: 重启编辑器
直接重启 VSCode 或其他 IDE

### 方法 3: 运行类型检查
```bash
npm run build
# 或
npx vue-tsc --noEmit
```

## 📦 依赖要求

确保以下依赖已安装：

```json
{
  "devDependencies": {
    "@types/node": "^20.19.0",  // Node.js 类型定义
    "typescript": "~5.9.3",     // TypeScript 编译器
    "vue-tsc": "^3.1.0"         // Vue TypeScript 编译器
  }
}
```

如果缺少 `@types/node`，运行：
```bash
npm install -D @types/node
```

## 🚫 常见问题

### Q: 配置后仍然报错？
**A**: 尝试以下步骤：
1. 重启 TypeScript 服务器（见上方验证配置）
2. 删除 `node_modules/.tmp/` 目录
3. 运行 `npm run build` 重新生成类型缓存
4. 重启编辑器

### Q: 为什么需要同时配置 vite.config.ts 和 tsconfig.app.json？
**A**: 
- `vite.config.ts` - 运行时路径解析（开发服务器和构建）
- `tsconfig.app.json` - 编译时类型检查（IDE 和 vue-tsc）
- 两者必须保持一致才能正常工作

### Q: 可以使用其他路径别名吗？
**A**: 可以！例如：
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@stores/*": ["./src/stores/*"],
      "@utils/*": ["./src/utils/*"]
    }
  }
}
```

记得在 `vite.config.ts` 中也添加对应的别名配置。

## 📚 参考资源

- [TypeScript 路径映射文档](https://www.typescriptlang.org/tsconfig#paths)
- [Vite 路径别名配置](https://vitejs.dev/config/shared-options.html#resolve-alias)
- [@types/node 文档](https://www.npmjs.com/package/@types/node)

---

**修复日期**: 2025-01-XX
**修复的文件**: `tsconfig.app.json`
**修复的问题**: `@/` 路径别名 + NodeJS 命名空间


