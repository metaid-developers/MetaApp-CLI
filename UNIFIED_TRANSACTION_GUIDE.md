# 统一交易构建方法使用指南

## 概述

本项目已实现统一的交易构建方法，参考了 idchat 项目的设计模式，提供了一个统一的接口来构建不同类型的交易。

## 核心功能

### 1. 交易类型（TransactionType）

```typescript
export const TransactionType = {
  PIN: 'pin',           // 通用 Pin 交易
  MVC_FILE: 'mvcFile',  // MVC 文件交易
  SHOW_MSG: 'showMsg',  // 显示消息交易
} as const
```

### 2. 统一交易构建方法

#### `buildTransaction` - 构建单个交易

根据交易类型调用相应的具体方法。

**类型定义：**
```typescript
interface UnifiedTransactionParams {
  type: TransactionType      // 交易类型
  data: any                  // 交易数据
  options?: CreatePinOptions // 交易选项
}
```

**使用示例：**

```typescript
import { useBuildTx, TransactionType } from '@/hooks/use-build-tx'

const { buildTransaction } = useBuildTx()

// 1. 创建通用 Pin 交易
const pinResult = await buildTransaction({
  type: TransactionType.PIN,
  data: {
    operation: 'create',
    path: '/custom/path',
    body: 'Hello World',
    contentType: 'text/plain;utf-8',
  },
  options: {
    chain: 'btc',
    network: 'mainnet',
    feeRate: 1,
  }
})

// 2. 创建 MVC 文件交易
const mvcFileResult = await buildTransaction({
  type: TransactionType.MVC_FILE,
  data: {
    body: Buffer.from('file content'),
    // path 和 contentType 会自动设置默认值
  },
  options: {
    // chain 会自动设置为 'mvc'
    network: 'mainnet',
  }
})

// 3. 创建显示消息交易
const showMsgResult = await buildTransaction({
  type: TransactionType.SHOW_MSG,
  data: {
    body: '这是一条消息',
    // path 和 contentType 会自动设置默认值
  },
  options: {
    chain: 'btc',
    signMessage: 'Create Message',
  }
})
```

#### `buildTransactions` - 批量构建交易

批量构建多个交易，支持错误处理和结果收集。

**返回值：**
```typescript
{
  results: Array<CreatePinResult | null>  // 交易结果数组
  success: boolean                         // 是否全部成功
  errors: Array<{                          // 错误信息
    index: number
    error: Error
  }>
}
```

**使用示例：**

```typescript
const { buildTransactions } = useBuildTx()

const result = await buildTransactions([
  {
    type: TransactionType.PIN,
    data: { body: 'Pin 1', path: '/data/1' },
    options: { chain: 'btc' }
  },
  {
    type: TransactionType.MVC_FILE,
    data: { body: 'File content' },
  },
  {
    type: TransactionType.SHOW_MSG,
    data: { body: 'Message' },
  }
])

if (result.success) {
  console.log('所有交易构建成功')
  result.results.forEach((r, i) => {
    if (r?.txid) {
      console.log(`交易 ${i}: ${r.txid}`)
    }
  })
} else {
  console.error('部分交易失败:', result.errors)
}
```

### 3. 具体交易构建方法

除了统一方法，你也可以直接调用具体的交易构建方法：

#### `createPin` - 创建通用 Pin 交易

```typescript
const { createPin } = useBuildTx()

const result = await createPin(
  {
    operation: 'create',
    path: '/custom/path',
    body: 'content',
    contentType: 'text/plain;utf-8',
  },
  {
    chain: 'btc',
    network: 'mainnet',
    feeRate: 1,
  }
)
```

#### `createMvcFile` - 创建 MVC 文件交易

```typescript
const { createMvcFile } = useBuildTx()

const result = await createMvcFile(
  {
    body: Buffer.from('file content'),
    // 默认 path: '/mvc/file'
    // 默认 contentType: 'application/octet-stream'
  },
  {
    network: 'mainnet',
    signMessage: 'Upload File',
  }
)
```

#### `createShowMsg` - 创建显示消息交易

```typescript
const { createShowMsg } = useBuildTx()

const result = await createShowMsg(
  {
    body: '这是要显示的消息',
    // 默认 path: '/msg/show'
    // 默认 contentType: 'text/plain;utf-8'
  },
  {
    chain: 'btc',
    network: 'mainnet',
  }
)
```

#### `createPins` - 批量创建 Pins

```typescript
const { createPins } = useBuildTx()

const result = await createPins(
  [
    { body: 'Pin 1', path: '/data/1' },
    { body: 'Pin 2', path: '/data/2' },
  ],
  {
    chain: 'btc',
    network: 'mainnet',
  }
)

console.log('交易IDs:', result.txids)
```

## 交易选项（CreatePinOptions）

```typescript
interface CreatePinOptions {
  // 链相关
  chain?: 'btc' | 'mvc'               // 默认 'mvc'
  network?: BtcNetwork                // 默认 'mainnet'
  
  // 交易构建
  signMessage?: string                // 签名消息
  serialAction?: 'combo' | 'finish'   // 串行操作模式
  transactions?: Transaction[]        // 已有交易列表
  isBroadcast?: boolean               // 是否广播交易，默认 true
  
  // 支付相关
  feeRate?: number                    // 手续费率
  paymentMode?: 'normal' | 'assist'   // 支付模式
  assistDomain?: string               // assist API 域名
  needSmallpay?: boolean              // 是否需要小额支付
  
  // 额外输出
  service?: {
    address: string
    satoshis: string
  }
  outputs?: Array<{
    address: string
    satoshis: string
  }>
  
  // UTXO 相关（assist 模式使用）
  utxo?: {
    txid: string
    outIndex: number
    value: number
    address: string
  }
}
```

## 完整使用示例

### 示例 1：在 Vue 组件中使用

```vue
<template>
  <div>
    <button @click="handleCreatePin">创建 Pin</button>
    <button @click="handleCreateFile">上传文件</button>
    <button @click="handleCreateMessage">发送消息</button>
  </div>
</template>

<script setup lang="ts">
import { useBuildTx, TransactionType } from '@/hooks/use-build-tx'

const { buildTransaction } = useBuildTx()

const handleCreatePin = async () => {
  try {
    const result = await buildTransaction({
      type: TransactionType.PIN,
      data: {
        operation: 'create',
        path: '/app/data',
        body: JSON.stringify({ name: 'test' }),
        contentType: 'application/json',
      },
      options: {
        chain: 'btc',
        network: 'mainnet',
      }
    })
    
    if (result?.txid) {
      console.log('交易成功:', result.txid)
    }
  } catch (error) {
    console.error('交易失败:', error)
  }
}

const handleCreateFile = async () => {
  try {
    const result = await buildTransaction({
      type: TransactionType.MVC_FILE,
      data: {
        body: Buffer.from('file content'),
      }
    })
    
    if (result?.txid) {
      console.log('文件上传成功:', result.txid)
    }
  } catch (error) {
    console.error('文件上传失败:', error)
  }
}

const handleCreateMessage = async () => {
  try {
    const result = await buildTransaction({
      type: TransactionType.SHOW_MSG,
      data: {
        body: 'Hello, blockchain!',
      },
      options: {
        chain: 'btc',
      }
    })
    
    if (result?.txid) {
      console.log('消息发送成功:', result.txid)
    }
  } catch (error) {
    console.error('消息发送失败:', error)
  }
}
</script>
```

### 示例 2：批量处理多个交易

```typescript
import { useBuildTx, TransactionType } from '@/hooks/use-build-tx'

const { buildTransactions } = useBuildTx()

async function batchUpload(files: File[]) {
  const transactions = files.map(file => ({
    type: TransactionType.MvcFile,
    data: {
      body: await file.arrayBuffer(),
      contentType: file.type,
    }
  }))
  
  const result = await buildTransactions(transactions)
  
  if (result.success) {
    console.log(`成功上传 ${result.results.length} 个文件`)
  } else {
    console.error(`${result.errors.length} 个文件上传失败`)
    result.errors.forEach(({ index, error }) => {
      console.error(`文件 ${index} 失败:`, error.message)
    })
  }
  
  return result
}
```

## 错误处理

```typescript
try {
  const result = await buildTransaction({
    type: TransactionType.PIN,
    data: { /* ... */ },
    options: { /* ... */ }
  })
  
  if (!result) {
    // 用户取消了交易
    console.log('交易已取消')
  } else if (result.txid) {
    // 交易成功
    console.log('交易成功:', result.txid)
  }
} catch (error) {
  // 交易失败
  console.error('交易失败:', error)
}
```

## 注意事项

1. **链类型选择**：
   - `MVC_FILE` 类型会强制使用 MVC 链
   - 其他类型默认使用当前链（可通过 `options.chain` 覆盖）

2. **默认值**：
   - `createMvcFile` 默认 path 为 `/mvc/file`，contentType 为 `application/octet-stream`
   - `createShowMsg` 默认 path 为 `/msg/show`，contentType 为 `text/plain;utf-8`

3. **返回值**：
   - 单个交易返回 `CreatePinResult | null`
   - 批量交易返回包含所有结果和错误信息的对象

4. **错误处理**：
   - `buildTransaction` 会抛出错误
   - `buildTransactions` 会收集错误但不会抛出，检查 `success` 字段

## 扩展新的交易类型

如需添加新的交易类型，按以下步骤操作：

1. 在 `TransactionType` 中添加新类型：
```typescript
export const TransactionType = {
  // ...现有类型
  NEW_TYPE: 'newType',
} as const
```

2. 创建具体的构建方法：
```typescript
const createNewType = async (
  metaidData: Omit<MetaidData, 'revealAddr'>,
  options: CreatePinOptions = {}
): Promise<CreatePinResult | null> => {
  // 实现逻辑
  return await createPin(metaidData, options)
}
```

3. 在 `buildTransaction` 的 switch 语句中添加新的 case：
```typescript
case TransactionType.NEW_TYPE:
  return await createNewType(data, options)
```

4. 在 return 语句中导出新方法：
```typescript
return {
  // ...
  createNewType,
}
```


