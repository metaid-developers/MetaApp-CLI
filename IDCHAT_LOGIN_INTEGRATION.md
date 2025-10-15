# IDChat 登录流程集成文档

本文档说明如何使用从 IDChat 项目完整移植的登录注册流程。

## 📦 新增文件

### 1. 核心 Store

#### `src/stores/connection.ts` - 连接管理 Store
- 管理钱包连接状态
- 支持多钱包适配（目前支持 Metalet）
- 提供 `connect()`, `sync()`, `disconnect()` 方法

#### `src/stores/network.ts` - 网络管理 Store
- 管理网络状态（mainnet/testnet）
- 网络切换功能

#### 更新的 `src/stores/credentials.ts`
- 新的 `login()` 方法（调用 connectionStore.sync()）
- 完全参照 IDChat 实现

#### 更新的 `src/stores/user.ts`
- 新增 `setUserInfo(address)` 方法
- 新增 `clearUserInfo()` 方法
- 从 API 获取用户完整信息

### 2. 钱包适配器

#### `src/wallet-adapters/metalet.ts`
- Metalet 钱包的所有交互方法
- `connect()`, `disconnect()`, `getAddress()`, `signMessage()` 等
- 完全参照 IDChat 实现

### 3. API

#### `src/api/man.ts`
- `getUserInfoByAddress(address)` - 根据地址获取用户信息
- `getUserInfoByMetaId(metaid)` - 根据 MetaID 获取用户信息

### 4. 组件

#### `src/components/ConnectWalletModalNew.vue`
- 全新的连接钱包 Modal 组件
- 完全参照 IDChat 的 connectMetalet 方法
- 简洁的 UI 和完整的错误处理

## 🔄 登录流程

### 完整流程（参照 IDChat）

```
1. 用户点击"连接钱包"
   ↓
2. ConnectWalletModal.connectMetalet()
   ↓
3. connectionStore.connect('metalet')
   ├─ 调用钱包适配器连接
   ├─ 检查并切换网络
   └─ 保存连接状态
   ↓
4. credentialsStore.login()
   ├─ connectionStore.sync()
   │  ├─ 重新获取地址和公钥
   │  └─ userStore.setUserInfo(address)
   │     └─ getUserInfoByAddress(address)
   │        └─ 返回用户完整信息
   └─ credentialsStore.sign()
      ├─ 获取公钥
      ├─ 签名消息
      └─ 保存凭证
   ↓
5. 检查用户是否有 name
   ↓
6. 关闭弹窗，触发成功事件
```

### 代码示例

#### 1. 在组件中使用新的 Modal

```vue
<template>
  <div>
    <button @click="showModal = true">连接钱包</button>
    
    <!-- 使用新的 Modal 组件 -->
    <ConnectWalletModalNew 
      v-model="showModal"
      @success="handleConnectSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ConnectWalletModalNew from '@/components/ConnectWalletModalNew.vue'
import { useUserStore } from '@/stores/user'

const showModal = ref(false)
const userStore = useUserStore()

const handleConnectSuccess = (isNewUser: boolean) => {
  console.log('连接成功！')
  console.log('是否新用户:', isNewUser)
  console.log('用户信息:', userStore.userInfo)
  
  if (isNewUser) {
    // 引导新用户设置名称等信息
    console.log('新用户需要设置基本信息')
  } else {
    // 老用户直接进入应用
    console.log('欢迎回来！')
  }
}
</script>
```

#### 2. 直接使用 Store

```typescript
import { useConnectionStore } from '@/stores/connection'
import { useCredentialsStore } from '@/stores/credentials'
import { useUserStore } from '@/stores/user'

const connectionStore = useConnectionStore()
const credentialsStore = useCredentialsStore()
const userStore = useUserStore()

// 手动触发登录流程
async function login() {
  try {
    // 1. 连接钱包
    await connectionStore.connect('metalet')
    
    // 2. 登录（包含 sync 和 sign）
    const credential = await credentialsStore.login()
    
    // 3. 检查用户信息
    console.log('用户信息:', userStore.userInfo)
    console.log('凭证:', credential)
    
    return true
  } catch (error) {
    console.error('登录失败:', error)
    return false
  }
}

// 断开连接
async function logout() {
  await connectionStore.disconnect()
}
```

#### 3. 检查登录状态

```typescript
import { useConnectionStore } from '@/stores/connection'
import { useUserStore } from '@/stores/user'

const connectionStore = useConnectionStore()
const userStore = useUserStore()

// 检查是否已连接
if (connectionStore.connected) {
  console.log('已连接钱包')
  console.log('地址:', connectionStore.getAddress)
  console.log('公钥:', connectionStore.getPubKey)
}

// 检查用户是否登录
if (userStore.isLoggedIn) {
  console.log('用户已登录')
  console.log('用户信息:', userStore.userInfo)
}
```

## 🔧 配置

### 环境变量

在 `.env` 文件中配置：

```env
# MAN API 基础 URL（用户信息 API）
VITE_MAN_API=https://man-test.metaid.io/api

# 或生产环境
# VITE_MAN_API=https://man.metaid.io/api
```

### 网络配置

默认网络在 `src/stores/network.ts` 中设置，可通过环境变量或代码修改：

```typescript
import { useNetworkStore } from '@/stores/network'

const networkStore = useNetworkStore()

// 切换到测试网
networkStore.switchNetwork('testnet')

// 切换到主网
networkStore.switchNetwork('mainnet')
```

## 📝 数据结构

### 用户信息 (UserInfo)

```typescript
interface UserInfo {
  address: string
  metaid: string
  name?: string
  avatar?: string
  bio?: string
  chainName?: string
  // ... 更多字段
}
```

### 凭证 (Credential)

```typescript
interface Credential {
  publicKey: string
  signature: string
  address: string
  shareSecret?: string
  marketSig?: string
}
```

### 连接状态 (WalletConnection)

```typescript
interface WalletConnection {
  wallet: 'metalet'
  status: 'connected' | 'disconnected'
  address: string
  pubKey: string
}
```

## 🔄 与原系统的差异

### 主要变化

1. **新增 connectionStore** - 专门管理钱包连接
2. **新增 networkStore** - 管理网络状态
3. **修改 credentialsStore.login()** - 调用 connectionStore.sync()
4. **新增 userStore.setUserInfo()** - 从 API 获取用户信息
5. **新增 userStore.clearUserInfo()** - 清理用户数据
6. **新增钱包适配器** - 统一钱包交互接口

### 迁移指南

如果你想从旧的 `ConnectWalletModal` 迁移到新版本：

1. **替换组件引用**
   ```vue
   <!-- 旧版 -->
   <ConnectWalletModal v-model="showModal" />
   
   <!-- 新版 -->
   <ConnectWalletModalNew v-model="showModal" @success="handleSuccess" />
   ```

2. **更新 Store 使用**
   ```typescript
   // 旧版
   import { useWalletStore } from '@/stores/wallet'
   const walletStore = useWalletStore()
   
   // 新版（推荐同时使用）
   import { useConnectionStore } from '@/stores/connection'
   import { useWalletStore } from '@/stores/wallet'
   const connectionStore = useConnectionStore()
   const walletStore = useWalletStore() // 保留用于余额等功能
   ```

3. **更新登录逻辑**
   ```typescript
   // 旧版
   await walletStore.connect()
   await userStore.loginWithWallet(walletStore.account)
   
   // 新版
   await connectionStore.connect('metalet')
   await credentialsStore.login()
   ```

## 🧪 测试

### 手动测试步骤

1. **测试连接**
   - 打开应用
   - 点击"连接钱包"
   - 应该显示 Metalet 选项
   - 点击 Metalet，检查钱包是否弹出

2. **测试登录**
   - 连接成功后应该自动签名
   - 检查控制台日志
   - 验证用户信息是否正确加载

3. **测试断开**
   - 点击断开连接
   - 验证 Store 状态是否清空
   - 验证 localStorage 是否清空

### 调试技巧

```typescript
// 查看所有 Store 状态
import { useConnectionStore } from '@/stores/connection'
import { useCredentialsStore } from '@/stores/credentials'
import { useUserStore } from '@/stores/user'

const stores = {
  connection: useConnectionStore(),
  credentials: useCredentialsStore(),
  user: useUserStore(),
}

console.log('当前状态:', {
  connected: stores.connection.connected,
  address: stores.connection.getAddress,
  hasCredential: stores.credentials.ready,
  isLoggedIn: stores.user.isLoggedIn,
  userInfo: stores.user.userInfo,
})
```

## 📚 参考资源

- [IDChat 项目](https://github.com/lgs18928191781/idchat)
- [Metalet 钱包文档](https://docs.metalet.space/)
- [Pinia 文档](https://pinia.vuejs.org/)

## ⚠️ 注意事项

1. **API 依赖**: 确保 `VITE_MAN_API` 环境变量正确配置
2. **网络切换**: 连接时会自动检查并切换到正确的网络
3. **错误处理**: 所有异步操作都有完整的错误处理
4. **数据持久化**: 连接状态和凭证会自动保存到 localStorage
5. **清理机制**: 断开连接时会自动清理所有相关数据

## 🎯 下一步

1. 根据需要自定义 UI 样式
2. 添加更多钱包支持（如 UniSat, OKX）
3. 完善用户资料编辑功能
4. 添加更多业务逻辑

---

如有问题，请参考 IDChat 项目源码或提Issue。


