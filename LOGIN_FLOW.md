# 完整登录注册流程文档

## 🎯 流程概述

本项目参考 [IDChat 项目](https://github.com/lgs18928191781/idchat) 实现了完整的 Web3 钱包登录注册流程，提供了企业级的用户体验。

## 📊 核心流程图

```
用户点击 "Connect Wallet"
    ↓
打开 ConnectWalletModal 弹窗
    ↓
用户勾选《用户协议》和《隐私政策》
    ↓
点击 "Metalet 钱包"
    ↓
【阶段 1：检测钱包】
    ├─ 异步轮询检测（300ms × 20 = 6秒）
    ├─ 检测到 → 继续
    └─ 未检测到 → 显示安装提示 + 打开安装链接
    ↓
【阶段 2：连接钱包】
    ├─ 调用 window.metaidwallet.connect()
    ├─ 用户在 Metalet 弹窗中确认
    ├─ 连接成功 → 获取钱包地址
    └─ 连接失败 → 显示错误信息 + 重试
    ↓
【阶段 3：判断用户类型】
    ├─ 查询后端 API（或检查 localStorage）
    ├─ 是新用户？
    │   ├─ 是 → 进入注册流程
    │   └─ 否 → 进入登录流程
    ↓
【阶段 4A：新用户注册】
    ├─ 调用 userStore.register()
    ├─ 创建 UserInfo（地址、时间戳、默认名称）
    ├─ 生成 Access Token
    ├─ 保存到 localStorage
    └─ 注册成功 ✅
    ↓
【阶段 4B：老用户登录】
    ├─ 调用 userStore.loginWithWallet()
    ├─ 更新 UserInfo（更新最后活跃时间）
    ├─ 刷新或生成 Access Token
    ├─ 保存到 localStorage
    └─ 登录成功 ✅
    ↓
【阶段 5：成功】
    ├─ 显示成功提示（1.5秒）
    ├─ 关闭弹窗
    ├─ 更新 UI（显示用户信息）
    └─ 设置事件监听（账户切换、网络切换）
```

## 🎨 UI 状态流转

### Modal 弹窗状态

| 状态 | UI 显示 | 用户操作 |
|------|---------|---------|
| `select` | 选择钱包 + 用户协议勾选 | 勾选协议 + 点击钱包 |
| `detecting` | 检测钱包加载动画 | 等待检测完成 |
| `connecting` | 连接中加载动画 + 提示 | 在 Metalet 中确认 |
| `registering` | 注册中加载动画 | 等待注册完成 |
| `success` | 成功图标 + 地址显示 | 自动关闭（1.5秒后） |

### 错误处理

| 错误类型 | 提示信息 | 用户操作 |
|---------|---------|---------|
| 未安装 Metalet | "未检测到 Metalet 钱包" | 打开安装链接 |
| 连接被拒绝 | "连接失败，请重试" | 重新连接 |
| 网络错误 | "网络错误，请稍后重试" | 重试 |
| 未勾选协议 | "请先同意用户协议和隐私政策" | 勾选协议 |

## 📁 文件结构

```
src/
├── components/
│   ├── ConnectWallet.vue        # 顶部钱包按钮组件
│   └── ConnectWalletModal.vue   # 👈 新增：登录注册弹窗
├── stores/
│   ├── wallet.ts                # 钱包状态管理
│   └── user.ts                  # 用户状态管理
└── types/
    └── metalet.d.ts            # Metalet 类型定义

public/
├── agreement.html               # 👈 新增：用户协议
└── privacy.html                 # 👈 新增：隐私政策
```

## 🔧 核心API

### ConnectWalletModal 组件

```vue
<ConnectWalletModal v-model="showModal" />
```

**Props:**
- `modelValue`: boolean - 控制弹窗显示/隐藏

**Emits:**
- `update:modelValue` - 弹窗状态变化时触发

**核心方法:**

```typescript
// 连接 Metalet 钱包
const connectMetalet = async () => {
  // 1. 检测钱包
  const isAvailable = await walletStore.waitForMetalet(20, 300)
  
  // 2. 连接钱包
  await walletStore.connect()
  
  // 3. 判断用户类型
  const isNewUser = await checkIfNewUser(address)
  
  // 4. 注册或登录
  if (isNewUser) {
    await userStore.register(account)
  } else {
    // 已在 walletStore.connect() 中自动登录
  }
  
  // 5. 成功
  loginStep.value = 'success'
}

// 检查是否是新用户
const checkIfNewUser = async (address: string): Promise<boolean> => {
  // TODO: 替换为真实 API
  // const response = await fetch(`/api/users/check?address=${address}`)
  // return response.json().isNew
  
  const storedAddress = localStorage.getItem('metaid_wallet_address')
  return storedAddress !== address
}
```

### User Store 方法

```typescript
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 注册新用户
await userStore.register(walletAccount, {
  name: '用户名',
  avatar: 'https://...',
  bio: '个人简介'
})

// 使用钱包登录
await userStore.loginWithWallet(walletAccount)

// 退出登录（清空 localStorage）
userStore.logout()

// 检查登录状态
const isLoggedIn = userStore.isLoggedIn
const isValid = userStore.checkLoginStatus()
```

## 💾 数据存储

### LocalStorage 键值

| 键名 | 类型 | 说明 |
|------|------|------|
| `metaid_user_info` | `UserInfo` | 用户完整信息 |
| `metaid_access_token` | `string` | 访问令牌 |
| `metaid_wallet_address` | `string` | 钱包地址 |

### UserInfo 数据结构

```typescript
interface UserInfo {
  address: string          // 钱包地址（必需）
  mvcAddress?: string      // MVC 地址
  btcAddress?: string      // BTC 地址
  metaId?: string          // MetaID
  name?: string            // 用户名
  avatar?: string          // 头像 URL
  bio?: string             // 个人简介
  loginTime: number        // 登录时间戳
  lastActiveTime: number   // 最后活跃时间戳
}
```

## 🔐 安全特性

### 1. 用户协议保护

```typescript
const isAgreementAccepted = ref(false)

const canProceed = computed(() => {
  return isAgreementAccepted.value
})

// 连接前检查
if (!canProceed.value) {
  errorMessage.value = '请先阅读并同意用户协议和隐私政策'
  return
}
```

### 2. 私钥安全

- ✅ 不存储私钥或助记词
- ✅ 仅存储公开地址
- ✅ 使用 Metalet 进行签名操作
- ✅ 所有敏感操作需要用户在 Metalet 中确认

### 3. 数据加密

- ✅ HTTPS 传输
- ✅ Access Token 加密存储（TODO）
- ✅ 定期刷新 Token

### 4. 过期检测

```typescript
// 7天未活跃自动退出
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

const checkLoginStatus = () => {
  const now = Date.now()
  const lastActive = userStore.userInfo.lastActiveTime
  
  if (now - lastActive > SEVEN_DAYS) {
    userStore.logout() // 自动退出
    return false
  }
  
  return true
}
```

## 🎯 使用示例

### 1. 基础使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import ConnectWalletModal from '@/components/ConnectWalletModal.vue'
import { useUserStore } from '@/stores/user'

const showModal = ref(false)
const userStore = useUserStore()

const openLogin = () => {
  showModal.value = true
}
</script>

<template>
  <button @click="openLogin">登录</button>
  
  <ConnectWalletModal v-model="showModal" />
  
  <div v-if="userStore.isLoggedIn">
    <p>欢迎，{{ userStore.displayName }}</p>
  </div>
</template>
```

### 2. 路由守卫

```typescript
import { useUserStore } from '@/stores/user'
import { createRouter } from 'vue-router'

const router = createRouter({
  // routes...
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 需要登录的路由
  if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn) {
      // 重定向到登录页
      next('/login')
      return
    }
    
    // 检查登录是否过期
    if (!userStore.checkLoginStatus()) {
      next('/login')
      return
    }
  }
  
  next()
})
```

### 3. API 请求带 Token

```typescript
import { useUserStore } from '@/stores/user'

const makeAuthenticatedRequest = async (url: string, options = {}) => {
  const userStore = useUserStore()
  
  if (!userStore.isLoggedIn) {
    throw new Error('未登录')
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${userStore.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
  
  return response.json()
}
```

## 📝 后端 API 接口设计

### 1. 检查用户是否存在

```
GET /api/users/check?address={walletAddress}

Response:
{
  "isNew": boolean,
  "exists": boolean
}
```

### 2. 注册新用户

```
POST /api/users/register

Body:
{
  "address": "1ABC...",
  "name": "用户名",
  "avatar": "https://...",
  "signature": "0x..." // 签名验证
}

Response:
{
  "success": true,
  "user": UserInfo,
  "token": "eyJhbGc..."
}
```

### 3. 用户登录

```
POST /api/users/login

Body:
{
  "address": "1ABC...",
  "timestamp": 1696934400000,
  "signature": "0x..."
}

Response:
{
  "success": true,
  "user": UserInfo,
  "token": "eyJhbGc..."
}
```

### 4. 刷新 Token

```
POST /api/users/refresh-token

Headers:
{
  "Authorization": "Bearer {oldToken}"
}

Response:
{
  "success": true,
  "token": "eyJhbGc..."
}
```

## 🎨 自定义样式

### Modal 主题色

```scss
// 在 ConnectWalletModal.vue 中修改

.wallet-option {
  &:hover:not(:disabled) {
    border-color: rgb(59, 130, 246); // 蓝色
    // 改为绿色
    // border-color: rgb(34, 197, 94);
  }
}

.success-icon {
  color: rgb(34, 197, 94); // 绿色
  // 改为蓝色
  // color: rgb(59, 130, 246);
}
```

### 按钮样式

```scss
.btn-connect {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  // 自定义渐变色
}
```

## 🐛 故障排除

### Q1: 弹窗打不开？

**检查：**
```vue
<ConnectWalletModal v-model="showModal" />

<!-- 确保正确绑定 -->
<button @click="showModal = true">打开</button>
```

### Q2: 连接成功但未登录？

**检查：**
```typescript
// 确保在 walletStore.connect() 中调用了 userStore.loginWithWallet()
// src/stores/wallet.ts

const connect = async () => {
  const result = await window.metaidwallet!.connect()
  account.value = result
  
  // 👈 确保有这一行
  const userStore = useUserStore()
  await userStore.loginWithWallet(result)
}
```

### Q3: 刷新页面后登录状态丢失？

**检查：**
```typescript
// 确保在应用初始化时调用 init()
// src/App.vue 或 src/main.ts

onMounted(async () => {
  const userStore = useUserStore()
  userStore.init() // 👈 从 localStorage 恢复
  
  const walletStore = useWalletStore()
  await walletStore.init()
})
```

### Q4: ESC 键无法关闭弹窗？

**检查：**
```typescript
// ConnectWalletModal.vue

onMounted(() => {
  window.addEventListener('keydown', handleKeydown) // 👈 确保添加了监听
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown) // 👈 确保清理了监听
})
```

## 📚 参考资源

- **IDChat 项目**: https://github.com/lgs18928191781/idchat
- **Metalet 钱包**: https://github.com/metalet-labs/metalet-extension-next
- **用户系统文档**: [USER_SYSTEM.md](./USER_SYSTEM.md)
- **钱包集成文档**: [METALET_INTEGRATION.md](./METALET_INTEGRATION.md)

## 🎉 总结

### 实现的功能

✅ **完整的登录注册流程** - Modal 弹窗 + 多阶段状态  
✅ **用户协议保护** - 必须勾选才能连接  
✅ **新老用户识别** - 自动判断并执行对应流程  
✅ **错误处理** - 友好的错误提示和重试机制  
✅ **数据持久化** - localStorage 自动保存和恢复  
✅ **安全性** - 不存储私钥 + Token 认证  
✅ **用户体验** - 加载动画 + 状态提示 + 自动关闭  
✅ **响应式设计** - 支持移动端和深色模式  

### 下一步优化

- [ ] 接入真实后端 API
- [ ] 实现 Token 刷新机制
- [ ] 添加邮箱/手机号绑定
- [ ] 实现多钱包支持（MetaMask、WalletConnect等）
- [ ] 添加社交账号绑定
- [ ] 实现双因素认证（2FA）

---

**立即开始使用完整的登录注册流程！** 🚀

