# Metalet 钱包集成指南

## 🎯 项目概述

本项目集成了 [Metalet 钱包](https://github.com/metalet-labs/metalet-extension-next)，支持比特币钱包连接、余额查看、消息签名等功能。

## 🚀 快速开始

### 1. 安装 Metalet 钱包

**Chrome/Edge 浏览器：**
https://chromewebstore.google.com/detail/metalet/lbjapbcmmceacocpimbpbidpgmlmoaao

安装后，您会在浏览器右上角看到 Metalet 图标。

### 2. 创建或导入钱包

1. 点击 Metalet 图标
2. 创建新钱包或导入现有钱包
3. 设置密码
4. 备份助记词

### 3. 启动演示应用

```bash
# 确保使用 Node.js 20.19+
nvm use 20.19.1

# 启动开发服务器
./dev.sh
```

### 4. 连接钱包

1. 访问：`http://localhost:5173`
2. 点击右上角 **"Connect Wallet"** 按钮
3. 在弹出的 Metalet 窗口中点击 **"连接"**
4. 授权成功后，页面会显示您的地址和余额

## 🔧 技术实现

### 项目结构

```
src/
├── types/
│   └── metalet.d.ts          # Metalet 钱包类型定义
├── stores/
│   └── wallet.ts             # 钱包状态管理（Pinia）
├── components/
│   └── ConnectWallet.vue     # 钱包连接组件
└── App.vue                   # 主应用（包含钱包 UI）
```

### 核心功能

#### 1. 智能检测机制 ⚡

项目实现了**异步轮询检测**，确保可靠检测到 Metalet 钱包：

```typescript
// 自动检测（最多 15 秒）
await walletStore.waitForMetalet()

// 自定义配置
await walletStore.waitForMetalet(20, 300) // 20 次，每次 300ms = 6 秒

// 检测过程：
// 🔍 检测 Metalet 钱包... (1/50)
// 🔍 检测 Metalet 钱包... (10/50)
// ✅ Metalet 钱包检测成功（第 12 次尝试）
```

**为什么需要轮询？**
- 浏览器扩展注入到 `window` 对象需要时间
- 直接检查可能得到 `undefined`
- 轮询确保扩展加载完成后立即检测到

**详细说明：** [WALLET_DETECTION.md](./WALLET_DETECTION.md)

#### 2. 钱包连接

```typescript
// stores/wallet.ts
import { useWalletStore } from './stores/wallet'

const walletStore = useWalletStore()

// 连接钱包（自动检测 + 连接）
await walletStore.connect()

// 断开连接
await walletStore.disconnect()
```

#### 3. 获取余额

```typescript
// 自动获取（连接后）
const balance = walletStore.balance

// 手动刷新
await walletStore.fetchBalance()

// 余额包含：
// - confirmed: 已确认金额（satoshis）
// - unconfirmed: 未确认金额（satoshis）
// - total: 总计（satoshis）
```

#### 4. 签名消息

```typescript
// 签名文本消息
const result = await walletStore.signMessage('Hello MetaID')
console.log(result.signature)
```

#### 5. 监听事件

钱包 store 自动监听：
- **accountsChanged** - 用户切换账户时触发
- **networkChanged** - 用户切换网络时触发

```typescript
// 在组件中使用
watch(() => walletStore.account, (newAccount) => {
  console.log('账户已切换:', newAccount)
})
```

## 📋 API 参考

### Wallet Store 状态

| 属性 | 类型 | 说明 |
|------|------|------|
| `account` | `MetaletAccount \| null` | 当前连接的账户 |
| `balance` | `BalanceInfo \| null` | 账户余额信息 |
| `isConnecting` | `boolean` | 是否正在连接中 |
| `error` | `string \| null` | 错误信息 |
| `network` | `'mainnet' \| 'testnet'` | 当前网络 |
| `isConnected` | `boolean` (computed) | 是否已连接 |
| `shortAddress` | `string` (computed) | 短地址（前6后4位） |

### Wallet Store 方法

| 方法 | 说明 |
|------|------|
| `connect()` | 连接钱包 |
| `disconnect()` | 断开连接 |
| `fetchBalance()` | 刷新余额 |
| `switchNetwork(network)` | 切换网络 |
| `signMessage(message)` | 签名消息 |
| `isMetaletInstalled()` | 检查是否安装 Metalet |
| `init()` | 初始化（自动检查连接状态） |

### 组件使用

```vue
<script setup lang="ts">
import ConnectWallet from './components/ConnectWallet.vue'
import { useWalletStore } from './stores/wallet'

const walletStore = useWalletStore()
</script>

<template>
  <!-- 在任意位置添加钱包按钮 -->
  <ConnectWallet />
  
  <!-- 根据连接状态显示内容 -->
  <div v-if="walletStore.isConnected">
    <p>欢迎，{{ walletStore.shortAddress }}</p>
    <p>余额：{{ walletStore.balance?.total }} satoshis</p>
  </div>
</template>
```

## 🎨 UI 组件特性

### ConnectWallet 组件

**三种状态：**

1. **未安装 Metalet**
   - 显示 "安装 Metalet" 按钮
   - 点击跳转到 Chrome Web Store

2. **未连接**
   - 显示 "Connect Wallet" 按钮
   - 支持加载状态动画

3. **已连接**
   - 显示网络指示器（绿色=主网，橙色=测试网）
   - 显示当前余额
   - 显示短地址
   - 下拉菜单包含：
     - 完整地址（可复制）
     - 余额详情
     - 刷新余额
     - 断开连接

## 🔐 安全性

### 最佳实践

1. **永远不要存储私钥**
   - Metalet 钱包管理所有私钥
   - 应用只获取公开信息

2. **验证签名**
   ```typescript
   // 签名消息时，用户需要在 Metalet 中确认
   const { signature } = await walletStore.signMessage(message)
   ```

3. **检查网络**
   ```typescript
   if (walletStore.network !== 'mainnet') {
     alert('请切换到主网')
   }
   ```

4. **错误处理**
   ```typescript
   try {
     await walletStore.connect()
   } catch (error) {
     console.error('连接失败:', error)
     // 显示用户友好的错误提示
   }
   ```

## 🌐 Metalet API 文档

完整 API 参考：[Metalet Extension Next](https://github.com/metalet-labs/metalet-extension-next)

### 主要 API

```typescript
// 账户管理
await window.metaidwallet.connect()
await window.metaidwallet.disconnect()
await window.metaidwallet.getAddress()

// 余额
await window.metaidwallet.getBalance()

// 网络
await window.metaidwallet.switchNetwork('mainnet' | 'testnet')

// 签名
await window.metaidwallet.signMessage(message, encoding)
await window.metaidwallet.signTransactions(params)

// Token
await window.metaidwallet.token.getBalance(genesis, codehash)

// 事件
window.metaidwallet.on('accountsChanged', callback)
window.metaidwallet.on('networkChanged', callback)
```

## 🎯 实际应用场景

### 场景 1：NFT 市场

```typescript
// 购买 NFT
const buyNFT = async (nftId: string) => {
  if (!walletStore.isConnected) {
    await walletStore.connect()
  }
  
  // 构建交易
  const tx = buildNFTTransaction(nftId)
  
  // 签名交易
  const signed = await window.metaidwallet!.signTransactions({
    transactions: [tx]
  })
  
  // 广播交易
  await broadcastTransaction(signed.signedTransactions[0])
}
```

### 场景 2：去中心化应用认证

```typescript
// 使用签名验证身份
const authenticate = async () => {
  const message = `Login to MyApp at ${Date.now()}`
  const { signature } = await walletStore.signMessage(message)
  
  // 发送到后端验证
  const response = await fetch('/api/auth', {
    method: 'POST',
    body: JSON.stringify({
      address: walletStore.account?.address,
      message,
      signature
    })
  })
  
  return response.json()
}
```

### 场景 3：Token 转账

```typescript
// 查看 Token 余额
const tokenBalance = await window.metaidwallet!.token.getBalance()

// 构建转账交易
// ... 交易构建逻辑

// 签名并发送
const result = await window.metaidwallet!.signTransactions({
  transactions: [transferTx]
})
```

## 🐛 常见问题

### Q1: 提示 "未检测到 Metalet 钱包"？

**解决方案：**
1. 确认已安装 Metalet 扩展
2. 刷新页面
3. 检查扩展是否启用

### Q2: 连接后余额显示为 0？

**原因：**
- 钱包可能没有余额
- 或网络连接问题

**解决：**
1. 确认钱包中有余额
2. 点击 "刷新余额" 按钮
3. 检查网络设置

### Q3: 如何切换测试网？

**步骤：**
1. 在 Metalet 钱包中切换到测试网
2. 或使用 API：
   ```typescript
   await walletStore.switchNetwork('testnet')
   ```

### Q4: 签名消息时没有弹窗？

**检查：**
1. Metalet 弹窗可能被浏览器阻止
2. 检查浏览器弹窗设置
3. 点击地址栏的弹窗图标

## 📊 开发提示

### 调试技巧

```javascript
// 在 Console 中查看 Metalet 对象
console.log(window.metaidwallet)

// 查看当前账户
console.log(walletStore.account)

// 查看余额
console.log(walletStore.balance)
```

### 类型支持

项目已包含完整的 TypeScript 类型定义：

```typescript
// 自动补全和类型检查
import type { MetaletAccount, BalanceInfo } from '@/types/metalet'

const account: MetaletAccount = {
  address: '1xxx...',
  mvcAddress: 'xxx...',
  btcAddress: 'bc1...'
}
```

### 测试模式

```typescript
// 在开发环境中模拟钱包（如果需要）
if (import.meta.env.DEV && !window.metaidwallet) {
  // 创建模拟钱包对象用于测试
  window.metaidwallet = createMockWallet()
}
```

## 🔗 相关资源

- **Metalet GitHub**: https://github.com/metalet-labs/metalet-extension-next
- **IDChat 项目**: https://www.idchat.io/chat
- **Chrome 扩展商店**: https://chromewebstore.google.com/detail/metalet/lbjapbcmmceacocpimbpbidpgmlmoaao

## 📝 代码示例

### 完整的钱包集成示例

```vue
<script setup lang="ts">
import { useWalletStore } from '@/stores/wallet'
import { ref } from 'vue'

const walletStore = useWalletStore()
const message = ref('')
const signature = ref('')

const handleSign = async () => {
  try {
    const result = await walletStore.signMessage(message.value)
    signature.value = result.signature
  } catch (error) {
    console.error('签名失败:', error)
  }
}
</script>

<template>
  <div>
    <ConnectWallet />
    
    <div v-if="walletStore.isConnected">
      <h2>签名工具</h2>
      <input v-model="message" placeholder="输入要签名的消息" />
      <button @click="handleSign">签名</button>
      <div v-if="signature">
        <p>签名结果：</p>
        <code>{{ signature }}</code>
      </div>
    </div>
  </div>
</template>
```

## 🎉 完成！

现在您的应用已经完全集成了 Metalet 钱包！

**下一步：**
1. 启动项目：`./dev.sh`
2. 安装 Metalet 钱包（如果还没有）
3. 点击 "Connect Wallet" 连接
4. 开始构建您的 Web3 应用！

## 💡 扩展功能建议

### 可以添加的功能

1. **Token 管理**
   - 查看所有 Token 余额
   - Token 转账功能

2. **NFT 展示**
   - 显示用户拥有的 NFT
   - NFT 转账功能

3. **交易历史**
   - 查看历史交易
   - 交易详情展示

4. **多链支持**
   - BTC 和 MVC 切换
   - 显示不同链的余额

### 实现示例

```typescript
// Token 余额查询
const tokens = await window.metaidwallet!.token.getBalance()
tokens.forEach(token => {
  console.log(`${token.symbol}: ${token.confirmedString}`)
})
```

---

**参考项目：** [IDChat](https://www.idchat.io/chat) | [Metalet Extension](https://github.com/metalet-labs/metalet-extension-next)

