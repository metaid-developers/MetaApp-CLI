# 📚 项目文档总索引

欢迎使用 Vue 3 全栈技术演示项目！这里是所有文档的快速导航。

## 🚀 快速开始

**5 分钟入门：** [QUICKSTART.md](./QUICKSTART.md)

**一键启动：**
```bash
./dev.sh
```

## 📖 核心文档

### 基础文档

| 文档 | 用途 | 适合人群 |
|------|------|---------|
| [README.md](./README.md) | 项目总览、安装指南 | 所有人 |
| [QUICKSTART.md](./QUICKSTART.md) | 5 分钟快速入门 | 新手 |
| [GUIDE.md](./GUIDE.md) | 技术详解、完整教程 | 学习者 |

### 调试文档

| 文档 | 用途 | 重点内容 |
|------|------|---------|
| [HOW_TO_DEBUG.md](./HOW_TO_DEBUG.md) | 🌟 **在浏览器中查看代码位置** | 图文教程 |
| [BROWSER_DEBUG_GUIDE.md](./BROWSER_DEBUG_GUIDE.md) | 浏览器调试完整指南 | Elements 面板使用 |
| [DEVTOOLS_GUIDE.md](./DEVTOOLS_GUIDE.md) | Vue DevTools 详解 | DevTools 所有功能 |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | 快速参考卡 | 快捷键、命令速查 |

### 核心文档（v2.0 必读）

| 文档 | 用途 | 重点内容 |
|------|------|---------|
| [COMPLETE_GUIDE.md](./COMPLETE_GUIDE.md) | 🌟 **v2.0 完整使用指南** | 快速开始 + 功能演示 |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | 🌟 **实现总结** | 模块化实现详解 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 🌟 **架构文档** | 分层架构设计 |

### Web3 集成文档

| 文档 | 用途 | 重点内容 |
|------|------|---------|
| [LOGIN_FLOW.md](./LOGIN_FLOW.md) | 完整登录注册流程 | 企业级流程设计 |
| [USER_QUICKSTART.md](./USER_QUICKSTART.md) | 5分钟上手用户系统 | 超快速开始 |
| [METALET_QUICKSTART.md](./METALET_QUICKSTART.md) | 3分钟快速开始 | 钱包快速上手 |
| [USER_SYSTEM.md](./USER_SYSTEM.md) | 用户系统完整文档 | 登录/注册/持久化 |
| [METALET_INTEGRATION.md](./METALET_INTEGRATION.md) | Metalet 钱包集成 | API使用、功能实现 |
| [WALLET_DETECTION.md](./WALLET_DETECTION.md) | 钱包检测机制 | 异步轮询原理 |
| [WALLET_PERSISTENCE.md](./WALLET_PERSISTENCE.md) | 🆕 **钱包持久化** | 刷新页面保持连接 |
| [WALLET_TEST_GUIDE.md](./WALLET_TEST_GUIDE.md) | 功能测试 | 测试清单 |
| [ENV_CONFIG.md](./ENV_CONFIG.md) | 环境配置 | 环境变量说明 |

### 配置文档

| 文档 | 用途 | 问题解决 |
|------|------|---------|
| [VSCODE_SETUP.md](./VSCODE_SETUP.md) | VSCode `code` 命令配置 | 跳转编辑器问题 |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | 开发规范、注意事项 | 包管理器、插件兼容性 |
| [CHANGELOG.md](./CHANGELOG.md) | 版本更新历史 | 问题修复记录 |
| [UPGRADE_SUMMARY.md](./UPGRADE_SUMMARY.md) | Vite 7 升级总结 | 升级说明 |
| [FINAL_SUMMARY.md](./FINAL_SUMMARY.md) | 项目总结 | 完整功能列表 |

### 演示文档

| 文档 | 用途 |
|------|------|
| [demo.md](./demo.md) | 功能演示、测试步骤 |

## 🎯 按需求查找文档

### 我想快速开始项目
→ [QUICKSTART.md](./QUICKSTART.md)

### 我想知道如何在浏览器中看到代码位置
→ [HOW_TO_DEBUG.md](./HOW_TO_DEBUG.md) 🌟

### 我想学习如何使用 Vue DevTools
→ [DEVTOOLS_GUIDE.md](./DEVTOOLS_GUIDE.md)

### 我的 Option + Click 不能跳转到 VSCode
→ [VSCODE_SETUP.md](./VSCODE_SETUP.md)

### 我想了解所有快捷键
→ [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

### 我想知道如何添加新功能
→ [GUIDE.md](./GUIDE.md)

### 我想了解开发规范
→ [DEVELOPMENT.md](./DEVELOPMENT.md)

### 我想知道项目更新历史
→ [CHANGELOG.md](./CHANGELOG.md)

### 我遇到了启动问题
→ [DEVELOPMENT.md](./DEVELOPMENT.md) 的"常见问题"章节

## 🔧 工具脚本

| 脚本 | 用途 | 命令 |
|------|------|------|
| `dev.sh` | 智能启动脚本 | `./dev.sh` |
| `check-health.sh` | 项目健康检查 | `./check-health.sh` |
| `test-setup.sh` | 测试项目设置 | `./test-setup.sh` |

## 🎨 快速参考

### 启动项目

```bash
./dev.sh  # 自动切换 Node.js 版本并启动
```

### 访问地址

- **应用**: http://localhost:5173
- **DevTools**: http://localhost:5173/__devtools__/

### 快捷键

| 功能 | Mac | Windows |
|------|-----|---------|
| 定位组件 | `Option + Click` | `Alt + Click` |
| 切换 DevTools | `Option + Shift + D` | `Alt + Shift + D` |
| 浏览器开发者工具 | `Cmd + Option + I` | `F12` |
| 检查元素 | `Cmd + Option + C` | `Ctrl + Shift + C` |

### 常用命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览生产构建
```

## 📊 技术栈

- Vue 3.5 + TypeScript 5.9
- Vite 7.1 + Vue DevTools 8.0
- Tailwind CSS 3.4 + SCSS
- Headless UI + Pinia 3.0

## 🎓 学习路径

### 初学者

1. [QUICKSTART.md](./QUICKSTART.md) - 快速开始
2. [README.md](./README.md) - 了解项目结构
3. [GUIDE.md](./GUIDE.md) - 学习技术细节
4. [HOW_TO_DEBUG.md](./HOW_TO_DEBUG.md) - 学习调试

### 进阶开发者

1. [DEVELOPMENT.md](./DEVELOPMENT.md) - 开发规范
2. [DEVTOOLS_GUIDE.md](./DEVTOOLS_GUIDE.md) - 高级调试
3. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - 快捷操作

### 遇到问题时

1. [VSCODE_SETUP.md](./VSCODE_SETUP.md) - VSCode 配置
2. [DEVELOPMENT.md](./DEVELOPMENT.md) - 常见问题
3. [CHANGELOG.md](./CHANGELOG.md) - 已知问题和修复

## 🎯 快速操作指南

### 查看代码位置（4种方法）

详见：[HOW_TO_DEBUG.md](./HOW_TO_DEBUG.md)

**最快方式：**
```
按住 Option/Alt → 点击元素 → VSCode 打开
```

### 调试状态

详见：[DEVTOOLS_GUIDE.md](./DEVTOOLS_GUIDE.md)

**访问：**
```
http://localhost:5173/__devtools__/
或按 Option + Shift + D
```

### 创建新组件

详见：[GUIDE.md](./GUIDE.md)

**步骤：**
```bash
# 创建文件
touch src/components/MyComponent.vue

# 编写代码
# ...

# 在 App.vue 中导入使用
```

## 🎊 开始开发

一切就绪！现在开始：

```bash
./dev.sh
```

然后按住 `Option/Alt` 键，点击页面任意元素，体验丝滑的开发流程！

---

**有问题？** 查看对应的文档或搜索本索引找到答案。

**祝您开发愉快！** 🎉

