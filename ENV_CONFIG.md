# 环境变量配置说明

## 📝 配置文件

创建 `.env.local` 文件（不会被 Git 追踪）：

```bash
# 复制示例配置
cp .env.example .env.local
```

## 🔧 配置项说明

### API 配置

```env
# API 基础 URL（后端服务地址）
VITE_API_BASE_URL=http://localhost:3000/api
# 生产环境：https://api.yourdomain.com/api
```

### 应用信息

```env
# 应用名称
VITE_APP_NAME=MetaID Demo App

# 应用描述
VITE_APP_DESCRIPTION=Enterprise-grade Web3 DApp
```

### Metalet 配置

```env
# Metalet 钱包下载链接
VITE_METALET_DOWNLOAD_URL=https://chromewebstore.google.com/detail/metalet/lbjapbcmmceacocpimbpbidpgmlmoaao

# 默认网络
VITE_DEFAULT_NETWORK=testnet  # 或 mainnet
```

### 检测配置

```env
# 页面初始化检测配置（15秒）
VITE_METALET_DETECT_MAX_RETRIES=50
VITE_METALET_DETECT_INTERVAL=300

# 快速检测配置（连接时，6秒）
VITE_METALET_QUICK_DETECT_MAX_RETRIES=20
VITE_METALET_QUICK_DETECT_INTERVAL=300
```

### 安全配置

```env
# Token 过期时间（天）
VITE_TOKEN_EXPIRE_DAYS=7

# 是否开启调试模式
VITE_DEBUG_MODE=true
```

## 💻 使用环境变量

### 在代码中访问

```typescript
// TypeScript 中使用
const apiUrl = import.meta.env.VITE_API_BASE_URL
const appName = import.meta.env.VITE_APP_NAME
const isDebug = import.meta.env.VITE_DEBUG_MODE === 'true'

// 示例
console.log('API URL:', apiUrl)
console.log('App Name:', appName)
```

### 类型定义

在 `src/vite-env.d.ts` 中添加类型：

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_METALET_DOWNLOAD_URL: string
  readonly VITE_AGREEMENT_URL: string
  readonly VITE_PRIVACY_URL: string
  readonly VITE_DEFAULT_NETWORK: 'mainnet' | 'testnet'
  readonly VITE_DEBUG_MODE: string
  readonly VITE_TOKEN_EXPIRE_DAYS: string
  readonly VITE_METALET_DETECT_MAX_RETRIES: string
  readonly VITE_METALET_DETECT_INTERVAL: string
  readonly VITE_METALET_QUICK_DETECT_MAX_RETRIES: string
  readonly VITE_METALET_QUICK_DETECT_INTERVAL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## 🌍 多环境配置

### 开发环境 (.env.development)

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_DEFAULT_NETWORK=testnet
VITE_DEBUG_MODE=true
```

### 生产环境 (.env.production)

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_DEFAULT_NETWORK=mainnet
VITE_DEBUG_MODE=false
```

### 测试环境 (.env.test)

```env
VITE_API_BASE_URL=https://test-api.yourdomain.com/api
VITE_DEFAULT_NETWORK=testnet
VITE_DEBUG_MODE=true
```

## 🔄 配置应用示例

### API 层使用配置

```typescript
// src/api/user.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export async function loginUser(account) {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(account),
  })
  return response.json()
}
```

### Service 层使用配置

```typescript
// src/services/walletConnect.ts
const MAX_RETRIES = Number(import.meta.env.VITE_METALET_DETECT_MAX_RETRIES) || 50
const INTERVAL = Number(import.meta.env.VITE_METALET_DETECT_INTERVAL) || 300

export async function connectMetalet() {
  const isAvailable = await walletStore.waitForMetalet(MAX_RETRIES, INTERVAL)
  // ...
}
```

### 组件层使用配置

```vue
<script setup lang="ts">
const agreementUrl = import.meta.env.VITE_AGREEMENT_URL || '/agreement.html'
const privacyUrl = import.meta.env.VITE_PRIVACY_URL || '/privacy.html'

const openAgreement = () => {
  window.open(agreementUrl, '_blank')
}

const openPrivacy = () => {
  window.open(privacyUrl, '_blank')
}
</script>
```

## 🚀 快速配置

### 最小配置（仅需 API URL）

```env
# .env.local
VITE_API_BASE_URL=http://localhost:3000/api
```

### 推荐配置

```env
# .env.local
VITE_API_BASE_URL=http://localhost:3000/api
VITE_DEFAULT_NETWORK=testnet
VITE_DEBUG_MODE=true
VITE_TOKEN_EXPIRE_DAYS=7
```

### 完整配置

参考本文档顶部的所有配置项。

## 📚 相关文档

- [架构文档](./ARCHITECTURE.md)
- [实现总结](./IMPLEMENTATION_SUMMARY.md)
- [登录流程](./LOGIN_FLOW.md)

---

**配置完成后运行 `./dev.sh` 启动项目！** 🚀

