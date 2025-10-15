# Credentials Store 使用指南

本文档说明如何使用从 IDChat 项目移植的 `credentials` store。

## 功能概述

`credentials` store 用于管理钱包签名凭证，支持：
- 多账户凭证存储
- 自动签名消息
- 凭证缓存（localStorage）
- 登录流程集成

## 快速开始

### 1. 安装依赖

已自动安装：
```bash
npm install @vueuse/core
```

### 2. 导入使用

```typescript
import { useCredentialsStore } from '@/stores/credentials'

const credentialsStore = useCredentialsStore()
```

## API 说明

### State（状态）

- `credentials`: 凭证列表（自动持久化到 localStorage）
- `signing`: 是否正在签名中

### Getters（计算属性）

- `getByAddress(address: string)`: 根据地址获取凭证
- `has(address: string)`: 检查是否存在某个地址的凭证
- `get`: 获取当前连接钱包的凭证
- `ready`: 检查当前钱包凭证是否就绪

### Actions（方法）

#### `add(credential)`
添加凭证到存储
```typescript
credentialsStore.add({
  publicKey: 'xxx',
  signature: 'xxx',
  address: 'xxx'
})
```

#### `remove(address)`
移除指定地址的凭证
```typescript
credentialsStore.remove('1A1zP1...')
```

#### `clear()`
清空所有凭证
```typescript
credentialsStore.clear()
```

#### `update(shareSecret)`
更新共享密钥
```typescript
credentialsStore.update('secret123')
```

#### `sign()`
签名消息获取凭证（自动缓存）
```typescript
try {
  const credential = await credentialsStore.sign()
  console.log(credential)
  // { publicKey: '...', signature: '...', address: '...' }
} catch (error) {
  console.error('签名失败:', error)
}
```

#### `login()`
完整登录流程（连接钱包 → 签名 → 登录）
```typescript
try {
  const credential = await credentialsStore.login()
  console.log('登录成功:', credential)
} catch (error) {
  console.error('登录失败:', error)
}
```

## 使用示例

### 示例1：在组件中使用

```vue
<script setup lang="ts">
import { useCredentialsStore } from '@/stores/credentials'
import { useWalletStore } from '@/stores/wallet'

const credentialsStore = useCredentialsStore()
const walletStore = useWalletStore()

// 检查是否有凭证
const hasCredential = computed(() => {
  if (!walletStore.account) return false
  return credentialsStore.has(walletStore.account.address)
})

// 登录
const handleLogin = async () => {
  try {
    await credentialsStore.login()
    console.log('登录成功')
  } catch (error) {
    console.error('登录失败:', error)
  }
}

// 仅签名（不登录）
const handleSign = async () => {
  try {
    const credential = await credentialsStore.sign()
    console.log('签名成功:', credential)
  } catch (error) {
    console.error('签名失败:', error)
  }
}
</script>
```

### 示例2：检查凭证状态

```typescript
import { useCredentialsStore } from '@/stores/credentials'
import { useWalletStore } from '@/stores/wallet'

const credentialsStore = useCredentialsStore()
const walletStore = useWalletStore()

// 检查当前钱包是否有凭证
if (credentialsStore.ready) {
  console.log('凭证已就绪')
  const credential = credentialsStore.get
  console.log(credential)
}

// 获取特定地址的凭证
const address = walletStore.account?.address
if (address) {
  const credential = credentialsStore.getByAddress(address)
  if (credential) {
    console.log('找到凭证:', credential)
  }
}
```

### 示例3：自动登录流程

```typescript
import { useCredentialsStore } from '@/stores/credentials'
import { useWalletStore } from '@/stores/wallet'
import { useUserStore } from '@/stores/user'

const credentialsStore = useCredentialsStore()
const walletStore = useWalletStore()
const userStore = useUserStore()

// 应用启动时检查并自动登录
onMounted(async () => {
  // 等待钱包初始化
  await walletStore.init()
  
  // 如果钱包已连接且用户未登录
  if (walletStore.isConnected && !userStore.isLoggedIn) {
    // 如果有凭证缓存，直接登录
    if (credentialsStore.ready) {
      const credential = credentialsStore.get
      if (credential && walletStore.account) {
        await userStore.loginWithWallet(
          walletStore.account,
          credential.signature
        )
      }
    } else {
      // 否则请求签名并登录
      try {
        await credentialsStore.login()
      } catch (error) {
        console.error('自动登录失败:', error)
      }
    }
  }
})
```

## 凭证数据结构

```typescript
interface Credential {
  publicKey: string      // 公钥
  signature: string      // 签名
  address: string        // 地址
  shareSecret?: string   // 共享密钥（可选）
  marketSig?: string     // 市场签名（可选）
}
```

## 签名消息

默认签名消息定义在 `src/constants/index.ts`：

```typescript
export const SIGNING_MESSAGE = 'Welcome to MetaID Demo App!\n\nPlease sign this message to verify your wallet ownership.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.'
```

可根据需要修改此消息。

## 注意事项

1. **凭证缓存**: 凭证会自动保存到 localStorage，刷新页面后仍然有效
2. **防重复签名**: `sign()` 方法会先检查缓存，避免重复签名
3. **签名状态**: 通过 `signing` 状态防止并发签名请求
4. **错误处理**: 所有异步方法都应使用 try-catch 处理错误
5. **钱包连接**: 使用前确保钱包已连接

## 与原 IDChat 的差异

1. **钱包适配**: 从 `connectionStore` 改为使用 `walletStore`
2. **用户登录**: 使用 `loginWithWallet` 方法而非 `setUserInfo`
3. **公钥获取**: 适配 Metalet 钱包的 API
4. **类型定义**: 使用本项目的类型系统

## 相关文件

- `src/stores/credentials.ts` - Credentials Store
- `src/constants/index.ts` - 签名消息常量
- `src/stores/wallet.ts` - Wallet Store
- `src/stores/user.ts` - User Store
- `src/types/metalet.d.ts` - Metalet 类型定义

## 参考资源

- [IDChat 项目](https://github.com/lgs18928191781/idchat)
- [Pinia 文档](https://pinia.vuejs.org/)
- [@vueuse/core 文档](https://vueuse.org/)


