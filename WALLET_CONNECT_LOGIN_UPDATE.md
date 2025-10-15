# walletConnect.ts loginUser 方法更新说明

## 📝 更新内容

`walletConnect.ts` 中的老用户登录逻辑已更新为直接调用 MAN API 获取用户信息，完全参照 IDChat 项目的 `setUserInfo` 方法实现。

## 🔄 改动对比

### 旧逻辑
```typescript
// 调用本地的 loginUser API（模拟实现）
const loginResult = await loginUser(account)

if (loginResult.success && loginResult.data) {
  userStore.userInfo = loginResult.data.user
  userStore.accessToken = loginResult.data.token
  userStore.saveToStorage()
}
```

### 新逻辑（参照 IDChat）
```typescript
// 直接调用 MAN API 获取真实用户信息
const userInfoFromApi = await getUserInfoByAddress(account.address)

if (userInfoFromApi) {
  // 合并用户信息
  const newUserInfo: UserInfo = {
    ...userInfoFromApi,
    metaid: userInfoFromApi.metaid,
    metaId: userInfoFromApi.metaid,
    loginTime: Date.now(),
    lastActiveTime: Date.now(),
  }

  // 保存到 store
  userStore.userInfo = newUserInfo
  userStore.accessToken = `token_${account.address}_${Date.now()}`
  userStore.saveToStorage()
  
  // 检查用户是否设置了名称
  if (!newUserInfo.name) {
    console.log('⚠️ 用户尚未设置名称')
  }
}
```

## 🎯 主要改进

### 1. **使用真实 API**
- ❌ 旧：调用模拟的 `loginUser` 函数
- ✅ 新：直接调用 `getUserInfoByAddress` 从 MAN API 获取真实数据

### 2. **完整的用户信息**
从 MAN API 获取的用户信息包含：
```typescript
{
  address: string
  metaid: string
  name?: string
  avatar?: string
  bio?: string
  chainName: string
  // ... 更多字段
}
```

### 3. **更好的错误处理**
```typescript
try {
  const userInfoFromApi = await getUserInfoByAddress(account.address)
  
  if (userInfoFromApi) {
    // 处理成功
  } else {
    // API 返回空
    return { success: false, error: '获取用户信息失败' }
  }
} catch (error) {
  // API 调用失败
  return { success: false, error: error.message }
}
```

### 4. **详细的日志输出**
```typescript
console.log('✅ [步骤 4/5] 用户信息获取成功')
console.log('用户详情:', {
  address: newUserInfo.address,
  metaid: newUserInfo.metaid,
  name: newUserInfo.name || '(未设置)',
  hasName: !!newUserInfo.name,
})

if (!newUserInfo.name) {
  console.log('⚠️ 用户尚未设置名称，可能需要引导设置')
}
```

## 📊 登录流程对比

### 旧流程
```
1. checkUserExists(address) → 检查用户
2. isNewUser = false
3. loginUser(account) → 调用模拟 API
4. 保存模拟的用户信息
```

### 新流程（参照 IDChat）
```
1. checkUserExists(address) 
   └─ 内部调用 getUserInfoByAddress 判断 name 是否为空
   
2. isNewUser = false

3. getUserInfoByAddress(address)
   └─ 直接从 MAN API 获取真实用户信息
   
4. 保存真实的用户信息到 store
   ├─ userInfo = API 返回的完整信息
   ├─ accessToken = 生成的 token
   └─ saveToStorage() 持久化
   
5. 检查用户是否设置了 name
   └─ 如果未设置，可以引导用户完善资料
```

## 🔍 使用示例

### 基本使用
```typescript
import { connectMetalet } from '@/services/walletConnect'

// 连接并登录
const result = await connectMetalet({
  onProgress: (message) => {
    console.log('进度:', message)
  },
  onSuccess: (account, isNewUser) => {
    console.log('登录成功!')
    console.log('是否新用户:', isNewUser)
    
    // 访问用户信息
    const userStore = useUserStore()
    console.log('用户名:', userStore.userInfo?.name)
    console.log('MetaID:', userStore.userInfo?.metaid)
  }
})
```

### 检查用户名称
```typescript
import { connectMetalet } from '@/services/walletConnect'
import { useUserStore } from '@/stores/user'

const result = await connectMetalet()

if (result.success) {
  const userStore = useUserStore()
  
  // 检查用户是否设置了名称
  if (!userStore.userInfo?.name) {
    console.log('新用户需要设置名称')
    // 显示设置名称的模态框
    showSetNameModal()
  } else {
    console.log('欢迎回来,', userStore.userInfo.name)
    // 直接进入应用
    navigateToHome()
  }
}
```

## 📝 代码变更

### 修改的文件
- `src/services/walletConnect.ts`

### 新增导入
```typescript
import { getUserInfoByAddress } from '../api/man'
import type { UserInfo } from '../stores/user'
```

### 移除导入
```typescript
// 不再需要 loginUser
- import { checkUserExists, loginUser, registerUser } from '../api/user'
+ import { checkUserExists, registerUser } from '../api/user'
```

## 🎯 获取的用户信息字段

从 MAN API 获取的完整用户信息：

```typescript
{
  address: string           // 钱包地址
  metaid: string           // MetaID
  name?: string            // 用户名（可能为空）
  avatar?: string          // 头像
  avatarId?: string        // 头像 ID
  bio?: string             // 个人简介
  bioId?: string           // 简介 ID
  background?: string      // 背景图
  chainName: string        // 链名称（通常是 "mvc"）
  fdv?: number            // FDV
  followCount?: number    // 关注数
  isInit?: boolean        // 是否已初始化
  nameId?: string         // 名称 ID
  nftAvatar?: string      // NFT 头像
  nftAvatarId?: string    // NFT 头像 ID
  pdv?: number            // PDV
  pinId?: string          // Pin ID
  soulbondToken?: string  // Soulbond Token
  chatpubkey?: string     // 聊天公钥
  // 本地添加的字段
  loginTime: number        // 登录时间
  lastActiveTime: number   // 最后活跃时间
}
```

## ⚠️ 注意事项

1. **API 依赖**
   - 需要配置 `VITE_MAN_API` 环境变量
   - API 地址：`https://man-test.metaid.io/api` (测试) 或 `https://man.metaid.io/api` (正式)

2. **用户名称检查**
   - 获取用户信息后会自动检查 `name` 字段
   - 如果为空，会在控制台输出警告
   - 可以根据需要引导用户设置名称

3. **错误处理**
   - API 调用失败会返回详细的错误信息
   - 所有错误都会记录到控制台
   - 错误信息会通过 `callbacks.onError` 回调

4. **Token 生成**
   - 当前使用模拟的 token：`token_${address}_${timestamp}`
   - 实际应用中应该从后端 API 获取真实 token

## 🔗 相关资源

- [IDChat 项目](https://github.com/lgs18928191781/idchat)
- [IDChat user.ts](https://github.com/lgs18928191781/idchat/blob/feature/test-ai/src/stores/user.ts)
- [MAN API 文档](https://man.metaid.io/api/docs)

## 🚀 后续优化建议

1. **添加缓存机制**
   - 缓存用户信息，避免重复调用 API
   - 设置合理的缓存过期时间

2. **完善错误重试**
   - API 调用失败时自动重试
   - 网络错误时提供友好提示

3. **用户资料编辑**
   - 提供用户资料编辑界面
   - 实现修改名称、头像等功能

4. **真实 Token 管理**
   - 接入后端 API 获取真实 token
   - 实现 token 刷新机制
   - 处理 token 过期情况

## ✅ 测试要点

1. **正常登录流程**
   ```
   - 老用户有名称 → 直接登录成功
   - 老用户无名称 → 登录成功，提示设置名称
   ```

2. **API 失败情况**
   ```
   - API 404 → 返回错误信息
   - API 超时 → 返回错误信息
   - 网络断开 → 返回错误信息
   ```

3. **控制台日志**
   ```
   - 应显示详细的步骤日志
   - 成功时显示用户详情
   - 失败时显示错误信息
   ```

---

**更新时间**: 2025-01-XX
**参照项目**: IDChat
**相关方法**: `setUserInfo(address: string)`


