# Vue 3 + Metalet 钱包集成演示项目

这是一个集成 Metalet 钱包的 Vue 3 Web3 应用演示，展示了如何在现代前端项目中集成区块链钱包。

## 🚀 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - JavaScript 的超集，提供类型安全
- **Vite 7** - 下一代前端构建工具
- **Tailwind CSS** - 实用优先的 CSS 框架
- **SCSS** - CSS 预处理器
- **Headless UI** - 无样式、完全可访问的 UI 组件
- **Pinia** - Vue 3 官方状态管理库
- **Metalet Wallet** - 比特币钱包浏览器扩展集成

## ⚙️ 系统要求

- **Node.js**: 20.19+ 或 22.12+ （Vite 7 要求）
- **npm**: 10.0.0 或更高版本
- **推荐**: 使用 nvm 管理 Node.js 版本

## 📦 安装

```bash
npm install
```

> **⚠️ 重要提示**: 
> - 项目使用 **npm** 作为包管理器，请勿混用 yarn 或 pnpm
> - **必须使用 Node.js 20.19+ 或 22.12+**（Vite 7 要求）
> - 项目包含 `.nvmrc` 文件，使用 `nvm use` 自动切换版本
> - 集成了 **Vue DevTools**，可在浏览器中调试
> - 添加新插件前请检查版本兼容性（详见 [DEVELOPMENT.md](./DEVELOPMENT.md)）

## 🛠️ 开发

### 方式 1：使用启动脚本（推荐）

```bash
./dev.sh
```

启动脚本会自动：
- 切换到正确的 Node.js 版本（如果安装了 nvm）
- 检查版本要求
- 启动开发服务器

### 方式 2：直接启动

确保使用 Node.js 20.19+：

```bash
nvm use 20.19.1  # 如果使用 nvm
npm run dev
```

## 🏗️ 构建

```bash
npm run build
```

## 📝 项目结构

```
src/
├── components/            # Vue 组件
│   └── ConnectWallet.vue # 钱包连接组件
├── stores/               # Pinia 状态管理
│   ├── index.ts         # Pinia 实例
│   ├── wallet.ts        # 钱包状态管理
│   └── user.ts          # 👈 用户状态管理（新）
├── utils/                # 👈 工具函数（新）
│   ├── storage.ts       # localStorage 工具
│   └── format.ts        # 格式化工具
├── types/                # TypeScript 类型定义
│   └── metalet.d.ts     # Metalet 钱包类型
├── App.vue              # 根组件（钱包 + 用户 UI）
├── main.ts              # 应用入口
└── style.css            # 全局样式（Tailwind CSS）
```

## ✨ 功能特性

### Web3 钱包功能
- ✅ **Metalet 钱包集成** - 完整的钱包连接和管理
- ✅ **异步轮询检测** - 每 300ms 检测一次，最多 50 次（15秒）
- ✅ **钱包状态持久化** - 刷新页面自动恢复连接状态 🆕
- ✅ **余额数据持久化** - 保存并恢复余额信息 🆕
- ✅ **余额查看** - 实时显示 BTC 余额（已确认/未确认）
- ✅ **地址管理** - 显示和复制钱包地址
- ✅ **网络切换** - 支持主网/测试网切换
- ✅ **网络设置持久化** - 保存并恢复网络配置 🆕
- ✅ **消息签名** - 支持消息签名功能
- ✅ **事件监听** - 自动响应账户和网络变化
- ✅ **智能地址验证** - 刷新时验证地址一致性 🆕

### 用户系统功能（新增）
- ✅ **Modal 弹窗登录** - 专业的弹窗式登录注册体验
- ✅ **用户协议保护** - 必须同意协议才能连接钱包
- ✅ **多阶段状态管理** - 检测→连接→注册/登录→成功
- ✅ **新老用户识别** - 自动判断用户类型并执行对应流程
- ✅ **钱包登录** - 使用 Metalet 钱包地址登录
- ✅ **自动登录** - 连接钱包后自动登录
- ✅ **持久化存储** - 用户信息和 Token 保存到 localStorage
- ✅ **自动恢复** - 刷新页面自动恢复登录状态
- ✅ **账户切换** - 切换钱包账户自动重新登录
- ✅ **退出登录** - 清空所有 localStorage 数据
- ✅ **过期检测** - 7天未活跃自动退出登录
- ✅ **用户信息更新** - 支持更新个人资料

### 前端技术栈
- ✅ Vue 3 Composition API
- ✅ TypeScript 完整类型支持
- ✅ Tailwind CSS 响应式设计
- ✅ SCSS 样式预处理
- ✅ Headless UI 无障碍组件
- ✅ Pinia 状态管理
- ✅ 暗色模式支持
- ✅ **内置 Vue DevTools** - 无需浏览器扩展
- ✅ **组件检查器** - Option/Alt + Click 快速定位代码
- ✅ **Sourcemap 支持** - 浏览器调试时显示源代码

## 🛠️ 调试功能

### 快速定位代码位置

项目内置了强大的调试工具，可以快速从浏览器跳转到代码：

**方法 1：组件检查器（最快）**
- 按住 `Option(⌥)` 或 `Alt` 键
- 点击页面上的任意元素
- 自动在 VSCode 中打开对应的 `.vue` 文件

**方法 2：内置 DevTools**
- 访问：`http://localhost:5173/__devtools__/`
- 或按快捷键：`Option + Shift + D`
- 查看组件树和详细信息

**方法 3：浏览器 Vue 扩展**
- 安装 Vue DevTools 浏览器扩展
- F12 → Vue 标签
- 点击组件查看文件路径

**详细说明：**
- [BROWSER_DEBUG_GUIDE.md](./BROWSER_DEBUG_GUIDE.md) - 浏览器调试完整指南
- [DEVTOOLS_GUIDE.md](./DEVTOOLS_GUIDE.md) - Vue DevTools 使用指南
- [VSCODE_SETUP.md](./VSCODE_SETUP.md) - VSCode 配置指南

## 📚 学习资源

### 前端技术
- [Vue 3 文档](https://cn.vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Vite 文档](https://cn.vitejs.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Headless UI 文档](https://headlessui.com/)
- [Pinia 文档](https://pinia.vuejs.org/zh/)

### Metalet 钱包
- [Metalet GitHub](https://github.com/metalet-labs/metalet-extension-next)
- [Chrome 扩展商店](https://chromewebstore.google.com/detail/metalet/lbjapbcmmceacocpimbpbidpgmlmoaao)
- [IDChat 项目](https://www.idchat.io/chat)

### 项目文档

**核心文档（必读）：**
- [🌟 完整使用指南](./COMPLETE_GUIDE.md) - v2.0 完整指南
- [🌟 实现总结](./IMPLEMENTATION_SUMMARY.md) - 模块化实现详解
- [🌟 架构文档](./ARCHITECTURE.md) - 分层架构设计

**功能文档：**
- [登录注册流程](./LOGIN_FLOW.md) - 完整登录流程
- [用户系统文档](./USER_SYSTEM.md) - 用户系统 API
- [钱包集成指南](./METALET_INTEGRATION.md) - Metalet 集成
- [钱包检测机制](./WALLET_DETECTION.md) - 异步轮询原理

**快速开始：**
- [3分钟快速开始](./METALET_QUICKSTART.md) - 钱包快速上手
- [5分钟用户系统](./USER_QUICKSTART.md) - 用户系统快速上手

**配置文档：**
- [环境配置](./ENV_CONFIG.md) - 环境变量说明
