# 智能交易构建系统使用指南

## 概述

本项目已重新设计为智能交易构建系统，基于 `path` 或 `protocol` 参数自动识别处理方式。用户只需要传入标准参数，系统会自动识别并调用相应的处理逻辑，无需手动注册方法。

## 核心特性

### 1. 智能参数识别

系统会根据以下优先级自动识别处理方式：
1. **明确的 protocol 参数**：如果指定了 `protocol`，直接使用对应的处理规则
2. **path 模式匹配**：根据 `path` 中的关键词匹配相应的协议规则
3. **默认处理**：如果没有匹配的规则，使用默认的 `createPin` 处理

### 2. 协议规则系统

```typescript
interface ProtocolRule {
  pattern: RegExp | string  // 匹配模式
  handler: (data: UnifiedTransactionParams) => Promise<CreatePinResult | null>
  description: string
  defaultOptions?: Partial<CreatePinOptions>
}
```

## 使用方法

### 基础使用 - 基于 path 自动识别

```typescript
import { useBuildTx } from '@/hooks/use-build-tx'

const { buildTransaction } = useBuildTx()

// 假设 AddressHost = "metaid://1A2B3C4D5E6F7G8H9I0J"

// 1. 创建 showmsg 协议交易 - 系统自动识别
const result = await buildTransaction({
  path: 'metaid://1A2B3C4D5E6F7G8H9I0J:/protocols/showmsg',
  body: 'Hello World',
  contentType: 'text/plain;utf-8',
  options: {
    chain: 'btc',
    network: 'mainnet'
  }
})

// 2. 创建 mvcfile 协议交易 - 系统自动识别
const fileResult = await buildTransaction({
  path: 'metaid://1A2B3C4D5E6F7G8H9I0J:/protocols/mvcfile',
  body: Buffer.from('file content'),
  contentType: 'application/pdf',
  options: {
    network: 'mainnet'
  }
})

// 3. 创建用户档案 - 系统自动识别
const profileResult = await buildTransaction({
  path: 'metaid://1A2B3C4D5E6F7G8H9I0J:/profile/user123',
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar.jpg'
  }),
  contentType: 'application/json'
})

// 4. 创建数据存储 - 系统自动识别
const dataResult = await buildTransaction({
  path: 'metaid://1A2B3C4D5E6F7G8H9I0J:/data/app/settings',
  body: JSON.stringify({
    theme: 'dark',
    language: 'zh-CN'
  }),
  contentType: 'application/json'
})
```

### 明确指定协议

```typescript
// 使用明确的 protocol 参数
const result = await buildTransaction({
  protocol: 'showmsg',  // 明确指定协议
  body: 'This is a message',
  options: {
    chain: 'btc'
  }
})
```

### 批量处理

```typescript
const { buildTransactions } = useBuildTx()

const results = await buildTransactions([
  {
    path: 'protocols/showmsg',
    body: 'Message 1',
  },
  {
    path: 'protocols/mvcfile',
    body: Buffer.from('File content'),
  },
  {
    path: '/profile/user123',
    body: JSON.stringify({ name: 'John' }),
  }
])

console.log('Results:', results.results)
console.log('Success:', results.success)
```

## 内置协议规则

### 1. showmsg 协议
- **匹配模式**: `${AddressHost}:/protocols/showmsg` (动态生成的正则表达式)
- **默认选项**: `{ chain: 'btc', network: 'mainnet', signMessage: 'Create Show Message' }`
- **用途**: 显示消息交易

```typescript
const result = await buildTransaction({
  path: 'metaid://1A2B3C4D5E6F7G8H9I0J:/protocols/showmsg',
  body: 'Hello, blockchain!',
  contentType: 'text/plain;utf-8'
})
```

### 2. mvcfile 协议
- **匹配模式**: `${AddressHost}:/protocols/mvcfile` (动态生成的正则表达式)
- **默认选项**: `{ chain: 'mvc', network: 'mainnet', signMessage: 'Create MVC File' }`
- **用途**: MVC 文件交易

```typescript
const result = await buildTransaction({
  path: 'metaid://1A2B3C4D5E6F7G8H9I0J:/protocols/mvcfile',
  body: Buffer.from('file content'),
  contentType: 'application/pdf'
})
```

### 3. profile 协议
- **匹配模式**: `${AddressHost}:/profile` (动态生成的正则表达式)
- **默认选项**: `{ chain: 'btc', network: 'mainnet', signMessage: 'Create Profile' }`
- **用途**: 用户档案交易

```typescript
const result = await buildTransaction({
  path: 'metaid://1A2B3C4D5E6F7G8H9I0J:/profile/user123',
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com'
  }),
  contentType: 'application/json'
})
```

### 4. data 协议
- **匹配模式**: `${AddressHost}:/data` (动态生成的正则表达式)
- **默认选项**: `{ chain: 'btc', network: 'mainnet', signMessage: 'Create Data' }`
- **用途**: 数据存储交易

```typescript
const result = await buildTransaction({
  path: 'metaid://1A2B3C4D5E6F7G8H9I0J:/data/app/config',
  body: JSON.stringify({
    version: '1.0.0',
    features: ['feature1', 'feature2']
  }),
  contentType: 'application/json'
})
```

## 扩展新协议

### 添加新的协议规则

```typescript
const { registerProtocolRule } = useBuildTx()

// 获取 AddressHost 环境变量
const AddressHost = import.meta.env.VITE_ADDRESS_HOST

// 注册新的协议规则
registerProtocolRule('nft', {
  pattern: new RegExp(`${AddressHost ? AddressHost.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : ''}:/nft`, 'i'),
  handler: async (params) => {
    console.log('🎨 [NFT] Processing NFT protocol')
    return await createPin({
      operation: params.operation || 'create',
      body: params.body,
      path: params.path || `${AddressHost}:/nft`,
      contentType: params.contentType || 'application/json',
      encryption: params.encryption,
      version: params.version,
      encoding: params.encoding
    }, params.options || {})
  },
  description: 'NFT 协议处理',
  defaultOptions: {
    chain: 'btc',
    network: 'mainnet',
    signMessage: 'Create NFT'
  }
})

// 使用新协议
const nftResult = await buildTransaction({
  path: 'metaid://1A2B3C4D5E6F7G8H9I0J:/nft/token123',
  body: JSON.stringify({
    name: 'My NFT',
    description: 'A unique digital asset',
    image: 'https://example.com/image.jpg'
  }),
  contentType: 'application/json'
})
```

### 使用正则表达式模式

```typescript
registerProtocolRule('api', {
  pattern: /^\/api\/v\d+\//,  // 匹配 /api/v1/, /api/v2/ 等
  handler: async (params) => {
    console.log('🔌 [API] Processing API protocol')
    return await createPin({
      operation: params.operation || 'create',
      body: params.body,
      path: params.path,
      contentType: params.contentType || 'application/json',
    }, params.options || {})
  },
  description: 'API 数据协议处理',
  defaultOptions: {
    chain: 'btc',
    network: 'mainnet',
    signMessage: 'Create API Data'
  }
})

// 使用 API 协议
const apiResult = await buildTransaction({
  path: '/api/v1/users',
  body: JSON.stringify({ users: [] }),
  contentType: 'application/json'
})
```

## 协议管理

### 查看已注册的协议

```typescript
const { getRegisteredProtocols } = useBuildTx()

const protocols = getRegisteredProtocols()
console.log('Available protocols:', protocols)
// 输出: [
//   { name: 'showmsg', description: '显示消息协议处理', pattern: '/protocols\\/showmsg/i', hasDefaultOptions: true },
//   { name: 'mvcfile', description: 'MVC 文件协议处理', pattern: '/protocols\\/mvcfile/i', hasDefaultOptions: true },
//   ...
// ]
```

### 注销协议规则

```typescript
const { unregisterProtocolRule } = useBuildTx()

// 注销不再需要的协议
unregisterProtocolRule('nft')
```

## 完整示例

### Vue 组件中的使用

```vue
<template>
  <div>
    <h3>智能交易构建器</h3>
    
    <div>
      <label>路径:</label>
      <input v-model="transactionPath" placeholder="例如: protocols/showmsg" />
    </div>
    
    <div>
      <label>内容:</label>
      <textarea v-model="transactionBody" placeholder="交易内容"></textarea>
    </div>
    
    <div>
      <label>内容类型:</label>
      <select v-model="contentType">
        <option value="text/plain;utf-8">文本</option>
        <option value="application/json">JSON</option>
        <option value="application/octet-stream">二进制</option>
      </select>
    </div>
    
    <div>
      <label>链类型:</label>
      <select v-model="chain">
        <option value="btc">BTC</option>
        <option value="mvc">MVC</option>
      </select>
    </div>
    
    <button @click="executeTransaction" :disabled="!transactionPath">
      执行交易
    </button>
    
    <div v-if="result">
      <h4>结果:</h4>
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
    
    <div v-if="error">
      <h4>错误:</h4>
      <pre>{{ error }}</pre>
    </div>
    
    <div>
      <h4>已注册的协议:</h4>
      <ul>
        <li v-for="protocol in availableProtocols" :key="protocol.name">
          <strong>{{ protocol.name }}</strong>: {{ protocol.description }}
          <br>
          <small>模式: {{ protocol.pattern }}</small>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBuildTx } from '@/hooks/use-build-tx'

const { buildTransaction, getRegisteredProtocols, registerProtocolRule } = useBuildTx()

const transactionPath = ref('protocols/showmsg')
const transactionBody = ref('Hello World')
const contentType = ref('text/plain;utf-8')
const chain = ref('btc')
const result = ref(null)
const error = ref('')
const availableProtocols = ref([])

onMounted(() => {
  // 获取可用协议
  availableProtocols.value = getRegisteredProtocols()
  
  // 注册自定义协议
  registerProtocolRule('custom', {
    pattern: /custom/i,
    handler: async (params) => {
      console.log('🔧 [CUSTOM] Processing custom protocol')
      return await createPin({
        operation: params.operation || 'create',
        body: params.body,
        path: params.path || '/custom',
        contentType: params.contentType || 'application/json',
      }, params.options || {})
    },
    description: '自定义协议处理',
    defaultOptions: { chain: 'btc' }
  })
  
  // 更新可用协议列表
  availableProtocols.value = getRegisteredProtocols()
})

const executeTransaction = async () => {
  try {
    error.value = ''
    result.value = null
    
    const transactionResult = await buildTransaction({
      path: transactionPath.value,
      body: transactionBody.value,
      contentType: contentType.value,
      options: {
        chain: chain.value,
        network: 'mainnet'
      }
    })
    
    result.value = transactionResult
  } catch (err) {
    error.value = err.message
  }
}
</script>
```

## 高级用法

### 1. 复合协议处理

```typescript
registerProtocolRule('social', {
  pattern: /social/i,
  handler: async (params) => {
    const { path, body } = params
    
    // 根据子路径选择不同的处理方式
    if (path.includes('/post')) {
      return await createPin({
        operation: 'create',
        path: path,
        body: body,
        contentType: 'application/json'
      }, params.options || {})
    } else if (path.includes('/comment')) {
      return await createPin({
        operation: 'create',
        path: path,
        body: body,
        contentType: 'text/plain;utf-8'
      }, params.options || {})
    }
    
    // 默认处理
    return await createPin({
      operation: 'create',
      path: path,
      body: body,
      contentType: 'application/json'
    }, params.options || {})
  },
  description: '社交协议处理',
  defaultOptions: {
    chain: 'btc',
    network: 'mainnet',
    signMessage: 'Social Transaction'
  }
})

// 使用复合协议
const postResult = await buildTransaction({
  path: '/social/post/123',
  body: JSON.stringify({
    title: 'My Post',
    content: 'This is my post content'
  }),
  contentType: 'application/json'
})

const commentResult = await buildTransaction({
  path: '/social/comment/456',
  body: 'This is a comment',
  contentType: 'text/plain;utf-8'
})
```

### 2. 条件协议处理

```typescript
registerProtocolRule('smart', {
  pattern: /smart/i,
  handler: async (params) => {
    const { body, contentType } = params
    
    // 根据内容类型选择处理方式
    if (contentType?.includes('image')) {
      // 图片处理
      return await createMvcFile({
        operation: 'create',
        body: body,
        path: params.path || '/smart/image',
        contentType: contentType
      }, params.options || {})
    } else if (contentType?.includes('json')) {
      // JSON 数据处理
      return await createPin({
        operation: 'create',
        body: body,
        path: params.path || '/smart/data',
        contentType: contentType
      }, params.options || {})
    } else {
      // 文本处理
      return await createShowMsg({
        operation: 'create',
        body: body,
        path: params.path || '/smart/text',
        contentType: contentType || 'text/plain;utf-8'
      }, params.options || {})
    }
  },
  description: '智能协议处理',
  defaultOptions: {
    chain: 'btc',
    network: 'mainnet'
  }
})
```

## 优势

1. **完全自动化**：无需手动注册方法，基于参数自动识别
2. **智能匹配**：支持字符串和正则表达式模式匹配
3. **默认选项**：每个协议可以设置合理的默认选项
4. **灵活扩展**：可以轻松添加新的协议规则
5. **向后兼容**：保留了原有的直接调用方式
6. **类型安全**：完整的 TypeScript 支持

## 最佳实践

1. **路径命名**：使用清晰的路径结构，如 `protocols/showmsg`、`profile/user123`
2. **协议设计**：为每个协议设置合适的默认选项
3. **错误处理**：在协议处理函数中处理特定的错误情况
4. **文档**：为每个协议提供清晰的描述
5. **测试**：确保协议规则的正确匹配和处理

这种设计让您可以创建 `path:protocols/showmsg` 这样的协议，然后直接调用 `buildTransaction` 传入参数就能自动上链，无需任何额外的注册步骤！
