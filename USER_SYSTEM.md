# 用户登录注册系统

## 🎯 系统概述

本项目实现了基于 Metalet 钱包的完整用户系统，参考了 [IDChat 项目](https://github.com/lgs18928191781/idchat) 的用户管理实现。

### 核心特性

✅ **钱包登录** - 使用 Metalet 钱包地址作为身份标识  
✅ **自动登录** - 连接钱包后自动登录  
✅ **持久化存储** - 用户信息存储在 localStorage  
✅ **自动恢复** - 刷新页面自动恢复登录状态  
✅ **账户切换** - 切换钱包账户自动重新登录  
✅ **安全退出** - 退出登录时清空所有 localStorage  
✅ **过期检测** - 7天未活跃自动退出  

## 📁 文件结构

```
src/
├── stores/
│   ├── wallet.ts       # 钱包状态管理
│   └── user.ts         # 👈 用户状态管理（新增）
├── utils/
│   ├── storage.ts      # 👈 localStorage 工具（新增）
│   └── format.ts       # 👈 格式化工具（新增）
└── types/
    └── metalet.d.ts    # Metalet 类型定义
```

## 🔄 登录流程

### 流程图

```
用户打开页面
    ↓
检测 Metalet 钱包（异步轮询，最多 15 秒）
    ↓
检测到钱包？
    ├─ 是 → 检查 localStorage
    │         ↓
    │     有用户信息？
    │         ├─ 是 → 地址匹配？
    │         │         ├─ 是 → ✅ 自动恢复登录
    │         │         └─ 否 → ⚠️  清空旧信息
    │         └─ 否 → 显示"Connect Wallet"
    │
    └─ 否 → 显示"安装 Metalet"

用户点击 "Connect Wallet"
    ↓
连接 Metalet 钱包
    ↓
获取钱包地址
    ↓
自动调用 loginWithWallet()
    ↓
创建用户信息 UserInfo
    ↓
生成 Access Token
    ↓
保存到 localStorage
    ↓
✅ 登录成功
```

## 💾 LocalStorage 存储

### 存储键名

| 键名 | 值类型 | 说明 |
|------|--------|------|
| `metaid_user_info` | `UserInfo` | 用户完整信息 |
| `metaid_access_token` | `string` | 访问令牌 |
| `metaid_wallet_address` | `string` | 钱包地址（快速访问） |

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

### 存储示例

```javascript
// localStorage 中的数据
{
  "metaid_user_info": {
    "address": "1ABCxxxxxxxxxxxxxxxxxxy123",
    "mvcAddress": "xxx...",
    "btcAddress": "bc1...",
    "name": "用户1ABC",
    "loginTime": 1696934400000,
    "lastActiveTime": 1696934400000
  },
  "metaid_access_token": "token_1ABC..._1696934400000",
  "metaid_wallet_address": "1ABCxxxxxxxxxxxxxxxxxxy123"
}
```

## 🔐 登录功能

### 1. 自动登录（钱包连接后）

```typescript
import { useWalletStore } from '@/stores/wallet'
import { useUserStore } from '@/stores/user'

const walletStore = useWalletStore()
const userStore = useUserStore()

// 连接钱包（自动登录）
await walletStore.connect()

// 连接成功后：
// 1. 获取钱包地址
// 2. 自动调用 userStore.loginWithWallet()
// 3. 保存用户信息到 localStorage
// 4. 登录完成
```

### 2. 手动登录

```typescript
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 使用钱包账户登录
const success = await userStore.loginWithWallet({
  address: '1ABC...',
  mvcAddress: 'xxx...',
  btcAddress: 'bc1...'
})

if (success) {
  console.log('登录成功')
  console.log('用户信息:', userStore.userInfo)
  console.log('Access Token:', userStore.accessToken)
}
```

### 3. 检查登录状态

```typescript
// 在路由守卫或组件中检查
if (!userStore.isLoggedIn) {
  // 未登录，跳转登录页面或提示连接钱包
  router.push('/login')
}

// 检查登录是否过期
const isValid = userStore.checkLoginStatus()
if (!isValid) {
  // 登录已过期（7天未活跃）
  alert('登录已过期，请重新登录')
}
```

## 📤 退出登录

### 流程

```
用户点击"断开连接"
    ↓
walletStore.disconnect()
    ↓
自动调用 userStore.logout()
    ↓
清空状态：
  - userInfo = null
  - accessToken = null
    ↓
清空 localStorage：
  - 删除 metaid_user_info
  - 删除 metaid_access_token
  - 删除 metaid_wallet_address
    ↓
✅ 退出完成
```

### 代码示例

```typescript
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 方式 1：通过钱包断开（推荐）
await walletStore.disconnect() // 自动调用 logout

// 方式 2：直接退出登录
userStore.logout()

// 退出后：
// - userStore.isLoggedIn = false
// - userStore.userInfo = null
// - userStore.accessToken = null
// - localStorage 已清空
```

## 🔄 状态恢复

### 页面刷新时自动恢复

```typescript
// 在应用初始化时
// main.ts 或 App.vue 的 onMounted

const userStore = useUserStore()
const walletStore = useWalletStore()

// 初始化用户 store（从 localStorage 加载）
userStore.init()

// 初始化钱包 store（异步检测 + 恢复连接）
await walletStore.init()

// 流程：
// 1. userStore.init() 从 localStorage 加载用户信息
// 2. walletStore.init() 检测钱包并获取当前地址
// 3. 如果地址匹配，保持登录状态
// 4. 如果地址不匹配，清空旧用户信息
```

## 👥 账户切换处理

### 自动切换用户

```typescript
// 在 wallet.ts 的事件监听中
window.metaidwallet!.on('accountsChanged', async (newAccount) => {
  console.log('账户已切换:', newAccount)
  
  // 更新钱包账户
  account.value = newAccount
  
  // 如果地址变更，重新登录
  const userStore = useUserStore()
  if (userStore.userInfo?.address !== newAccount.address) {
    await userStore.loginWithWallet(newAccount)
  }
})
```

### 效果

```
用户在 Metalet 中切换账户
    ↓
触发 accountsChanged 事件
    ↓
检测到新地址
    ↓
自动退出旧账户
    ↓
自动登录新账户
    ↓
更新 localStorage
    ↓
页面更新显示新账户信息
```

## 📊 用户信息更新

### 更新个人资料

```typescript
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 更新用户名
await userStore.updateUserInfo({
  name: '我的新名字'
})

// 更新头像
await userStore.updateUserInfo({
  avatar: 'https://example.com/avatar.png'
})

// 批量更新
await userStore.updateUserInfo({
  name: '新名字',
  bio: '这是我的个人简介',
  avatar: 'https://...'
})

// 更新后自动保存到 localStorage
```

## 🛡️ 安全特性

### 1. Token 过期检测

```typescript
// 7 天未活跃自动退出
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

if (now - lastActiveTime > SEVEN_DAYS) {
  userStore.logout() // 自动退出
}
```

### 2. 地址验证

```typescript
// 切换账户时验证
if (userStore.userInfo?.address !== newAccount.address) {
  // 地址不匹配，清空旧数据
  userStore.logout()
  // 登录新账户
  await userStore.loginWithWallet(newAccount)
}
```

### 3. 错误处理

```typescript
try {
  await userStore.loginWithWallet(account)
} catch (error) {
  console.error('登录失败:', error)
  // 显示错误提示
  alert('登录失败，请重试')
}
```

## 🎨 UI 集成

### 显示登录状态

```vue
<template>
  <!-- 登录状态提示 -->
  <div v-if="userStore.isLoggedIn">
    <p>欢迎，{{ userStore.displayName }}</p>
    <p>登录时间：{{ formatTimeAgo(userStore.userInfo.loginTime) }}</p>
  </div>
  
  <div v-else>
    <p>请连接钱包登录</p>
  </div>
</template>
```

### 显示用户头像

```vue
<template>
  <img 
    :src="userStore.displayAvatar" 
    :alt="userStore.displayName"
    class="w-10 h-10 rounded-full"
  />
</template>
```

### 登出按钮

```vue
<template>
  <button @click="handleLogout">
    退出登录
  </button>
</template>

<script setup lang="ts">
import { useWalletStore } from '@/stores/wallet'

const walletStore = useWalletStore()

const handleLogout = async () => {
  await walletStore.disconnect() // 自动清空 localStorage
}
</script>
```

## 📝 完整示例

### 带登录保护的页面

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useWalletStore } from '@/stores/wallet'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const walletStore = useWalletStore()
const router = useRouter()
const isLoading = ref(true)

onMounted(async () => {
  // 初始化用户信息
  userStore.init()
  
  // 初始化钱包
  await walletStore.init()
  
  isLoading.value = false
  
  // 如果未登录，引导用户连接钱包
  if (!userStore.isLoggedIn) {
    // 可以显示登录提示或自动打开连接钱包弹窗
  }
})
</script>

<template>
  <div v-if="isLoading">
    <p>加载中...</p>
  </div>
  
  <div v-else-if="!userStore.isLoggedIn">
    <h2>请登录</h2>
    <ConnectWallet />
  </div>
  
  <div v-else>
    <h2>欢迎，{{ userStore.displayName }}</h2>
    <p>您的地址：{{ userStore.userInfo?.address }}</p>
    <p>余额：{{ (walletStore.balance?.total / 100000000).toFixed(8) }} BTC</p>
    
    <button @click="walletStore.disconnect">退出登录</button>
  </div>
</template>
```

## 🔧 API 参考

### User Store

```typescript
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 状态
userStore.userInfo        // 用户信息
userStore.accessToken     // 访问令牌
userStore.isLoggedIn      // 是否已登录（computed）
userStore.displayName     // 显示名称（computed）
userStore.displayAvatar   // 显示头像（computed）
userStore.isLoggingIn     // 是否正在登录
userStore.loginError      // 登录错误信息

// 方法
await userStore.loginWithWallet(account)      // 使用钱包登录
await userStore.register(account, profile)    // 注册新用户
await userStore.updateUserInfo(updates)       // 更新用户信息
userStore.logout()                            // 退出登录（清空 localStorage）
userStore.checkLoginStatus()                  // 检查登录状态
userStore.updateLastActiveTime()              // 更新最后活跃时间
userStore.init()                              // 初始化（从 localStorage 加载）
```

### Storage 工具

```typescript
import { getStorage, setStorage, removeStorage, clearAllStorage } from '@/utils/storage'

// 获取数据
const userInfo = getStorage<UserInfo>('metaid_user_info')

// 设置数据
setStorage('metaid_user_info', { address: '1ABC...' })

// 删除数据
removeStorage('metaid_user_info')

// 清空所有
clearAllStorage()
```

### Format 工具

```typescript
import { formatAddress, formatBalance, formatTimeAgo, copyToClipboard } from '@/utils/format'

// 格式化地址
formatAddress('1ABCxxxxxxxxxxxxxxxxxxy123')  // '1ABC...y123'

// 格式化余额
formatBalance(100000000)  // '1.00000000'

// 相对时间
formatTimeAgo(Date.now() - 3600000)  // '1 小时前'

// 复制到剪贴板
await copyToClipboard('复制的内容')
```

## 🎯 实际应用场景

### 场景 1：需要登录才能访问的功能

```vue
<template>
  <div>
    <!-- 未登录时显示提示 -->
    <div v-if="!userStore.isLoggedIn">
      <p>此功能需要登录</p>
      <ConnectWallet />
    </div>
    
    <!-- 已登录时显示功能 -->
    <div v-else>
      <MyFeature />
    </div>
  </div>
</template>
```

### 场景 2：个人中心

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { ref } from 'vue'

const userStore = useUserStore()
const newName = ref('')

const updateProfile = async () => {
  await userStore.updateUserInfo({ name: newName.value })
  alert('更新成功')
}
</script>

<template>
  <div class="profile">
    <img :src="userStore.displayAvatar" />
    <h2>{{ userStore.displayName }}</h2>
    
    <input v-model="newName" placeholder="新用户名" />
    <button @click="updateProfile">更新</button>
  </div>
</template>
```

### 场景 3：带签名的 API 请求

```typescript
import { useUserStore } from '@/stores/user'
import { useWalletStore } from '@/stores/wallet'

const userStore = useUserStore()
const walletStore = useWalletStore()

// 发送需要认证的请求
const sendAuthenticatedRequest = async () => {
  if (!userStore.isLoggedIn) {
    throw new Error('请先登录')
  }
  
  // 签名请求数据
  const message = JSON.stringify({
    timestamp: Date.now(),
    action: 'transfer',
    amount: 1000
  })
  
  const { signature } = await walletStore.signMessage(message)
  
  // 发送到后端
  const response = await fetch('/api/transfer', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userStore.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      address: userStore.userInfo?.address,
      message,
      signature
    })
  })
  
  return response.json()
}
```

## 🔍 调试

### 查看 localStorage

```javascript
// 在浏览器控制台
// 查看所有存储
console.log(localStorage)

// 查看用户信息
console.log(JSON.parse(localStorage.getItem('metaid_user_info')))

// 查看 token
console.log(localStorage.getItem('metaid_access_token'))
```

### 手动清空存储

```javascript
// 清空所有 metaid 相关数据
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('metaid_')) {
    localStorage.removeItem(key)
  }
})

// 或使用工具函数
import { clearStorageByPrefix } from '@/utils/storage'
clearStorageByPrefix('metaid_')
```

## 🐛 常见问题

### Q1: 刷新页面后登录状态丢失？

**检查：**
```javascript
// 确保在应用初始化时调用
userStore.init()
```

### Q2: 切换账户后没有自动切换用户？

**检查：**
```javascript
// 确保设置了事件监听
walletStore.setupEventListeners()
```

### Q3: localStorage 配额已满？

**解决：**
```javascript
import { getStorageStats } from '@/utils/storage'

const stats = getStorageStats()
console.log(`使用：${stats.percentage}%`)

if (stats.percentage > 80) {
  // 清理旧数据
}
```

## 📚 参考资源

- **IDChat 用户系统**: https://github.com/lgs18928191781/idchat/blob/feature/test-ai/src/stores/user.ts
- **IDChat 工具函数**: https://github.com/lgs18928191781/idchat/blob/feature/test-ai/src/utils/util.ts
- **Metalet 钱包**: https://github.com/metalet-labs/metalet-extension-next

## 🎉 总结

您现在拥有了：

✅ **完整的用户系统** - 登录、注册、退出  
✅ **持久化存储** - localStorage 自动保存和恢复  
✅ **账户切换** - 自动处理多账户  
✅ **安全性** - 过期检测、地址验证  
✅ **开发友好** - 完整类型、工具函数  

**开始使用：** `./dev.sh` → 连接钱包 → 自动登录 → 开始开发！

