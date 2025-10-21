# MetaID Demo App

一个基于 Vue 3 + Metalet Wallet 的完整 Web3 DApp 应用，包含登录/注册流程和企业级功能。

## 🚀 快速开始

### 前置要求

- Node.js >= 20.19.1
- npm >= 10.0.0

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd metaid-demo-app
   ```

2. **环境设置** ⚠️ **重要：必须先执行此步骤**
   ```bash
   npm run setup
   ```
   
   此命令会：
   - 检查 Node.js 版本是否符合要求
   - 自动安装 nvm（如果未安装）
   - 安装并切换到正确的 Node.js 版本
   - 创建 `.nvmrc` 文件

3. **安装依赖**
   ```bash
   npm install
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**
   
   打开浏览器访问 `http://localhost:5173`

## 📦 构建和部署

### 构建生产版本
```bash
npm run build
```

构建完成后，静态文件将生成在 `dist/` 目录中。

### 预览生产构建
```bash
npm run preview
```

## 🛠️ 可用脚本

| 命令 | 描述 |
|------|------|
| `npm run setup` | 🔧 环境设置（安装正确的 Node.js 版本） |
| `npm run dev` | 🚀 启动开发服务器 |
| `npm run build` | 📦 构建生产版本 |
| `npm run preview` | 👀 预览生产构建 |
| `npm run preinstall` | ✅ 检查 Node.js 版本 |

## 🏗️ 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **UI 组件**: Headless UI
- **样式**: Tailwind CSS + SCSS
- **钱包集成**: Metalet Wallet
- **区块链**: MetaID Protocol
- **工具库**: VueUse, Axios, Crypto-JS

## 📁 项目结构

```
src/
├── components/          # 可复用组件
│   ├── ConnectWalletModal/
│   ├── Dialog/
│   ├── FeeModal/
│   ├── Image/
│   ├── LoginUserOperate/
│   ├── ProfileEditModal/
│   ├── Toast/
│   ├── UploadFile/
│   └── UserAvatar/
├── stores/              # Pinia 状态管理
├── api/                 # API 接口
├── utils/               # 工具函数
├── hooks/               # 组合式函数
├── types/               # TypeScript 类型定义
└── assets/              # 静态资源
```

## 🔧 环境配置

### 动态配置系统

项目支持通过修改 `public/app-config.json` 文件来动态调整应用行为，无需重新打包：

```json
{
  "app": {
    "name": "MetaID Demo App",
    "version": "2.0.0",
    "environment": "production",
    "debug": false
  },
  "api": {
   
    "timeout": 10000,
    "retryAttempts": 3
  },
  "features": {
    "enableUpload": true,
    "enableProfileEdit": true,
    "enableNotifications": true,
    "enableAnalytics": false
  },
  "ui": {
    "theme": "light",
    "language": "zh-CN",
    "showWelcomeMessage": true,
    "maxFileSize": "10MB"
  }
}
```

### 配置使用方式

在组件中使用配置：

```vue
<script setup>
import { useConfig } from '@/hooks/use-config';

const { 
  config, 
  isFeatureEnabled, 
  apiBaseUrl,
  isDebugMode 
} = useConfig();

// 检查功能是否启用
if (isFeatureEnabled('enableUpload').value) {
  // 显示上传功能
}

// 获取API基础URL
const apiUrl = apiBaseUrl.value;
</script>
```

### 配置热更新

修改 `public/app-config.json` 后，刷新页面即可生效，无需重新打包。

## 🐛 故障排除

### Node.js 版本问题

如果遇到 Node.js 版本不兼容的问题：

1. 确保已执行 `npm run setup`
2. 如果问题持续，手动安装 nvm：
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```
3. 重新打开终端并运行：
   ```bash
   nvm install 20.19.1
   nvm use 20.19.1
   ```

### 依赖安装问题

如果 `npm install` 失败：

1. 清除缓存：
   ```bash
   npm cache clean --force
   ```
2. 删除 `node_modules` 和 `package-lock.json`：
   ```bash
   rm -rf node_modules package-lock.json
   ```
3. 重新安装：
   ```bash
   npm install
   ```



## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

## ⚠️ 重要提醒

**请务必先执行 `npm run setup` 再进行其他操作！**

这个命令会确保您的开发环境配置正确，避免版本兼容性问题。
