# 用户系统快速开始

## 🚀 5 分钟上手

### 1. 连接钱包 = 自动登录

```bash
# 启动项目
./dev.sh

# 访问 http://localhost:5173
# 点击右上角 "Connect Wallet"
# ✅ 钱包连接后自动登录！
```

### 2. 查看用户信息

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>

<template>
  <div v-if="userStore.isLoggedIn">
    <p>欢迎，{{ userStore.displayName }}</p>
    <p>地址：{{ userStore.userInfo?.address }}</p>
    <img :src="userStore.displayAvatar" />
  </div>
</template>
```

### 3. 持久化自动恢复

```
刷新页面 → 自动从 localStorage 恢复登录状态
```

### 4. 退出登录

```typescript
// 方式 1：断开钱包（推荐）
await walletStore.disconnect()  // 自动退出登录 + 清空 localStorage

// 方式 2：直接退出
userStore.logout()  // 清空 localStorage
```

## 📦 localStorage 数据

```javascript
// 自动存储的数据
{
  "metaid_user_info": {
    "address": "1ABC...",
    "loginTime": 1696934400000,
    "lastActiveTime": 1696934400000
  },
  "metaid_access_token": "token_...",
  "metaid_wallet_address": "1ABC..."
}
```

## 🔄 常用API

```typescript
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 检查登录
userStore.isLoggedIn       // true/false

// 获取信息
userStore.displayName      // 显示名称
userStore.userInfo         // 完整用户信息
userStore.accessToken      // 访问令牌

// 操作
userStore.logout()         // 退出登录（清空 localStorage）
await userStore.updateUserInfo({ name: '新名字' })  // 更新信息
```

## 🎯 完整流程

```
页面加载
  ↓
自动检测 Metalet（15秒）
  ↓
从 localStorage 恢复用户信息
  ↓
检测钱包地址
  ↓
地址匹配 → ✅ 恢复登录
地址不匹配 → ⚠️ 清空旧信息
  ↓
用户点击 "Connect Wallet"
  ↓
连接钱包 → 自动登录
  ↓
保存到 localStorage
  ↓
✅ 完成！
```

## 📚 详细文档

- **完整指南**: [USER_SYSTEM.md](./USER_SYSTEM.md)
- **钱包集成**: [METALET_INTEGRATION.md](./METALET_INTEGRATION.md)

## 🎉 就这么简单！

**连接钱包 = 自动登录 = localStorage 持久化 = 刷新页面自动恢复** 🚀

