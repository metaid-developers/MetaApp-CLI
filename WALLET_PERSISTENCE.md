# 钱包连接状态持久化

## 🎯 问题解决

**问题：** 页面刷新后钱包连接状态丢失，用户需要重新连接

**解决方案：** 实现钱包连接状态的 localStorage 持久化

## 💾 持久化数据

### LocalStorage 键名

| 键名 | 类型 | 说明 |
|------|------|------|
| `metaid_wallet_account` | `MetaletAccount` | 钱包账户信息（地址） |
| `metaid_wallet_balance` | `BalanceInfo` | 余额信息 |
| `metaid_wallet_network` | `'mainnet' \| 'testnet'` | 网络类型 |
| `metaid_wallet_connected` | `boolean` | 连接状态标记 |

### 完整数据结构

```javascript
// 连接后的 localStorage
{
  // 钱包数据
  "metaid_wallet_account": {
    "address": "1ABCxxxxxxxxxxxxxxxxxxy123",
    "mvcAddress": "xxx...",
    "btcAddress": "bc1..."
  },
  "metaid_wallet_balance": {
    "address": "1ABC...",
    "confirmed": 100000000,    // 1 BTC
    "unconfirmed": 50000000,   // 0.5 BTC
    "total": 150000000         // 1.5 BTC
  },
  "metaid_wallet_network": "mainnet",
  "metaid_wallet_connected": true,
  
  // 用户数据
  "metaid_user_info": {
    "address": "1ABC...",
    "loginTime": 1696934400000,
    "lastActiveTime": 1696934400000
  },
  "metaid_access_token": "token_...",
  "metaid_wallet_address": "1ABC..."
}
```

## 🔄 自动保存时机

### 1. 连接钱包成功后

```typescript
const connect = async () => {
  await window.metaidwallet!.connect()
  account.value = result
  await fetchBalance()
  
  // 👈 自动保存
  saveWalletToStorage()
}
```

### 2. 获取余额后

```typescript
const fetchBalance = async () => {
  const balanceInfo = await window.metaidwallet!.getBalance()
  balance.value = balanceInfo
  
  // 👈 自动保存最新余额
  setStorage(STORAGE_KEYS.WALLET_BALANCE, balance.value)
}
```

### 3. 切换网络后

```typescript
window.metaidwallet!.on('networkChanged', (newNetwork) => {
  network.value = newNetwork
  
  // 👈 自动保存最新网络
  setStorage(STORAGE_KEYS.WALLET_NETWORK, network.value)
})
```

### 4. 账户信息更新后

```typescript
window.metaidwallet!.on('accountsChanged', (newAccount) => {
  account.value = newAccount
  
  // 如果地址未变，保存最新状态
  if (oldAddress === newAccount.address) {
    saveWalletToStorage() // 👈 保存
  }
})
```

## 🔍 自动恢复流程

### 页面刷新时

```
页面加载
    ↓
walletStore.init()
    ↓
【步骤 1】从 localStorage 加载钱包状态
    ├─→ 读取 metaid_wallet_account
    ├─→ 读取 metaid_wallet_balance
    ├─→ 读取 metaid_wallet_network
    └─→ 读取 metaid_wallet_connected
    ↓
有连接记录？
    ├─ 是 → 恢复 account, balance, network
    └─ 否 → 跳过
    ↓
【步骤 2】检测 Metalet 钱包（15秒）
    ↓
检测成功？
    ├─ 是 → 继续
    └─ 否 → 清空 localStorage 记录（钱包已卸载）
    ↓
【步骤 3】获取当前钱包地址
    ↓
地址匹配？
    ├─ 是 → ✅ 保持连接状态 + 刷新余额
    │        └─→ 用户登录状态也恢复 ✅
    │
    └─ 否 → ⚠️ 清空所有 localStorage
             └─→ 提示重新登录
```

### 控制台日志示例

```javascript
// 刷新页面，地址匹配的情况
🔍 开始初始化钱包...
✅ 从本地存储恢复用户信息: { address: "1ABC..." }
✅ 从 localStorage 恢复钱包连接状态: 1ABC...
🔍 开始检测 Metalet 钱包...
✅ Metalet 钱包检测成功（第 1 次尝试）
✅ 钱包连接状态已从 localStorage 恢复
💰 余额信息已更新: { total: 150000000 }
✅ 用户登录状态已完全恢复
```

## 🗑️ 清空时机

### 1. 退出登录

```typescript
const disconnect = async () => {
  await window.metaidwallet!.disconnect()
  
  // 清空状态
  account.value = null
  balance.value = null
  
  // 👈 清空钱包 localStorage
  clearWalletStorage()
  
  // 👈 清空用户 localStorage
  userStore.logout()
}
```

**清空的键：**
- ❌ `metaid_wallet_account`
- ❌ `metaid_wallet_balance`
- ❌ `metaid_wallet_network`
- ❌ `metaid_wallet_connected`
- ❌ `metaid_user_info`
- ❌ `metaid_access_token`
- ❌ `metaid_wallet_address`

### 2. 切换账户（地址变更）

```typescript
window.metaidwallet!.on('accountsChanged', (newAccount) => {
  const oldAddress = account.value?.address
  
  if (oldAddress !== newAccount.address) {
    // 👈 清空所有 localStorage
    clearWalletStorage()
    userStore.logout()
    
    console.log('请重新连接钱包以登录新账户')
  }
})
```

### 3. 检测到地址不匹配

```typescript
// 页面刷新时
const init = async () => {
  const result = await window.metaidwallet!.getAddress()
  
  if (storedAddress !== result.address) {
    // 👈 清空所有 localStorage
    clearWalletStorage()
    userStore.logout()
  }
}
```

## 🎯 使用示例

### 手动保存钱包状态

```typescript
import { useWalletStore } from '@/stores/wallet'

const walletStore = useWalletStore()

// 手动保存（通常不需要，自动保存已经处理）
walletStore.saveWalletToStorage()
```

### 手动加载钱包状态

```typescript
// 手动加载（通常不需要，init() 会自动调用）
const wasConnected = walletStore.loadWalletFromStorage()

if (wasConnected) {
  console.log('恢复了连接状态')
} else {
  console.log('没有历史连接记录')
}
```

### 手动清空钱包状态

```typescript
// 清空钱包 localStorage（保留用户信息）
walletStore.clearWalletStorage()

// 或完全退出（钱包 + 用户）
await walletStore.disconnect()
```

## 🔄 状态恢复对比

### 之前（v2.0 早期版本）

```
刷新页面
    ↓
检测 Metalet
    ↓
用户信息恢复 ✅
钱包连接状态丢失 ❌  ← 需要重新点击连接
    ↓
用户体验：❌ 每次刷新都要重新连接钱包
```

### 现在（v2.0 优化后）

```
刷新页面
    ↓
从 localStorage 恢复钱包状态 ✅
    ├─ account ✅
    ├─ balance ✅
    └─ network ✅
    ↓
检测 Metalet
    ↓
验证地址匹配
    ├─ 匹配 → 保持连接 ✅
    └─ 不匹配 → 清空并提示重新登录
    ↓
用户体验：✅ 刷新页面无需重新连接！
```

## 📊 数据一致性保证

### 1. 地址一致性

```typescript
// 初始化时验证
if (storedAccount.address === currentAccount.address) {
  // ✅ 地址一致，恢复状态
} else {
  // ❌ 地址不一致，清空所有数据
  clearWalletStorage()
  userStore.logout()
}
```

### 2. 余额实时性

```typescript
// 恢复连接后立即刷新余额
if (wasConnected && addressMatches) {
  console.log('恢复连接状态')
  await fetchBalance() // 👈 刷新余额，获取最新数据
}
```

### 3. 网络一致性

```typescript
// 恢复网络设置
network.value = storedNetwork || 'mainnet'

// 网络切换时自动保存
window.metaidwallet!.on('networkChanged', (newNetwork) => {
  setStorage(STORAGE_KEYS.WALLET_NETWORK, newNetwork)
})
```

## 🐛 边缘情况处理

### 情况 1：钱包已卸载

```
刷新页面
    ↓
loadWalletFromStorage() → account = 旧地址
    ↓
waitForMetalet(15秒) → 失败（钱包已卸载）
    ↓
检测失败处理：
    ├─→ account = null
    ├─→ balance = null
    └─→ clearWalletStorage() ✅
```

### 情况 2：切换到新钱包

```
用户在 Metalet 中切换账户
    ↓
accountsChanged 事件触发
    ↓
检测到地址变更：
    ├─→ clearWalletStorage() ✅
    ├─→ userStore.logout() ✅
    └─→ 提示重新登录 ✅
```

### 情况 3：localStorage 损坏

```
loadWalletFromStorage()
    ↓
try {
  JSON.parse(localStorage.getItem(...))
} catch (error) {
  console.error('加载失败')
  return false ✅  // 降级处理
}
```

### 情况 4：地址不匹配

```
localStorage: 地址 A
当前钱包: 地址 B
    ↓
检测到不匹配：
    ├─→ 清空所有 localStorage ✅
    └─→ 显示 "Connect Wallet" 按钮 ✅
```

## 🎓 最佳实践

### 1. 只保存必要数据

```typescript
// ✅ 好：只保存账户信息
saveWalletToStorage() {
  setStorage('account', account.value)
  setStorage('balance', balance.value)
  setStorage('network', network.value)
}

// ❌ 避免：不要保存敏感数据
// 不要保存私钥、助记词等
```

### 2. 验证数据一致性

```typescript
// ✅ 好：恢复后验证
const wasConnected = loadWalletFromStorage()
const currentAddress = await metaidwallet.getAddress()

if (storedAddress !== currentAddress.address) {
  clearWalletStorage() // 清空不一致的数据
}
```

### 3. 自动清理过期数据

```typescript
// ✅ 好：检测到异常情况自动清理
if (wasConnected && !isMetaletAvailable) {
  clearWalletStorage() // 钱包已卸载，清空记录
}

if (wasConnected && !currentlyConnected) {
  clearWalletStorage() // 钱包已断开，清空记录
}
```

## 🔧 API 参考

### walletStore 方法

```typescript
import { useWalletStore } from '@/stores/wallet'

const walletStore = useWalletStore()

// 保存钱包状态到 localStorage
walletStore.saveWalletToStorage()

// 从 localStorage 加载钱包状态
const wasConnected = walletStore.loadWalletFromStorage()

// 清空钱包 localStorage
walletStore.clearWalletStorage()

// 连接钱包（自动保存）
await walletStore.connect()

// 断开连接（自动清空钱包 + 用户 localStorage）
await walletStore.disconnect()

// 获取余额（自动保存）
await walletStore.fetchBalance()
```

## 📊 localStorage 使用情况

### 查看存储数据

```javascript
// 浏览器控制台
// 1. F12 打开控制台
// 2. Application → Local Storage → localhost

// 或使用代码查看
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('metaid_')) {
    console.log(key, localStorage.getItem(key))
  }
})
```

### 存储空间统计

```typescript
import { getStorageStats } from '@/utils/storage'

const stats = getStorageStats()
console.log(`使用: ${stats.used} bytes`)
console.log(`总计: ${stats.total} bytes`)
console.log(`占用: ${stats.percentage}%`)

// 典型输出：
// 使用: 2048 bytes
// 总计: 5242880 bytes (5MB)
// 占用: 0.04%
```

## 🎯 用户体验改进

### 之前

```
用户操作                     结果
──────────────────────────────────────────
连接钱包 ✅                  成功连接
刷新页面 F5                  钱包状态丢失 ❌
需要重新点击连接 😞           重新连接 ✅
```

**体验：** ⭐⭐⭐ (每次刷新都要重新连接)

### 现在

```
用户操作                     结果
──────────────────────────────────────────
连接钱包 ✅                  成功连接 + 保存状态
刷新页面 F5                  自动恢复连接 ✅
无需任何操作 😊              直接使用 ✅
```

**体验：** ⭐⭐⭐⭐⭐ (完全无感刷新)

## 🔒 安全性

### 保存的都是公开信息

✅ **钱包地址** - 公开信息，可安全存储  
✅ **余额信息** - 公开信息，可安全存储  
✅ **网络类型** - 公开信息，可安全存储  
✅ **Access Token** - 临时凭证，7天过期  

❌ **不保存私钥** - 永远不保存  
❌ **不保存助记词** - 永远不保存  
❌ **不保存密码** - 永远不保存  

### 数据验证

```typescript
// 恢复后验证地址一致性
if (storedAddress !== currentAddress) {
  clearWalletStorage() // 清空不一致的数据
  userStore.logout()   // 清空用户数据
}
```

## 🐛 故障排除

### Q1: 刷新后钱包状态恢复了但余额显示旧的？

**原因：** 余额已经变化，需要刷新

**解决：** 已自动实现！初始化时会自动刷新余额

```typescript
if (wasConnected && addressMatches) {
  await fetchBalance() // 👈 自动刷新最新余额
}
```

### Q2: 切换账户后旧数据还在？

**原因：** 账户切换监听没有清空数据

**解决：** 已自动实现！

```typescript
window.metaidwallet!.on('accountsChanged', (newAccount) => {
  if (oldAddress !== newAccount.address) {
    clearWalletStorage() // 👈 自动清空
    userStore.logout()   // 👈 自动清空
  }
})
```

### Q3: 退出登录后刷新页面还有钱包状态？

**原因：** disconnect() 没有清空钱包 localStorage

**解决：** 已修复！

```typescript
const disconnect = async () => {
  clearWalletStorage() // 👈 确保清空
  userStore.logout()
}
```

## 📝 测试清单

### 测试步骤

- [x] **连接钱包** → 检查 localStorage 是否保存了钱包数据
- [x] **刷新页面** → 检查钱包连接状态是否自动恢复
- [x] **刷新页面** → 检查用户登录状态是否自动恢复
- [x] **刷新页面** → 检查余额是否显示正确（刷新后的最新值）
- [x] **切换账户** → 检查是否清空了所有 localStorage
- [x] **切换账户** → 检查是否提示重新登录
- [x] **退出登录** → 检查是否清空了所有 localStorage
- [x] **卸载钱包** → 刷新页面，检查是否清空了 localStorage

### 验证命令

```javascript
// 在浏览器控制台执行

// 1. 查看所有 metaid_* 数据
Object.keys(localStorage).filter(k => k.startsWith('metaid_'))

// 2. 查看钱包数据
JSON.parse(localStorage.getItem('metaid_wallet_account'))
JSON.parse(localStorage.getItem('metaid_wallet_balance'))
localStorage.getItem('metaid_wallet_network')
localStorage.getItem('metaid_wallet_connected')

// 3. 手动清空测试
localStorage.clear()
location.reload()
```

## 🎉 总结

### 改进前后对比

| 功能 | 改进前 | 改进后 |
|------|--------|--------|
| 钱包连接持久化 | ❌ | ✅ |
| 刷新页面保持连接 | ❌ | ✅ |
| 余额数据持久化 | ❌ | ✅ |
| 网络设置持久化 | ❌ | ✅ |
| 地址验证 | 基础 | ✅ 完整 |
| 自动清理 | 部分 | ✅ 完整 |
| 账户切换处理 | 基础 | ✅ 完整 |

### 用户体验提升

- ✅ **无感刷新** - 刷新页面无需重新连接
- ✅ **数据同步** - 余额自动刷新为最新
- ✅ **智能清理** - 账户切换或退出自动清空
- ✅ **状态一致** - 钱包和用户状态完全同步

### 技术亮点

- ✅ **双重持久化** - 钱包 + 用户 双重 localStorage
- ✅ **自动同步** - 连接、余额、网络自动保存
- ✅ **智能验证** - 地址匹配验证，确保数据一致
- ✅ **边缘处理** - 卸载、切换、断开 全面处理

---

**现在刷新页面，钱包连接状态完美保持！** 🎉

