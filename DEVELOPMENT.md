# 开发注意事项

## 📦 包管理器

### 推荐使用 npm

项目使用 **npm** 作为包管理器。请避免混合使用多个包管理器。

```bash
# ✅ 推荐
npm install
npm run dev

# ❌ 不推荐（会导致锁文件冲突）
yarn install
yarn dev
```

### 为什么不使用 yarn？

混合使用 npm 和 yarn 会导致：
- 锁文件冲突 (`package-lock.json` vs `yarn.lock`)
- 依赖版本不一致
- 难以调试的问题

## 🔌 插件兼容性

### 检查版本兼容性

在添加新插件前，请检查其 peer dependencies：

```bash
# 查看插件信息
npm info <package-name> peerDependencies

# 示例
npm info vite-plugin-vue-devtools peerDependencies
```

### 当前项目版本

```json
{
  "node": "18.x",
  "vite": "5.x",
  "vue": "3.5.x"
}
```

### 常见插件兼容性

| 插件 | Vite 5.x | Vite 6.x | 说明 |
|------|----------|----------|------|
| @vitejs/plugin-vue | ✅ v5.x | ✅ v6.x | Vue 官方插件 |
| vite-plugin-vue-devtools | ❌ | ✅ v8.x | 需要 Vite 6+ |
| unplugin-vue-components | ✅ | ✅ | 自动导入组件 |
| unplugin-auto-import | ✅ | ✅ | 自动导入 API |

## 🛠️ 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器

# 构建
npm run build            # 构建生产版本
npm run preview          # 预览生产构建

# 依赖管理
npm install              # 安装所有依赖
npm install <package>    # 安装新包
npm uninstall <package>  # 卸载包
npm update               # 更新依赖

# 清理（遇到问题时）
rm -rf node_modules package-lock.json
npm install
```

## 🐛 常见问题

### 1. 启动失败 - 模块未找到

**症状：** `Cannot find module` 或 `Module not found`

**解决方案：**
```bash
rm -rf node_modules package-lock.json
npm install
```

### 2. 插件版本冲突

**症状：** `incorrect peer dependency` 警告

**解决方案：**
- 检查插件文档，确认支持的 Vite 版本
- 降级到兼容版本，或升级 Vite（需要 Node.js 20+）

### 3. SCSS 警告

**症状：** `DEPRECATION WARNING [legacy-js-api]`

**说明：** 这是 Sass 的弃用警告，不影响功能。未来版本会解决。

### 4. TypeScript 类型错误

**解决方案：**
```bash
# 重新生成类型声明
npm run build
```

## 🔍 调试技巧

### 查看详细错误信息

```bash
# 显示详细日志
npm run dev -- --debug
```

### 检查端口占用

```bash
# 查看 5173 端口是否被占用
lsof -i :5173

# 杀死进程
kill -9 <PID>
```

### 清除缓存

```bash
# Vite 缓存
rm -rf node_modules/.vite

# 构建输出
rm -rf dist
```

## 📚 推荐工具

### VS Code 扩展

1. **Vue Language Features (Volar)** - Vue 3 语言支持
2. **TypeScript Vue Plugin (Volar)** - TypeScript 支持
3. **Tailwind CSS IntelliSense** - Tailwind 自动完成
4. **ESLint** - 代码质量检查

### 浏览器扩展

1. **Vue.js devtools** - Vue 调试工具
   - [Chrome 版本](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
   - [Firefox 版本](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

## ⚠️ 注意事项

1. **不要混用包管理器** - 只使用 npm
2. **检查插件兼容性** - 特别是 Vite 插件
3. **定期更新依赖** - 但要测试后再更新
4. **提交前检查** - 确保 `npm run build` 成功
5. **保留 package-lock.json** - 提交到版本控制

## 🚀 性能优化

### 开发环境

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    host: true, // 允许局域网访问
    port: 5173,
    strictPort: false, // 端口被占用时自动切换
  },
})
```

### 生产构建

```typescript
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'pinia'],
          'ui-vendor': ['@headlessui/vue'],
        },
      },
    },
  },
})
```

## 📖 更多资源

- [Vite 文档](https://cn.vitejs.dev/)
- [Vue 3 文档](https://cn.vuejs.org/)
- [Pinia 文档](https://pinia.vuejs.org/zh/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [项目使用指南](./GUIDE.md)

