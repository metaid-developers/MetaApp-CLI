# createPins 方法修复说明

## 修复内容

`createPins` 方法已重新实现，现在与 `createPin` 方法功能完全一致。

## 主要改进

### 1. 参数处理一致性
- 使用与 `createPin` 相同的参数解构和默认值设置
- 支持所有 `CreatePinOptions` 参数，包括新增的 `mime` 和 `attachments`

### 2. BTC 链处理
- 正确使用 `createPinWithBtc` 方法进行批量铭刻
- 支持 `mime` 和 `attachments` 参数
- 正确处理 `noBroadcast`、`feeRate`、`network`、`outputs` 等选项

### 3. MVC 链处理
- 支持 Assist 模式和常规模式
- 正确处理 UTXO 管理
- 支持串行组合交易

### 4. 返回值增强
- 新增 `results` 字段，包含每个 Pin 的详细结果
- 保持 `txids` 和 `success` 字段的向后兼容性

## 新的返回值类型

```typescript
interface CreatePinsResult {
  txids: string[]                    // 所有交易ID
  success: boolean                   // 是否成功
  results: Array<CreatePinResult | null>  // 每个Pin的详细结果
}
```

## 使用示例

### 基础批量创建

```typescript
import { useBuildTx } from '@/hooks/use-build-tx'

const { createPins } = useBuildTx()

// 批量创建多个 Pin
const result = await createPins([
  {
    operation: 'create',
    path: '/data/pin1',
    body: 'First pin content',
    contentType: 'text/plain;utf-8'
  },
  {
    operation: 'create',
    path: '/data/pin2',
    body: 'Second pin content',
    contentType: 'text/plain;utf-8'
  },
  {
    operation: 'create',
    path: '/data/pin3',
    body: 'Third pin content',
    contentType: 'text/plain;utf-8'
  }
], {
  chain: 'btc',
  network: 'mainnet',
  feeRate: 1
})

console.log('Success:', result.success)
console.log('All txids:', result.txids)
console.log('Individual results:', result.results)
```

### BTC 链批量铭刻（带附件）

```typescript
const result = await createPins([
  {
    operation: 'create',
    path: '/file/document1',
    body: Buffer.from('Document content 1'),
    contentType: 'application/pdf'
  },
  {
    operation: 'create',
    path: '/file/document2',
    body: Buffer.from('Document content 2'),
    contentType: 'application/pdf'
  }
], {
  chain: 'btc',
  network: 'mainnet',
  feeRate: 1,
  mime: 'application/pdf',
  attachments: [
    {
      name: 'attachment1.pdf',
      type: 'application/pdf',
      data: Buffer.from('attachment data')
    }
  ]
})
```

### MVC 链批量创建

```typescript
const result = await createPins([
  {
    operation: 'create',
    path: '/profile/user1',
    body: JSON.stringify({ name: 'User 1' }),
    contentType: 'application/json'
  },
  {
    operation: 'create',
    path: '/profile/user2',
    body: JSON.stringify({ name: 'User 2' }),
    contentType: 'application/json'
  }
], {
  chain: 'mvc',
  network: 'mainnet',
  feeRate: 1
})
```

### Assist 模式批量创建

```typescript
const result = await createPins([
  {
    operation: 'create',
    path: '/data/item1',
    body: 'Item 1 data',
    contentType: 'text/plain;utf-8'
  },
  {
    operation: 'create',
    path: '/data/item2',
    body: 'Item 2 data',
    contentType: 'text/plain;utf-8'
  }
], {
  chain: 'mvc',
  network: 'mainnet',
  paymentMode: 'assist',
  assistDomain: 'https://assist.example.com'
})
```

## 错误处理

```typescript
try {
  const result = await createPins(metaDatas, options)
  
  if (result.success) {
    console.log('批量创建成功')
    result.results.forEach((pinResult, index) => {
      if (pinResult?.txid) {
        console.log(`Pin ${index} 交易ID:`, pinResult.txid)
      } else {
        console.log(`Pin ${index} 创建失败`)
      }
    })
  } else {
    console.log('批量创建失败')
  }
} catch (error) {
  console.error('批量创建出错:', error)
}
```

## Vue 组件示例

```vue
<template>
  <div>
    <h3>批量创建 Pins</h3>
    
    <div>
      <label>链类型:</label>
      <select v-model="chain">
        <option value="btc">BTC</option>
        <option value="mvc">MVC</option>
      </select>
    </div>
    
    <div>
      <label>Pin 数量:</label>
      <input v-model.number="pinCount" type="number" min="1" max="10" />
    </div>
    
    <button @click="createBatchPins" :disabled="loading">
      {{ loading ? '创建中...' : '批量创建' }}
    </button>
    
    <div v-if="result">
      <h4>结果:</h4>
      <p>成功: {{ result.success }}</p>
      <p>交易数量: {{ result.txids.length }}</p>
      <div v-for="(pinResult, index) in result.results" :key="index">
        <p>Pin {{ index + 1 }}: {{ pinResult?.txid || '失败' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useBuildTx } from '@/hooks/use-build-tx'

const { createPins } = useBuildTx()

const chain = ref('btc')
const pinCount = ref(3)
const loading = ref(false)
const result = ref(null)

const createBatchPins = async () => {
  loading.value = true
  result.value = null
  
  try {
    // 生成测试数据
    const metaDatas = Array.from({ length: pinCount.value }, (_, index) => ({
      operation: 'create' as const,
      path: `/data/pin${index + 1}`,
      body: `Pin ${index + 1} content`,
      contentType: 'text/plain;utf-8'
    }))
    
    const batchResult = await createPins(metaDatas, {
      chain: chain.value,
      network: 'mainnet',
      feeRate: 1
    })
    
    result.value = batchResult
  } catch (error) {
    console.error('批量创建失败:', error)
  } finally {
    loading.value = false
  }
}
</script>
```

## 与 createPin 的一致性

现在 `createPins` 方法在以下方面与 `createPin` 完全一致：

1. **参数处理**: 使用相同的参数解构和默认值
2. **BTC 链处理**: 使用相同的 `createPinWithBtc` 逻辑
3. **MVC 链处理**: 使用相同的支付和广播逻辑
4. **错误处理**: 使用相同的错误处理机制
5. **选项支持**: 支持所有 `CreatePinOptions` 参数
6. **返回值格式**: 保持一致的返回格式

## 性能优化

- BTC 链：使用单次 `createPinWithBtc` 调用处理所有数据
- MVC 链：根据模式选择最优的处理方式
- 错误隔离：单个 Pin 失败不影响其他 Pin 的处理
- 内存优化：合理管理交易数据的内存使用

现在 `createPins` 方法完全符合您的要求，与 `createPin` 方法功能一致！

