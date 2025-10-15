# 项目架构文档

## 🏗️ 架构概述

本项目采用分层架构设计，参考 [IDChat 项目](https://github.com/lgs18928191781/idchat) 的最佳实践，实现了清晰的模块化结构。

## 📊 架构分层

```
┌─────────────────────────────────────────┐
│           UI Layer (组件层)              │
│  ConnectWallet.vue, ConnectWalletModal  │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         Service Layer (服务层)          │
│      walletConnect.ts (核心逻辑)        │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│          Store Layer (状态层)           │
│      wallet.ts, user.ts (Pinia)         │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│          API Layer (接口层)             │
│         user.ts (HTTP 请求)             │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│        Utilities (工具层)               │
│    storage.ts, format.ts (辅助函数)     │
└─────────────────────────────────────────┘
```

## 📁 文件结构

```
src/
├── components/                    # UI 组件层
│   ├── ConnectWallet.vue         # 顶部钱包按钮
│   └── ConnectWalletModal.vue    # 登录注册弹窗
│
├── services/                      # 服务层（业务逻辑）
│   └── walletConnect.ts          # 👈 核心连接逻辑
│       ├── connectMetalet()      # 主要连接方法
│       ├── disconnectWallet()    # 断开连接
│       └── signLoginMessage()    # 签名验证
│
├── stores/                        # 状态管理层
│   ├── wallet.ts                 # 钱包状态
│   │   ├── account              # 账户信息
│   │   ├── balance              # 余额信息
│   │   ├── connect()            # 连接钱包（不含登录）
│   │   ├── disconnect()         # 断开钱包
│   │   └── waitForMetalet()     # 异步检测
│   │
│   └── user.ts                   # 用户状态
│       ├── userInfo             # 用户信息
│       ├── accessToken          # 访问令牌
│       ├── loginWithWallet()    # 钱包登录
│       ├── register()           # 注册
│       ├── logout()             # 退出（清空 localStorage）
│       └── init()               # 初始化（恢复状态）
│
├── api/                           # API 接口层
│   └── user.ts                   # 用户 API
│       ├── checkUserExists()    # 检查用户是否存在
│       ├── loginUser()          # 登录 API
│       ├── registerUser()       # 注册 API
│       ├── getUserInfo()        # 获取用户信息
│       └── updateUserProfile()  # 更新用户信息
│
├── utils/                         # 工具层
│   ├── storage.ts                # localStorage 工具
│   │   ├── getStorage()
│   │   ├── setStorage()
│   │   ├── removeStorage()
│   │   └── clearAllStorage()
│   │
│   └── format.ts                 # 格式化工具
│       ├── formatAddress()
│       ├── formatBalance()
│       ├── formatTimeAgo()
│       └── copyToClipboard()
│
└── types/                         # 类型定义层
    └── metalet.d.ts              # Metalet 钱包类型

public/
├── agreement.html                 # 用户协议
└── privacy.html                   # 隐私政策
```

## 🔄 数据流向

### 1. 连接钱包流程

```
[用户点击连接]
    ↓
ConnectWalletModal.vue
    ↓
connectMetalet() 方法
    ↓
services/walletConnect.ts
    ├─→ walletStore.waitForMetalet()  (检测)
    ├─→ walletStore.connect()         (连接)
    ├─→ api/checkUserExists()         (检查)
    ├─→ api/registerUser()            (注册/登录)
    └─→ userStore.saveToStorage()     (保存)
    ↓
localStorage + Store 状态更新
    ↓
UI 自动更新
```

### 2. 状态恢复流程

```
[页面刷新]
    ↓
App.vue: walletStore.init()
    ↓
userStore.init()
    ├─→ utils/storage.getStorage()
    └─→ 恢复 userInfo + accessToken
    ↓
walletStore.init()
    ├─→ waitForMetalet()
    ├─→ getAddress()
    └─→ 验证地址匹配
    ↓
地址匹配 → 保持登录
地址不匹配 → userStore.logout()
```

### 3. 退出登录流程

```
[用户点击断开]
    ↓
walletStore.disconnect()
    ↓
userStore.logout()
    ├─→ 清空状态
    └─→ utils/storage.clearStorage()
    ↓
localStorage 清空
    ↓
UI 更新为未登录状态
```

## 🎯 核心方法：connectMetalet

### 方法签名

```typescript
export async function connectMetalet(
  callbacks?: ConnectCallbacks
): Promise<ConnectResult>
```

### 参数：ConnectCallbacks

```typescript
interface ConnectCallbacks {
  onStepChange?: (step: ConnectStep) => void      // 步骤变化
  onProgress?: (message: string) => void          // 进度消息
  onError?: (error: string) => void               // 错误信息
  onSuccess?: (account, isNewUser) => void        // 成功回调
}
```

### 返回值：ConnectResult

```typescript
interface ConnectResult {
  success: boolean        // 是否成功
  isNewUser: boolean      // 是否新用户
  account?: MetaletAccount // 钱包账户
  error?: string          // 错误信息
  step?: ConnectStep      // 当前步骤
}
```

### 步骤枚举：ConnectStep

```typescript
type ConnectStep = 
  | 'detecting'      // 检测钱包
  | 'connecting'     // 连接钱包
  | 'checking'       // 检查用户
  | 'registering'    // 注册新用户
  | 'logging-in'     // 登录老用户
  | 'success'        // 成功
  | 'error'          // 错误
```

## 💡 使用示例

### 1. 在组件中使用

```vue
<script setup lang="ts">
import { connectMetalet } from '@/services/walletConnect'

const handleConnect = async () => {
  const result = await connectMetalet({
    onStepChange: (step) => {
      console.log('当前步骤:', step)
    },
    onProgress: (message) => {
      console.log('进度:', message)
    },
    onError: (error) => {
      alert(error)
    },
    onSuccess: (account, isNewUser) => {
      console.log('成功!', isNewUser ? '新用户' : '老用户')
    },
  })

  if (result.success) {
    console.log('连接成功!')
  }
}
</script>
```

### 2. 使用 Modal 组件

```vue
<script setup>
import { ref } from 'vue'
import ConnectWalletModal from '@/components/ConnectWalletModal.vue'

const showModal = ref(false)

const handleSuccess = (isNewUser: boolean) => {
  console.log(isNewUser ? '欢迎新用户!' : '欢迎回来!')
}
</script>

<template>
  <button @click="showModal = true">登录</button>
  
  <ConnectWalletModal 
    v-model="showModal" 
    @success="handleSuccess"
  />
</template>
```

## 🔧 模块职责

### 1. Service Layer (服务层)

**职责：**
- 实现核心业务逻辑
- 协调多个 Store 和 API
- 处理复杂的流程控制
- 提供统一的错误处理

**示例：walletConnect.ts**
```typescript
// ✅ 好的实践：服务层协调多个模块
export async function connectMetalet() {
  // 1. 调用 walletStore 检测和连接
  await walletStore.waitForMetalet()
  await walletStore.connect()
  
  // 2. 调用 API 层查询用户
  const { isNewUser } = await checkUserExists(address)
  
  // 3. 调用 API 层注册/登录
  if (isNewUser) {
    await registerUser(account)
  } else {
    await loginUser(account)
  }
  
  // 4. 更新 userStore 状态
  userStore.userInfo = user
  userStore.saveToStorage()
}
```

### 2. Store Layer (状态层)

**职责：**
- 管理应用状态（响应式）
- 提供状态的 getter 和 setter
- 处理 localStorage 持久化
- 不包含复杂业务逻辑

**示例：user.ts**
```typescript
// ✅ 好的实践：Store 只管理状态
export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const accessToken = ref<string | null>(null)
  
  const saveToStorage = () => {
    localStorage.setItem('user', JSON.stringify(userInfo.value))
  }
  
  return { userInfo, accessToken, saveToStorage }
})
```

### 3. API Layer (接口层)

**职责：**
- 封装 HTTP 请求
- 处理请求/响应格式
- 错误处理和重试逻辑
- 不包含业务逻辑

**示例：user.ts**
```typescript
// ✅ 好的实践：API 层只负责请求
export async function loginUser(account: MetaletAccount) {
  const response = await fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: account.address }),
  })
  
  return response.json()
}
```

### 4. Utils Layer (工具层)

**职责：**
- 提供通用工具函数
- 无状态、纯函数
- 可复用、可测试

**示例：format.ts**
```typescript
// ✅ 好的实践：工具函数纯粹
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
```

## 📐 设计原则

### 1. 单一职责原则 (SRP)

每个模块只负责一件事：

- ✅ `walletConnect.ts` - 只负责钱包连接流程
- ✅ `user.ts` (API) - 只负责用户 API 请求
- ✅ `user.ts` (Store) - 只负责用户状态管理

### 2. 依赖倒置原则 (DIP)

高层模块不依赖低层模块，都依赖抽象：

```typescript
// ✅ 好的实践：服务层依赖接口
import type { ApiResponse } from '@/api/user'

async function connectMetalet(): Promise<ConnectResult> {
  const result: ApiResponse = await checkUserExists(address)
  // ...
}
```

### 3. 开闭原则 (OCP)

对扩展开放，对修改关闭：

```typescript
// ✅ 好的实践：使用回调扩展功能
connectMetalet({
  onStepChange: (step) => {
    // 自定义步骤处理
  },
  onSuccess: (account, isNewUser) => {
    // 自定义成功处理
  },
})
```

### 4. 接口隔离原则 (ISP)

客户端不应该依赖它不需要的接口：

```typescript
// ✅ 好的实践：回调都是可选的
interface ConnectCallbacks {
  onStepChange?: (step: ConnectStep) => void  // 可选
  onProgress?: (message: string) => void      // 可选
  onError?: (error: string) => void           // 可选
  onSuccess?: (account, isNewUser) => void    // 可选
}
```

## 🔍 关键流程分析

### connectMetalet() 详细流程

```typescript
/**
 * ========== 步骤 1：检测钱包 ==========
 */
callbacks?.onStepChange?.('detecting')
callbacks?.onProgress?.('正在检测 Metalet 钱包...')

const isAvailable = await walletStore.waitForMetalet(20, 300)

if (!isAvailable) {
  // 打开安装页面
  window.open('chrome扩展链接', '_blank')
  return { success: false, error: '未检测到钱包' }
}

/**
 * ========== 步骤 2：连接钱包 ==========
 */
callbacks?.onStepChange?.('connecting')
callbacks?.onProgress?.('正在连接钱包，请在 Metalet 中确认...')

const connectSuccess = await walletStore.connect()

if (!connectSuccess) {
  return { success: false, error: '钱包连接失败' }
}

/**
 * ========== 步骤 3：检查用户 ==========
 */
callbacks?.onStepChange?.('checking')
callbacks?.onProgress?.('正在检查用户信息...')

const { isNewUser } = await checkUserExists(account.address)

/**
 * ========== 步骤 4：注册或登录 ==========
 */
if (isNewUser) {
  // 新用户
  callbacks?.onStepChange?.('registering')
  const registerResult = await registerUser(account)
  
  userStore.userInfo = registerResult.data.user
  userStore.accessToken = registerResult.data.token
  userStore.saveToStorage()
} else {
  // 老用户
  callbacks?.onStepChange?.('logging-in')
  const loginResult = await loginUser(account)
  
  userStore.userInfo = loginResult.data.user
  userStore.accessToken = loginResult.data.token
  userStore.saveToStorage()
}

/**
 * ========== 步骤 5：完成 ==========
 */
callbacks?.onStepChange?.('success')
callbacks?.onSuccess?.(account, isNewUser)

return { success: true, isNewUser, account }
```

## 🎨 组件交互图

```
ConnectWallet.vue (顶部按钮)
    │
    │ [点击 "Connect Wallet"]
    │
    ▼
showModal = true
    │
    ▼
ConnectWalletModal.vue (弹窗)
    │
    │ [用户勾选协议]
    │ [点击 "Metalet 钱包"]
    │
    ▼
connectMetalet() 方法
    │
    ▼
services/walletConnect.ts
    │
    ├──→ walletStore.waitForMetalet()
    ├──→ walletStore.connect()
    ├──→ api/checkUserExists()
    ├──→ api/registerUser() 或 loginUser()
    └──→ userStore.saveToStorage()
    │
    ▼
[回调通知组件]
    ├─→ onStepChange (更新 UI 状态)
    ├─→ onProgress (显示进度消息)
    ├─→ onError (显示错误)
    └─→ onSuccess (关闭弹窗)
```

## 📦 模块依赖关系

```
ConnectWalletModal
    │
    ├─→ walletConnect (service)
    │       │
    │       ├─→ walletStore
    │       │       └─→ Metalet API
    │       │
    │       ├─→ userStore
    │       │       └─→ storage utils
    │       │
    │       └─→ user API
    │               └─→ fetch / axios
    │
    ├─→ walletStore (直接用于显示)
    └─→ userStore (直接用于显示)
```

## 🛡️ 错误处理策略

### 分层错误处理

```typescript
// 1. API 层 - 捕获网络错误
export async function loginUser(account) {
  try {
    const response = await fetch('/api/login', {...})
    return await response.json()
  } catch (error) {
    console.error('API 错误:', error)
    return { success: false, message: '网络错误' }
  }
}

// 2. Service 层 - 处理业务错误
export async function connectMetalet(callbacks) {
  try {
    const result = await loginUser(account)
    
    if (!result.success) {
      callbacks?.onError?.(result.message)
      return { success: false, error: result.message }
    }
    
    return { success: true }
  } catch (error) {
    callbacks?.onError?.('连接失败')
    return { success: false, error: '连接失败' }
  }
}

// 3. Component 层 - UI 错误显示
const connectWallet = async () => {
  const result = await connectMetalet({
    onError: (error) => {
      errorMessage.value = error  // 显示在 UI
    }
  })
  
  if (!result.success) {
    // 可以添加额外的 UI 处理
  }
}
```

## 📊 状态管理图

```
┌─────────────────────────────────────┐
│        Wallet Store                 │
│  ┌─────────────────────────────┐   │
│  │ account: MetaletAccount     │   │
│  │ balance: BalanceInfo        │   │
│  │ isConnecting: boolean       │   │
│  │ error: string | null        │   │
│  └─────────────────────────────┘   │
│                                     │
│  Methods:                           │
│  - waitForMetalet()                 │
│  - connect()                        │
│  - disconnect()                     │
│  - fetchBalance()                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         User Store                  │
│  ┌─────────────────────────────┐   │
│  │ userInfo: UserInfo          │   │
│  │ accessToken: string         │   │
│  │ isLoggingIn: boolean        │   │
│  │ loginError: string          │   │
│  └─────────────────────────────┘   │
│                                     │
│  Methods:                           │
│  - loginWithWallet()                │
│  - register()                       │
│  - logout()                         │
│  - saveToStorage()                  │
│  - init()                           │
└─────────────────────────────────────┘
```

## 🎓 最佳实践

### 1. 回调模式

使用回调解耦 UI 和业务逻辑：

```typescript
// ✅ 好
const result = await connectMetalet({
  onStepChange: (step) => updateUI(step),
  onError: (error) => showError(error),
})

// ❌ 避免
const result = await connectMetalet()
if (result.step === 'connecting') {
  updateUI('connecting')
}
```

### 2. 类型安全

使用 TypeScript 确保类型安全：

```typescript
// ✅ 好
interface ConnectResult {
  success: boolean
  isNewUser: boolean
  error?: string
}

const result: ConnectResult = await connectMetalet()

// ❌ 避免
const result: any = await connectMetalet()
```

### 3. 错误优先返回

```typescript
// ✅ 好
if (!isAvailable) {
  return { success: false, error: '未检测到钱包' }
}

// 继续正常流程
const account = await connect()

// ❌ 避免深层嵌套
if (isAvailable) {
  const account = await connect()
  if (account) {
    // 很多层嵌套...
  }
}
```

### 4. 日志分级

```typescript
// ✅ 好：清晰的日志等级
console.log('🔍 [步骤 1/5] 开始检测钱包')    // 信息
console.log('✅ [步骤 1/5] 检测成功')         // 成功
console.error('❌ [步骤 1/5] 检测失败')       // 错误

// ❌ 避免
console.log('检测钱包')  // 不清晰
```

## 🔄 扩展指南

### 添加新的钱包支持

```typescript
// 1. 在 services/walletConnect.ts 添加新方法
export async function connectMetaMask(callbacks) {
  // 类似 connectMetalet 的实现
}

// 2. 在 ConnectWalletModal.vue 添加选项
<button @click="connectMetaMask">
  MetaMask 钱包
</button>

// 3. 在 stores/wallet.ts 添加 MetaMask 支持
const connectMetaMask = async () => {
  // MetaMask 连接逻辑
}
```

### 添加新的登录方式

```typescript
// 1. 在 api/user.ts 添加新 API
export async function loginWithEmail(email, password) {
  // 邮箱登录 API
}

// 2. 在 services/ 添加新服务
export async function loginWithEmailService(email, password) {
  // 邮箱登录业务逻辑
}

// 3. 在组件中使用
const handleEmailLogin = async () => {
  await loginWithEmailService(email.value, password.value)
}
```

## 📚 相关文档

- [登录注册流程](./LOGIN_FLOW.md)
- [用户系统文档](./USER_SYSTEM.md)
- [钱包集成指南](./METALET_INTEGRATION.md)
- [API 文档](./API_DOCS.md) (待创建)

## 🎉 总结

### 架构优势

✅ **模块化清晰** - 每个文件职责明确  
✅ **易于维护** - 修改一处不影响其他模块  
✅ **易于测试** - 每个函数可独立测试  
✅ **易于扩展** - 添加新功能不需要大改  
✅ **类型安全** - TypeScript 完整支持  
✅ **可复用** - 服务层可在多个组件中使用  

### 核心文件

| 文件 | 职责 | 关键方法 |
|------|------|---------|
| `services/walletConnect.ts` | 核心业务逻辑 | `connectMetalet()` |
| `api/user.ts` | 用户 API | `checkUserExists()`, `loginUser()`, `registerUser()` |
| `stores/wallet.ts` | 钱包状态 | `connect()`, `waitForMetalet()` |
| `stores/user.ts` | 用户状态 | `saveToStorage()`, `logout()` |
| `utils/storage.ts` | 存储工具 | `getStorage()`, `setStorage()` |

---

**参考 IDChat 项目的架构，打造企业级 Web3 应用！** 🚀

