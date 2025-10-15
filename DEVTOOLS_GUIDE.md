# Vue DevTools 使用指南

## 🎯 快速定位到代码位置

项目已配置 **组件检查器（Component Inspector）**，可以快速从页面跳转到代码！

### 方法 1：在页面上直接点击组件（推荐）⭐

**操作步骤：**

1. **启动开发服务器**
   ```bash
   ./dev.sh
   # 或
   npm run dev
   ```

2. **在浏览器中访问应用**
   ```
   http://localhost:5173
   ```

3. **按住快捷键 + 点击页面元素**
   
   **Mac**: `Option(⌥)` + 鼠标点击  
   **Windows/Linux**: `Alt` + 鼠标点击

4. **自动跳转到编辑器**
   - 会自动在 VSCode（或您的默认编辑器）中打开对应的 `.vue` 文件
   - 光标会定位到组件定义的具体位置

### 方法 2：在 Vue DevTools 中操作

1. **打开 Vue DevTools**
   ```
   http://localhost:5173/__devtools__/
   ```

2. **在组件树中选择组件**
   - 左侧会显示组件树
   - 点击任意组件

3. **点击 "Open in Editor" 按钮**
   - 在组件详情面板中找到 "Open in Editor" 图标
   - 点击后会在编辑器中打开该组件

### 方法 3：使用快捷键切换检查器

在应用页面中：
- **Mac**: `Option(⌥) + Shift(⇧) + D`
- **Windows/Linux**: `Alt + Shift + D`

这会打开浮动的 DevTools 面板，然后可以点击组件跳转。

## 🎨 视觉提示

当组件检查器激活时（按住 Option/Alt 键时）：
- ✨ 鼠标悬停的组件会高亮显示
- 📍 会显示组件的名称和位置信息
- 🎯 点击后立即跳转到代码

## 🛠️ 编辑器支持

自动支持以下编辑器：
- ✅ **Visual Studio Code** (code)
- ✅ **VSCode Insiders** (code-insiders)
- ✅ **WebStorm** (webstorm)
- ✅ **IntelliJ IDEA** (idea)
- ✅ **PhpStorm** (phpstorm)
- ✅ **Sublime Text** (subl)
- ✅ **Atom** (atom)
- ✅ **Vim** (vim)

### 手动指定编辑器

如果自动检测失败，可以在 `vite.config.ts` 中手动指定：

```typescript
VueDevTools({
  componentInspector: true,
  launchEditor: 'code', // 指定编辑器命令
})
```

常用编辑器命令：
- VSCode: `'code'`
- WebStorm: `'webstorm'`
- Sublime: `'subl'`

## 📚 完整功能列表

### 1. 组件检查器
- ✅ Alt/Option + Click 快速定位
- ✅ 鼠标悬停组件高亮
- ✅ 显示组件信息

### 2. DevTools 面板
- ✅ 组件树浏览
- ✅ Props 查看和编辑
- ✅ Data 实时更新
- ✅ Computed 值监控
- ✅ 事件监听

### 3. Pinia 状态管理
- ✅ Store 树状显示
- ✅ State 实时查看
- ✅ Actions 执行历史
- ✅ 时间旅行调试

### 4. 性能分析
- ✅ 组件渲染时间
- ✅ 性能瓶颈识别
- ✅ Timeline 事件追踪

## 🎯 实战示例

### 场景 1：调试计数器组件

1. 访问 `http://localhost:5173`
2. 按住 `Option/Alt` 键
3. 点击页面上的 "计数器" 组件
4. 自动跳转到 `src/components/Counter.vue`

### 场景 2：查看 Pinia Store 状态

1. 打开 DevTools: `http://localhost:5173/__devtools__/`
2. 点击 "Pinia" 标签
3. 查看 `counter` store 的状态
4. 点击 state 值可以编辑
5. 点击 "Open in Editor" 跳转到 `src/stores/counter.ts`

### 场景 3：定位菜单组件

1. 在应用页面按住 `Option/Alt`
2. 悬停在下拉菜单上（会显示 "MenuExample"）
3. 点击菜单
4. 自动打开 `src/components/MenuExample.vue`

## 🐛 故障排除

### Q: 点击组件没有跳转到编辑器？

**A:** 确保：
1. ✅ VSCode 已安装 `code` 命令行工具
   - 打开 VSCode
   - 按 `Cmd/Ctrl + Shift + P`
   - 输入 "Shell Command: Install 'code' command in PATH"
   - 重启终端

2. ✅ 开发服务器正在运行
3. ✅ 使用的是 Node.js 20.19+

### Q: 如何验证 `code` 命令是否可用？

**A:** 在终端运行：
```bash
code --version
```

如果显示版本号，说明已正确安装。

### Q: WebStorm 用户如何配置？

**A:** 在 `vite.config.ts` 中：
```typescript
VueDevTools({
  componentInspector: true,
  launchEditor: 'webstorm',
})
```

### Q: 组件检查器不显示高亮？

**A:** 检查：
1. 刷新页面（Cmd/Ctrl + R）
2. 确认 `vite.config.ts` 中 `componentInspector: true`
3. 查看浏览器控制台是否有错误

## 💡 高级技巧

### 技巧 1：键盘导航

在 DevTools 中：
- `↑` / `↓` - 浏览组件树
- `Enter` - 展开/折叠组件
- `Cmd/Ctrl + F` - 搜索组件

### 技巧 2：过滤组件

在组件树顶部的搜索框中：
- 输入组件名称快速定位
- 支持模糊搜索

### 技巧 3：多窗口调试

1. 主窗口：`http://localhost:5173` - 应用
2. 第二个窗口：`http://localhost:5173/__devtools__/` - DevTools
3. 并排放置，实时查看变化

### 技巧 4：使用浏览器扩展

虽然项目已内置 DevTools，但也可以安装浏览器扩展：
- [Chrome DevTools](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- [Firefox DevTools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

扩展版本可以直接集成在浏览器开发者工具中。

## 🎓 推荐工作流

1. **开发新组件时**
   ```
   编辑器 ← Alt + Click → 浏览器
   ```
   在浏览器中点击组件快速跳回编辑器修改

2. **调试状态问题**
   ```
   应用页面 + DevTools（独立窗口）并排
   ```
   左边看效果，右边看状态

3. **性能优化**
   ```
   DevTools Timeline → 识别慢组件 → Alt + Click 定位
   ```
   发现性能瓶颈后快速跳转到代码

## 📖 相关文档

- [Vue DevTools 官方文档](https://devtools.vuejs.org/)
- [Vite Plugin DevTools](https://github.com/webfansplz/vite-plugin-vue-devtools)
- [项目快速开始](./QUICKSTART.md)
- [开发注意事项](./DEVELOPMENT.md)

## 🎉 开始使用

现在就试试看！

1. 启动项目：`./dev.sh`
2. 访问：`http://localhost:5173`
3. 按住 `Option/Alt` 键
4. 点击页面上的任意组件
5. 🎯 自动跳转到代码！

享受丝滑的开发体验！✨

