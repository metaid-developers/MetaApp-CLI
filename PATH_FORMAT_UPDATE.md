# 智能交易构建系统 - 路径格式更新

## 更新说明

系统已更新为支持基于 `AddressHost` 环境变量的动态路径格式。现在所有的协议规则都使用 `${AddressHost}:/protocols/xxx` 的格式进行匹配。

## 环境变量配置

在 `.env` 文件中设置 `AddressHost`：

```bash
VITE_ADDRESS_HOST=metaid://1A2B3C4D5E6F7G8H9I0J
```

## 新的路径格式

### 1. showmsg 协议
- **匹配模式**: `metaid://1A2B3C4D5E6F7G8H9I0J:/protocols/showmsg`
- **使用示例**:
```typescript
const result = await buildTransaction({
  path: 'metaid://1A2B3C4D5E6F7G8H9I0J:/protocols/showmsg',
  body: 'Hello World',
  contentType: 'text/plain;utf-8'
})
```

### 2. mvcfile 协议
- **匹配模式**: `metaid://1A2B3C4D5E6F7G8H9I0J:/protocols/mvcfile`
- **使用示例**:
```typescript
const result = await buildTransaction({
  path: 'metaid://1A2B3C4D5E6F7G8H9I0J:/protocols/mvcfile',
  body: Buffer.from('file content'),
  contentType: 'application/pdf'
})
```

### 3. profile 协议
- **匹配模式**: `metaid://1A2B3C4D5E6F7G8H9I0J:/profile`
- **使用示例**:
```typescript
const result = await buildTransaction({
  path: 'metaid://1A2B3C4D5E6F7G8H9I0J:/profile/user123',
  body: JSON.stringify({ name: 'John Doe' }),
  contentType: 'application/json'
})
```

### 4. data 协议
- **匹配模式**: `metaid://1A2B3C4D5E6F7G8H9I0J:/data`
- **使用示例**:
```typescript
const result = await buildTransaction({
  path: 'metaid://1A2B3C4D5E6F7G8H9I0J:/data/app/settings',
  body: JSON.stringify({ theme: 'dark' }),
  contentType: 'application/json'
})
```

## 技术实现

### 正则表达式转义
为了正确处理 `AddressHost` 中可能包含的特殊字符，系统会自动转义正则表达式中的特殊字符：

```typescript
const escapedAddressHost = AddressHost ? AddressHost.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : ''
const pattern = new RegExp(`${escapedAddressHost}:/protocols/showmsg`, 'i')
```

### 动态模式匹配
系统支持两种匹配方式：
1. **字符串匹配**: 检查 path 是否包含指定字符串
2. **正则表达式匹配**: 使用正则表达式进行精确匹配

### 协议识别流程
1. 优先使用明确的 `protocol` 参数
2. 根据 `path` 进行模式匹配
3. 如果没有匹配的规则，使用默认的 `createPin` 处理

## 扩展新协议

### 添加新协议规则
```typescript
const { registerProtocolRule } = useBuildTx()
const AddressHost = import.meta.env.VITE_ADDRESS_HOST

registerProtocolRule('nft', {
  pattern: new RegExp(`${AddressHost ? AddressHost.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : ''}:/nft`, 'i'),
  handler: async (params) => {
    return await createPin({
      operation: params.operation || 'create',
      body: params.body,
      path: params.path || `${AddressHost}:/nft`,
      contentType: params.contentType || 'application/json',
    }, params.options || {})
  },
  description: 'NFT 协议处理',
  defaultOptions: {
    chain: 'btc',
    network: 'mainnet',
    signMessage: 'Create NFT'
  }
})
```

### 使用新协议
```typescript
const result = await buildTransaction({
  path: 'metaid://1A2B3C4D5E6F7G8H9I0J:/nft/token123',
  body: JSON.stringify({
    name: 'My NFT',
    description: 'A unique digital asset'
  }),
  contentType: 'application/json'
})
```

## 测试示例

### Vue 组件测试
```vue
<template>
  <div>
    <h3>路径格式测试</h3>
    
    <div>
      <label>AddressHost:</label>
      <input v-model="addressHost" placeholder="metaid://1A2B3C4D5E6F7G8H9I0J" />
    </div>
    
    <div>
      <label>协议路径:</label>
      <input v-model="protocolPath" placeholder="/protocols/showmsg" />
    </div>
    
    <div>
      <label>完整路径:</label>
      <input :value="fullPath" readonly />
    </div>
    
    <button @click="testProtocol">测试协议识别</button>
    
    <div v-if="result">
      <h4>识别结果:</h4>
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBuildTx } from '@/hooks/use-build-tx'

const { getRegisteredProtocols } = useBuildTx()

const addressHost = ref('metaid://1A2B3C4D5E6F7G8H9I0J')
const protocolPath = ref('/protocols/showmsg')
const result = ref(null)

const fullPath = computed(() => `${addressHost.value}:${protocolPath.value}`)

const testProtocol = () => {
  const protocols = getRegisteredProtocols()
  const testPath = fullPath.value
  
  // 模拟协议识别逻辑
  const matchedProtocol = protocols.find(protocol => {
    const pattern = new RegExp(protocol.pattern, 'i')
    return pattern.test(testPath)
  })
  
  result.value = {
    testPath,
    matchedProtocol,
    allProtocols: protocols
  }
}
</script>
```

## 注意事项

1. **环境变量**: 确保在 `.env` 文件中正确设置 `VITE_ADDRESS_HOST`
2. **路径格式**: 使用 `${AddressHost}:${path}` 的格式
3. **特殊字符**: 系统会自动处理 `AddressHost` 中的特殊字符
4. **向后兼容**: 仍然支持明确的 `protocol` 参数
5. **默认处理**: 如果没有匹配的协议规则，会使用默认的 `createPin` 处理

## 优势

1. **动态配置**: 通过环境变量动态配置地址主机
2. **精确匹配**: 使用正则表达式进行精确的路径匹配
3. **灵活扩展**: 可以轻松添加新的协议规则
4. **自动转义**: 自动处理特殊字符的转义
5. **调试友好**: 提供详细的日志输出用于调试

这种设计让您可以创建 `path:metaid://1A2B3C4D5E6F7G8H9I0J:/protocols/showmsg` 这样的协议，然后直接调用 `buildTransaction` 传入参数就能自动上链！

