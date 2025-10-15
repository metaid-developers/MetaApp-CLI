# 🎯 组件定位功能演示

## 快速测试组件检查器

### 第一步：启动项目

```bash
# 确保使用 Node.js 20.19.1
nvm use 20.19.1

# 启动开发服务器
./dev.sh
```

应该看到：
```
VITE v7.1.9  ready in 467 ms
➜  Local:   http://localhost:5173/
➜  Vue DevTools: http://localhost:5173/__devtools__/
```

### 第二步：在浏览器中测试

**打开应用：** http://localhost:5173

### 测试 1：组件检查器（最快）

1. **按住** `Option(⌥)` 键（Mac）或 `Alt` 键（Windows）
2. **鼠标移到页面任意位置**
   - 移到 "Vue 3 技术栈演示" 标题 → 显示 `App.vue`
   - 移到计数器数字 → 显示 `Counter.vue`
   - 移到下拉菜单 → 显示 `MenuExample.vue`
3. **点击任意组件** → 自动在 VSCode 中打开对应文件！

### 测试 2：内置 Vue DevTools

1. **访问：** http://localhost:5173/__devtools__/
2. **或按快捷键：** `Option + Shift + D`
3. **查看组件树**
   ```
   App
   ├── Counter         ← 点击查看详情
   └── MenuExample     ← 文件路径会显示在右侧
   ```
4. **点击 "Open in Editor"** → 跳转到 VSCode

### 测试 3：浏览器 Vue 扩展（如果已安装）

1. **F12** 打开开发者工具
2. **切换到 "Vue" 标签**
3. **选择任意组件**
4. **右侧显示：**
   ```
   Component: Counter
   File: src/components/Counter.vue
   Setup:
     count: 0
     doubleCount: 0
     increment: function
     decrement: function
   ```
5. **点击文件路径** → 可能跳转到 Sources 面板

### 测试 4：Elements + Sources 联动

1. **右键点击页面元素** → **检查**
2. **在 Elements 面板中选中元素**
3. **右键** → **"Reveal in Sources panel"**
4. **自动跳转到源代码**，显示具体行号

## 🎓 快捷键总结

| 操作 | Mac 快捷键 | Windows 快捷键 |
|------|-----------|---------------|
| 组件检查器（点击定位） | `Option + Click` | `Alt + Click` |
| 切换 DevTools 面板 | `Option + Shift + D` | `Alt + Shift + D` |
| 打开浏览器开发者工具 | `Cmd + Option + I` | `F12` 或 `Ctrl + Shift + I` |
| 检查元素 | `Cmd + Option + C` | `Ctrl + Shift + C` |
| VSCode 命令面板 | `Cmd + Shift + P` | `Ctrl + Shift + P` |

## 📸 预期效果

### 1. 组件检查器激活时

页面上会出现**半透明的蓝色高亮框**，框的上方显示：
```
Component: Counter
File: src/components/Counter.vue
```

### 2. DevTools 组件详情

```
┌─────────────────────────────────┐
│ Counter                         │
├─────────────────────────────────┤
│ 📁 src/components/Counter.vue   │ ← 这里！
│                                  │
│ Props: {}                        │
│                                  │
│ Setup:                           │
│   count: 0                       │
│   doubleCount: 0                 │
│   increment: ƒ                   │
│   decrement: ƒ                   │
│                                  │
│ [Open in Editor] 🔗             │ ← 点击跳转
└─────────────────────────────────┘
```

### 3. Sources 面板源代码

```
src/components/Counter.vue

1  <script setup lang="ts">              ← 可以设置断点
2  import { useCounterStore } from '../stores/counter'
3  
4  const counterStore = useCounterStore()
5  </script>
...
```

## ✅ 验证配置

运行以下命令检查配置：

```bash
# 查看 Vite 配置
cat vite.config.ts | grep -A 10 "vue("

# 应该看到：
# vue({
#   script: {
#     defineModel: true,
#     propsDestructure: true,
#   },
#   template: {
#     compilerOptions: {
#       comments: true,
#     },
#   },
# }),
```

## 🎊 开始体验

一切就绪！现在：

```bash
./dev.sh
```

然后在浏览器中按住 `Option/Alt` 键，点击任意组件，就能看到神奇的效果了！🎉

