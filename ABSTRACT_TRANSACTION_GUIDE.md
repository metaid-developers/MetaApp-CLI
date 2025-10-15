# 抽象交易构建方法使用指南

## 概述

本项目已重新设计为完全抽象的交易构建方法，通过动态方法注册和调用机制，实现了真正的抽象化。用户只需要传入方法名称和参数，系统会自动调用相应的处理函数。

## 核心特性

### 1. 动态方法注册系统

```typescript
// 方法注册表类型
interface MethodRegistry {
  [methodName: string]: {
    handler: Function
    description?: string
    defaultOptions?: Partial<CreatePinOptions>
  }
}
```

### 2. 统一交易构建参数

```typescript
interface UnifiedTransactionParams {
  method: string  // 方法名称，如 'createPin', 'createMvcFile', 'createShowMsg'
  data: any       // 方法参数数据
  options?: CreatePinOptions
}
```

## 使用方法

### 基础使用

```typescript
import { useBuildTx } from '@/hooks/use-build-tx'

const { buildTransaction } = useBuildTx()

// 调用已注册的方法
const result = await buildTransaction({
  method: 'createPin',
  data: {
    operation: 'create',
    path: '/data/test',
    body: 'Hello World',
    contentType: 'text/plain;utf-8',
  },
  options: {
    chain: 'btc',
    network: 'mainnet',
  }
})
```

### 动态注册新方法

```typescript
const { registerMethod, buildTransaction } = useBuildTx()

// 注册一个新的交易方法
registerMethod(
  'createCustomTransaction',
  async (data, options) => {
    // 自定义的交易逻辑
    console.log('Creating custom transaction:', data)
    
    // 调用现有的 createPin 方法
    return await createPin({
      operation: 'create',
      path: '/custom/' + data.type,
      body: JSON.stringify(data),
      contentType: 'application/json',
    }, options)
  },
  '创建自定义交易',
  {
    chain: 'mvc',
    network: 'mainnet',
    feeRate: 1,
  }
)

// 使用新注册的方法
const result = await buildTransaction({
  method: 'createCustomTransaction',
  data: {
    type: 'userProfile',
    name: 'John Doe',
    email: 'john@example.com'
  }
})
```

### 批量处理

```typescript
const { buildTransactions } = useBuildTx()

const results = await buildTransactions([
  {
    method: 'createPin',
    data: { body: 'Data 1', path: '/data/1' },
    options: { chain: 'btc' }
  },
  {
    method: 'createMvcFile',
    data: { body: 'File content' },
  },
  {
    method: 'createCustomTransaction',
    data: { type: 'test', value: 123 },
  }
])

console.log('Results:', results.results)
console.log('Success:', results.success)
console.log('Errors:', results.errors)
```

## 方法管理

### 查看已注册的方法

```typescript
const { getRegisteredMethods } = useBuildTx()

const methods = getRegisteredMethods()
console.log('Available methods:', methods)
// 输出: [
//   { name: 'createPin', description: '创建通用 Pin 交易', hasDefaultOptions: false },
//   { name: 'createMvcFile', description: '创建 MVC 文件交易', hasDefaultOptions: true },
//   { name: 'createShowMsg', description: '创建显示消息交易', hasDefaultOptions: false }
// ]
```

### 注销方法

```typescript
const { unregisterMethod } = useBuildTx()

// 注销不再需要的方法
unregisterMethod('createCustomTransaction')
```

## 高级用法

### 1. 创建带默认选项的方法

```typescript
const { registerMethod } = useBuildTx()

registerMethod(
  'createBtcTransaction',
  async (data, options) => {
    return await createPin(data, options)
  },
  '创建 BTC 交易',
  {
    chain: 'btc',
    network: 'mainnet',
    feeRate: 1,
    signMessage: 'BTC Transaction'
  }
)

// 使用时不需要重复指定这些选项
const result = await buildTransaction({
  method: 'createBtcTransaction',
  data: { body: 'test', path: '/btc/test' }
  // options 会自动使用默认值
})
```

### 2. 创建复合方法

```typescript
const { registerMethod } = useBuildTx()

registerMethod(
  'createUserProfile',
  async (data, options) => {
    const profileData = {
      operation: 'create',
      path: '/profile/' + data.userId,
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        createdAt: new Date().toISOString()
      }),
      contentType: 'application/json'
    }
    
    return await createPin(profileData, options)
  },
  '创建用户档案',
  {
    chain: 'mvc',
    network: 'mainnet'
  }
)

// 使用复合方法
const result = await buildTransaction({
  method: 'createUserProfile',
  data: {
    userId: 'user123',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar.jpg'
  }
})
```

### 3. 创建条件方法

```typescript
const { registerMethod } = useBuildTx()

registerMethod(
  'createSmartTransaction',
  async (data, options) => {
    // 根据数据类型选择不同的处理方式
    if (data.type === 'file') {
      return await createMvcFile({
        body: data.content,
        contentType: data.mimeType,
        path: '/files/' + data.filename
      }, options)
    } else if (data.type === 'message') {
      return await createShowMsg({
        body: data.content,
        path: '/messages/' + data.id
      }, options)
    } else {
      return await createPin({
        operation: 'create',
        path: '/data/' + data.type,
        body: JSON.stringify(data),
        contentType: 'application/json'
      }, options)
    }
  },
  '智能交易创建',
  {}
)

// 使用智能方法
const fileResult = await buildTransaction({
  method: 'createSmartTransaction',
  data: {
    type: 'file',
    filename: 'document.pdf',
    content: fileBuffer,
    mimeType: 'application/pdf'
  }
})

const messageResult = await buildTransaction({
  method: 'createSmartTransaction',
  data: {
    type: 'message',
    id: 'msg123',
    content: 'Hello World'
  }
})
```

## 错误处理

```typescript
try {
  const result = await buildTransaction({
    method: 'nonExistentMethod',
    data: { test: 'data' }
  })
} catch (error) {
  console.error('Error:', error.message)
  // 输出: Method 'nonExistentMethod' is not registered. Available methods: createPin, createMvcFile, createShowMsg
}
```

## 完整示例

### Vue 组件中的使用

```vue
<template>
  <div>
    <h3>交易构建器</h3>
    
    <div>
      <label>方法名称:</label>
      <select v-model="selectedMethod">
        <option v-for="method in availableMethods" :key="method.name" :value="method.name">
          {{ method.name }} - {{ method.description }}
        </option>
      </select>
    </div>
    
    <div>
      <label>数据:</label>
      <textarea v-model="transactionData" placeholder="JSON 数据"></textarea>
    </div>
    
    <div>
      <label>选项:</label>
      <textarea v-model="transactionOptions" placeholder="JSON 选项"></textarea>
    </div>
    
    <button @click="executeTransaction" :disabled="!selectedMethod">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBuildTx } from '@/hooks/use-build-tx'

const { buildTransaction, getRegisteredMethods, registerMethod } = useBuildTx()

const selectedMethod = ref('')
const transactionData = ref('{"body": "test", "path": "/test"}')
const transactionOptions = ref('{"chain": "btc"}')
const result = ref(null)
const error = ref('')
const availableMethods = ref([])

onMounted(() => {
  // 获取可用方法
  availableMethods.value = getRegisteredMethods()
  
  // 注册自定义方法
  registerMethod(
    'createTestTransaction',
    async (data, options) => {
      console.log('Creating test transaction:', data)
      return await createPin({
        operation: 'create',
        path: '/test/' + Date.now(),
        body: JSON.stringify(data),
        contentType: 'application/json'
      }, options)
    },
    '创建测试交易',
    { chain: 'btc' }
  )
  
  // 更新可用方法列表
  availableMethods.value = getRegisteredMethods()
})

const executeTransaction = async () => {
  try {
    error.value = ''
    result.value = null
    
    const data = JSON.parse(transactionData.value)
    const options = JSON.parse(transactionOptions.value)
    
    const transactionResult = await buildTransaction({
      method: selectedMethod.value,
      data,
      options
    })
    
    result.value = transactionResult
  } catch (err) {
    error.value = err.message
  }
}
</script>
```

## 扩展指南

### 添加新的交易类型

1. **创建处理函数**：
```typescript
const createNewTypeTransaction = async (
  data: any,
  options: CreatePinOptions = {}
): Promise<CreatePinResult | null> => {
  // 实现具体的交易逻辑
  return await createPin(data, options)
}
```

2. **注册方法**：
```typescript
registerMethod(
  'createNewType',
  createNewTypeTransaction,
  '创建新类型交易',
  {
    // 默认选项
    chain: 'mvc',
    network: 'mainnet'
  }
)
```

3. **使用**：
```typescript
const result = await buildTransaction({
  method: 'createNewType',
  data: { /* 你的数据 */ }
})
```

### 最佳实践

1. **方法命名**：使用清晰的动词+名词格式，如 `createPin`, `updateProfile`, `deleteData`

2. **错误处理**：在注册的方法中处理特定的错误情况

3. **默认选项**：为常用方法设置合理的默认选项

4. **文档**：为每个注册的方法提供清晰的描述

5. **类型安全**：虽然使用了 `any` 类型，但建议在实际使用中定义具体的类型

## 优势

1. **完全抽象**：不需要修改核心代码就能添加新方法
2. **动态注册**：可以在运行时注册和注销方法
3. **默认选项**：支持为方法设置默认选项
4. **错误处理**：统一的错误处理和日志记录
5. **向后兼容**：保留了原有的直接调用方式
6. **类型安全**：完整的 TypeScript 支持

这种设计让您可以轻松扩展新的交易类型，而不需要修改核心的 `buildTransaction` 方法！

