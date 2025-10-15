# useBuildTx Hook 使用指南

## 📋 概述

`useBuildTx` 是一个强大的、优雅的交易构建 Hook，支持同时构建 **BTC** 和 **MVC** 链上的交易。它结合了 IDChat 项目中两种 `createPin` 方法的优点，提供了统一的接口和灵活的配置选项。

## ✨ 核心特性

### 1. **双链支持**
- ✅ **MVC Chain** (默认)
- ✅ **BTC Chain**

### 2. **双支付模式**
- ✅ **Normal Mode** - 常规支付模式（支持 BTC 和 MVC）
  - 使用 `metaidwallet.pay()` 支付
  - 自动广播到链上
  - 支持大数据分片存储（> 1MB）

- ✅ **Assist Mode** - 辅助支付模式（仅支持 MVC）
  - 使用 Assist API 管理 UTXO
  - 适用于新用户或无 UTXO 场景
  - 自动管理 UTXO 链

### 3. **串行操作支持**
- ✅ **Combo** - 组合多个交易
- ✅ **Finish** - 立即执行交易

### 4. **大数据优化**
- ✅ 自动检测数据大小
- ✅ 超过 1MB 自动使用分片存储
- ✅ 提升传输效率

## 🚀 快速开始

### 基础用法

```typescript
import { useBuildTx } from '@/hooks/use-build-tx'

const { createPin } = useBuildTx()

// 创建一个简单的 Pin
const result = await createPin(
  {
    operation: 'create',
    body: 'Hello MetaID!',
    path: '/protocols/simplebuzz',
    contentType: 'text/plain',
  },
  {
    chain: 'mvc',  // 或 'btc'
    network: 'testnet',
    feeRate: 1,
  }
)

console.log('Transaction ID:', result.txid)
```

## 📖 详细用法

### 1. MVC 链 - 常规模式

```typescript
const { createPin } = useBuildTx()

const result = await createPin(
  {
    operation: 'create',
    body: 'My first post on MVC!',
    path: '/protocols/simplebuzz',
    contentType: 'text/plain;utf-8',
    encryption: '0',  // 不加密
    version: '1.0.0',
  },
  {
    chain: 'mvc',
    network: 'testnet',
    paymentMode: 'normal',
    feeRate: 1,
    signMessage: 'Create my first post',
  }
)

console.log('✅ MVC Transaction:', result.txid)
```

### 2. BTC 链 - 常规模式

```typescript
const { createPin } = useBuildTx()

const result = await createPin(
  {
    operation: 'create',
    body: 'My first post on BTC!',
    path: '/protocols/simplebuzz',
    contentType: 'text/plain;utf-8',
  },
  {
    chain: 'btc',  // 使用 BTC 链
    network: 'testnet',
    paymentMode: 'normal',
    feeRate: 5,  // BTC 通常需要更高的手续费率
    signMessage: 'Create my first BTC post',
  }
)

console.log('✅ BTC Transaction:', result.txid)
```

### 3. MVC 链 - Assist 模式（新用户推荐）

```typescript
const { createPin } = useBuildTx()

const result = await createPin(
  {
    operation: 'create',
    body: JSON.stringify({
      name: 'Alice',
      bio: 'Web3 Developer',
    }),
    path: '/info/profile',
    contentType: 'application/json',
  },
  {
    chain: 'mvc',
    network: 'mainnet',
    paymentMode: 'assist',  // 使用 Assist 模式
    assistDomain: 'https://www.metaso.network/assist-open-api',
    signMessage: 'Create user profile',
  }
)

console.log('✅ Profile created:', result.txid)
```

### 4. 批量创建 Pins（Combo 模式）

```typescript
const { createPin } = useBuildTx()

// 第一个 Pin - combo 模式
const result1 = await createPin(
  {
    operation: 'create',
    body: 'Alice',
    path: '/info/name',
    contentType: 'text/plain',
  },
  {
    chain: 'mvc',
    network: 'testnet',
    serialAction: 'combo',  // 组合模式
    feeRate: 1,
  }
)

// 第二个 Pin - combo 模式
const result2 = await createPin(
  {
    operation: 'create',
    body: 'A passionate Web3 developer',
    path: '/info/bio',
    contentType: 'text/plain',
  },
  {
    chain: 'mvc',
    network: 'testnet',
    serialAction: 'combo',
    transactions: result1.transactions,  // 传递前一个交易
    feeRate: 1,
  }
)

// 第三个 Pin - finish 模式（执行所有交易）
const result3 = await createPin(
  {
    operation: 'create',
    body: Buffer.from('...avatar image data...', 'base64'),
    path: '/info/avatar',
    contentType: 'image/jpeg;binary',
    encoding: 'base64',
  },
  {
    chain: 'mvc',
    network: 'testnet',
    serialAction: 'finish',  // 立即执行
    transactions: result2.transactions,
    feeRate: 1,
  }
)

console.log('✅ All transactions broadcasted:', result3.txids)
```

### 5. 使用 createPins 批量创建（更优雅）

```typescript
const { createPins } = useBuildTx()

const metaDatas = [
  {
    operation: 'create',
    body: 'Alice',
    path: '/info/name',
    contentType: 'text/plain',
  },
  {
    operation: 'create',
    body: 'A passionate Web3 developer',
    path: '/info/bio',
    contentType: 'text/plain',
  },
  {
    operation: 'create',
    body: Buffer.from('...avatar...', 'base64'),
    path: '/info/avatar',
    contentType: 'image/jpeg;binary',
    encoding: 'base64',
  },
]

const result = await createPins(metaDatas, {
  chain: 'mvc',
  network: 'testnet',
  paymentMode: 'normal',
  feeRate: 1,
})

console.log('✅ Success:', result.success)
console.log('📋 Transaction IDs:', result.txids)
```

### 6. 添加服务费和额外输出

```typescript
const { createPin } = useBuildTx()

const result = await createPin(
  {
    operation: 'create',
    body: 'Premium content',
    path: '/protocols/premium-content',
    contentType: 'text/plain',
  },
  {
    chain: 'mvc',
    network: 'testnet',
    feeRate: 1,
    
    // 添加服务费
    service: {
      address: '1ServiceAddressXXXXXXXXXXXXXX',
      satoshis: '1000',  // 0.00001 MVC
    },
    
    // 添加额外输出（比如给创作者打赏）
    outputs: [
      {
        address: '1CreatorAddressXXXXXXXXXXXXXX',
        satoshis: '5000',
      },
      {
        address: '1AnotherAddressXXXXXXXXXXXXX',
        satoshis: '3000',
      },
    ],
  }
)

console.log('✅ Transaction with outputs:', result.txid)
```

### 7. 修改已有 Pin

```typescript
const { createPin } = useBuildTx()

// 假设已有一个 name Pin，ID 为 'abc123'
const result = await createPin(
  {
    operation: 'modify',
    body: 'Alice Smith',  // 新的名字
    path: '@abc123',  // 使用 @ + pinId
    contentType: 'text/plain',
  },
  {
    chain: 'mvc',
    network: 'testnet',
    feeRate: 1,
    signMessage: 'Update my name',
  }
)

console.log('✅ Name updated:', result.txid)
```

## 🎯 实际应用场景

### 场景 1: 用户注册/创建资料

```typescript
import { useBuildTx } from '@/hooks/use-build-tx'
import { useUserStore } from '@/stores/user'

async function createUserProfile(userData: {
  name: string
  bio: string
  avatar: string  // base64
}) {
  const { createPins } = useBuildTx()
  const userStore = useUserStore()

  const metaDatas = [
    {
      operation: 'create' as const,
      body: userData.name,
      path: '/info/name',
      contentType: 'text/plain',
    },
    {
      operation: 'create' as const,
      body: userData.bio,
      path: '/info/bio',
      contentType: 'text/plain',
    },
    {
      operation: 'create' as const,
      body: userData.avatar,
      path: '/info/avatar',
      contentType: 'image/jpeg;binary',
      encoding: 'base64' as const,
    },
  ]

  try {
    const result = await createPins(metaDatas, {
      chain: 'mvc',
      network: 'mainnet',
      paymentMode: 'assist',
      assistDomain: 'https://www.metaso.network/assist-open-api',
      feeRate: 1,
    })

    if (result.success) {
      // 更新用户信息
      await userStore.setUserInfo(userStore.last!.address)
      return result.txids
    }
  } catch (error) {
    console.error('Failed to create user profile:', error)
    throw error
  }
}
```

### 场景 2: 发布内容

```typescript
import { useBuildTx } from '@/hooks/use-build-tx'

async function publishPost(content: {
  title: string
  body: string
  images?: string[]  // base64
}) {
  const { createPins } = useBuildTx()

  const metaDatas = [
    {
      operation: 'create' as const,
      body: JSON.stringify({
        title: content.title,
        body: content.body,
      }),
      path: '/protocols/simplebuzz',
      contentType: 'application/json',
    },
  ]

  // 添加图片 Pins
  if (content.images) {
    content.images.forEach((image, index) => {
      metaDatas.push({
        operation: 'create' as const,
        body: image,
        path: `/protocols/simplebuzz/attachments/${index}`,
        contentType: 'image/jpeg;binary',
        encoding: 'base64' as const,
      })
    })
  }

  const result = await createPins(metaDatas, {
    chain: 'mvc',
    network: 'mainnet',
    paymentMode: 'normal',
    feeRate: 1,
  })

  return result
}
```

### 场景 3: 更新用户资料

```typescript
import { useBuildTx } from '@/hooks/use-build-tx'
import { useUserStore } from '@/stores/user'

async function updateUserInfo(updates: {
  name?: { value: string; nameId?: string }
  bio?: { value: string; bioId?: string }
  avatar?: { value: string; avatarId?: string }
}) {
  const { createPins } = useBuildTx()
  const userStore = useUserStore()

  const metaDatas = []

  if (updates.name) {
    metaDatas.push({
      operation: (updates.name.nameId ? 'modify' : 'create') as const,
      body: updates.name.value,
      path: updates.name.nameId ? `@${updates.name.nameId}` : '/info/name',
      contentType: 'text/plain',
    })
  }

  if (updates.bio) {
    metaDatas.push({
      operation: (updates.bio.bioId ? 'modify' : 'create') as const,
      body: updates.bio.value,
      path: updates.bio.bioId ? `@${updates.bio.bioId}` : '/info/bio',
      contentType: 'text/plain',
    })
  }

  if (updates.avatar) {
    metaDatas.push({
      operation: (updates.avatar.avatarId ? 'modify' : 'create') as const,
      body: updates.avatar.value,
      path: updates.avatar.avatarId ? `@${updates.avatar.avatarId}` : '/info/avatar',
      contentType: 'image/jpeg;binary',
      encoding: 'base64' as const,
    })
  }

  if (metaDatas.length === 0) {
    throw new Error('No updates provided')
  }

  const result = await createPins(metaDatas, {
    chain: 'mvc',
    network: 'mainnet',
    paymentMode: 'normal',
    feeRate: 1,
  })

  if (result.success) {
    await userStore.setUserInfo(userStore.last!.address)
  }

  return result
}
```

## 📚 API 参考

### `createPin(metaidData, options)`

#### 参数

**`metaidData: Omit<MetaidData, 'revealAddr'>`**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `operation` | `'init' \| 'create' \| 'modify' \| 'revoke'` | ✅ | 操作类型 |
| `body` | `string \| Buffer` | ❌ | 数据内容 |
| `path` | `string` | ✅ | 数据路径（create）或 Pin ID（modify: `@{pinId}`） |
| `contentType` | `string` | ❌ | 内容类型（默认: `text/plain;utf-8`） |
| `encryption` | `'0' \| '1' \| '2'` | ❌ | 加密类型（默认: `'0'`） |
| `version` | `string` | ❌ | 版本（默认: `'1.0.0'`） |
| `encoding` | `BufferEncoding` | ❌ | 编码（默认: `'utf-8'`） |
| `flag` | `'metaid'` | ❌ | 标志 |

**`options: CreatePinOptions`**

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `chain` | `'btc' \| 'mvc'` | `'mvc'` | 链类型 |
| `network` | `'mainnet' \| 'testnet' \| 'regtest'` | `'testnet'` | 网络类型 |
| `signMessage` | `string` | `'Create Pin'` | 签名消息 |
| `serialAction` | `'combo' \| 'finish'` | `'finish'` | 串行操作类型 |
| `transactions` | `Transaction[]` | `[]` | 已有交易（combo 模式） |
| `feeRate` | `number` | - | 手续费率 |
| `paymentMode` | `'normal' \| 'assist'` | `'normal'` | 支付模式 |
| `assistDomain` | `string` | - | Assist API 域名 |
| `service` | `{ address: string; satoshis: string }` | - | 服务费输出 |
| `outputs` | `Array<{ address: string; satoshis: string }>` | - | 额外输出 |
| `utxo` | `{ txid: string; outIndex: number; value: number; address: string }` | - | 指定 UTXO（assist 模式） |

#### 返回值

```typescript
type CreatePinResult =
  | {
      transactions: Transaction[]
      txid?: undefined
      txids?: string[]
    }
  | {
      txid: string
      transactions?: undefined
      txids?: string[]
    }
```

- **Combo 模式**: 返回 `{ transactions }`
- **Finish 模式**: 返回 `{ txid, txids }`

### `createPins(metaDatas, options)`

批量创建多个 Pins，自动处理串行逻辑。

#### 参数

- **`metaDatas`**: `Array<Omit<MetaidData, 'revealAddr'>>`
- **`options`**: `CreatePinOptions`

#### 返回值

```typescript
{
  txids: string[]
  success: boolean
}
```

## ⚙️ 工作原理

### 常规模式（Normal Mode）

```
1. 构建交易 (TxComposer)
   ↓
2. 检查数据大小
   ↓
3. 分片存储（如果 > 1MB）
   ↓
4. 调用 metaidwallet.pay()
   ↓
5. 批量广播交易
   ↓
6. 返回 txid/txids
```

### Assist 模式（Assist Mode）

```
1. 获取或初始化 UTXO
   ↓
2. 构建交易 (TxComposer)
   ↓
3. 调用 Assist API Pre
   ↓
4. 获取 UTXO 详情
   ↓
5. 解锁 P2PKH 输入
   ↓
6. 调用 Assist API Commit
   ↓
7. 存储新 UTXO
   ↓
8. 返回 txid
```

## 🎨 设计亮点

### 1. **统一接口**
- 单一的 `createPin` 方法同时支持 BTC 和 MVC
- 通过 `chain` 参数轻松切换链

### 2. **智能模式选择**
- 根据 `paymentMode` 自动选择支付策略
- Assist 模式自动管理 UTXO 链

### 3. **优雅的代码组织**
- 类型定义清晰
- 工具函数独立
- 策略模式分离支付逻辑

### 4. **灵活的组合**
- Combo 模式支持灵活组合多个交易
- 批量创建方法简化常见场景

### 5. **完善的错误处理**
- 详细的错误提示
- 自动重试机制（Assist 模式）
- Console 日志便于调试

## 🔍 最佳实践

### 1. 选择合适的支付模式

- **Normal Mode**: 适用于有 UTXO 的用户
- **Assist Mode**: 适用于新用户或无 UTXO 的场景

### 2. 批量操作优化

```typescript
// ❌ 不推荐：多次单独调用
for (const data of metaDatas) {
  await createPin(data, options)
}

// ✅ 推荐：使用批量方法
await createPins(metaDatas, options)
```

### 3. 错误处理

```typescript
try {
  const result = await createPin(metaidData, options)
  console.log('Success:', result.txid)
} catch (error) {
  if (error.message.includes('No UTXO')) {
    // 切换到 Assist 模式
    const result = await createPin(metaidData, {
      ...options,
      paymentMode: 'assist',
      assistDomain: 'https://www.metaso.network/assist-open-api',
    })
  } else {
    console.error('Failed:', error)
  }
}
```

### 4. 链选择建议

- **MVC**: 低手续费，快速确认，适合高频操作
- **BTC**: 高安全性，适合重要数据存储

## 📝 总结

`useBuildTx` Hook 提供了一个**优雅、强大、灵活**的交易构建解决方案：

✅ **双链支持** - BTC 和 MVC  
✅ **双模式** - Normal 和 Assist  
✅ **批量操作** - 高效处理多个交易  
✅ **大数据优化** - 自动分片存储  
✅ **完善的类型** - TypeScript 全面支持  
✅ **优雅的设计** - 代码清晰易维护  

立即开始使用，构建你的 Web3 应用！ 🚀



