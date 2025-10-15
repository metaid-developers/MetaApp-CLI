# PayLike 点赞协议实现

## 概述

已在 `use-create-protocols.ts` 中添加了 `createPayLike` 方法，用于实现向某条 buzz 点赞的功能。

## 实现详情

### 1. 协议配置

在 `constants.ts` 中已定义了 `PayLike` 协议：

```typescript
[NodeName.PayLike]: {
    protocol: 'paylike',
    path: '/protocols/paylike',
    body: {
        isLike: '1',    // 1 点赞 0 取消点赞
        likeTo: ''      // 要指定点赞的buzz PinID
    },
    contentType: 'text/plain;utf-8',
    encryption: '0',
    version: '1.0.0',
    encoding: 'utf-8'
}
```

### 2. createPayLike 方法

```typescript
async function createPayLike(metaidData: Omit<MetaidData, 'revealAddr'>, options: CreatePinOptions = {}) {
    registerProtocolRule(ProtocolCollection[NodeName.PayLike].protocol, {
        pattern: new RegExp(`${AddressHost ? AddressHost.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : ''}:/protocols/paylike`, 'i'),
        handler: async (metaidData) => {
            console.log('👍 [PayLike] Processing paylike protocol')
            return await createPin({
                operation: metaidData.operation || 'create',
                body: metaidData.body,
                path: metaidData.path || `${AddressHost}:/protocols/paylike`,
                contentType: metaidData.contentType || 'text/plain;utf-8',
                encryption: metaidData.encryption || '0',
                version: metaidData.version || '1.0.0',
                encoding: metaidData.encoding || 'utf-8'
            }, metaidData.options || {})
        },
        description: '点赞协议处理',
        defaultOptions: {
            chain: options.chain || 'mvc',
            network: options.network || 'mainnet',
            signMessage: 'Pay Like'
        }
    })

    const result = await buildTransaction({
        path: metaidData.path,
        body: JSON.stringify(metaidData.body),
        contentType: 'text/plain;utf-8'
    })

    console.log('createPayLike result', result)
    return result
}
```

## 使用方法

### 基础使用

```typescript
import { useCreateProtocols } from '@/hooks/use-create-protocols'

const { createPayLike } = useCreateProtocols()

// 点赞某条 buzz
const likeResult = await createPayLike({
    path: 'metaid://1A2B3C4D5E6F7G8H9I0J:/protocols/paylike',
    body: {
        isLike: '1',           // 1 表示点赞
        likeTo: 'buzz_pin_id'  // 要点赞的 buzz PinID
    },
    contentType: 'text/plain;utf-8'
}, {
    chain: 'mvc',
    network: 'mainnet'
})

console.log('点赞结果:', likeResult)
```

### 取消点赞

```typescript
// 取消点赞
const unlikeResult = await createPayLike({
    path: 'metaid://1A2B3C4D5E6F7G8H9I0J:/protocols/paylike',
    body: {
        isLike: '0',           // 0 表示取消点赞
        likeTo: 'buzz_pin_id'  // 要取消点赞的 buzz PinID
    },
    contentType: 'text/plain;utf-8'
}, {
    chain: 'mvc',
    network: 'mainnet'
})

console.log('取消点赞结果:', unlikeResult)
```

### 使用 BTC 链

```typescript
// 使用 BTC 链进行点赞
const btcLikeResult = await createPayLike({
    path: 'metaid://1A2B3C4D5E6F7G8H9I0J:/protocols/paylike',
    body: {
        isLike: '1',
        likeTo: 'buzz_pin_id'
    },
    contentType: 'text/plain;utf-8'
}, {
    chain: 'btc',
    network: 'mainnet',
    feeRate: 1
})

console.log('BTC 点赞结果:', btcLikeResult)
```

## Vue 组件示例

### 点赞按钮组件

```vue
<template>
  <div class="like-button">
    <button 
      @click="toggleLike" 
      :disabled="loading"
      :class="{ 'liked': isLiked, 'loading': loading }"
    >
      <span v-if="loading">处理中...</span>
      <span v-else>
        {{ isLiked ? '👍 已点赞' : '👍 点赞' }}
      </span>
    </button>
    
    <div v-if="result" class="result">
      <p>交易ID: {{ result.txid }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCreateProtocols } from '@/hooks/use-create-protocols'

const props = defineProps<{
  buzzPinId: string
  initialLiked?: boolean
}>()

const { createPayLike } = useCreateProtocols()

const loading = ref(false)
const result = ref(null)
const isLiked = ref(props.initialLiked || false)

const toggleLike = async () => {
  loading.value = true
  result.value = null
  
  try {
    const likeData = {
      path: `${import.meta.env.VITE_ADDRESS_HOST}:/protocols/paylike`,
      body: {
        isLike: isLiked.value ? '0' : '1',  // 切换点赞状态
        likeTo: props.buzzPinId
      },
      contentType: 'text/plain;utf-8'
    }
    
    const likeResult = await createPayLike(likeData, {
      chain: 'mvc',
      network: 'mainnet',
      signMessage: isLiked.value ? 'Cancel Like' : 'Pay Like'
    })
    
    if (likeResult?.txid) {
      isLiked.value = !isLiked.value
      result.value = likeResult
      console.log(`${isLiked.value ? '点赞' : '取消点赞'}成功:`, likeResult.txid)
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.like-button {
  display: inline-block;
}

button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

button:hover:not(:disabled) {
  background: #f0f0f0;
}

button.liked {
  background: #e3f2fd;
  border-color: #2196f3;
  color: #1976d2;
}

button.loading {
  opacity: 0.6;
  cursor: not-allowed;
}

.result {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}
</style>
```

### Buzz 列表组件

```vue
<template>
  <div class="buzz-list">
    <div v-for="buzz in buzzList" :key="buzz.id" class="buzz-item">
      <div class="buzz-content">
        <p>{{ buzz.content }}</p>
        <div class="buzz-meta">
          <span>作者: {{ buzz.author }}</span>
          <span>时间: {{ buzz.timestamp }}</span>
        </div>
      </div>
      
      <div class="buzz-actions">
        <LikeButton 
          :buzz-pin-id="buzz.pinId"
          :initial-liked="buzz.isLiked"
          @like-changed="handleLikeChanged"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LikeButton from './LikeButton.vue'

const buzzList = ref([
  {
    id: '1',
    pinId: 'buzz_pin_123',
    content: '这是一条测试 buzz 消息',
    author: '用户1',
    timestamp: '2024-01-01 12:00:00',
    isLiked: false
  },
  {
    id: '2',
    pinId: 'buzz_pin_456',
    content: '另一条测试消息',
    author: '用户2',
    timestamp: '2024-01-01 12:30:00',
    isLiked: true
  }
])

const handleLikeChanged = (buzzPinId: string, isLiked: boolean) => {
  const buzz = buzzList.value.find(b => b.pinId === buzzPinId)
  if (buzz) {
    buzz.isLiked = isLiked
  }
}
</script>

<style scoped>
.buzz-list {
  max-width: 600px;
  margin: 0 auto;
}

.buzz-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.buzz-content {
  flex: 1;
}

.buzz-content p {
  margin: 0 0 8px 0;
  font-size: 16px;
  line-height: 1.5;
}

.buzz-meta {
  font-size: 12px;
  color: #666;
}

.buzz-meta span {
  margin-right: 16px;
}

.buzz-actions {
  margin-left: 16px;
}
</style>
```

## 完整使用示例

### App.vue 中的使用

```vue
<template>
  <div>
    <div class="flex flex-row items-center justify-end bg-[#fff] p-3">
      <LoginedUserOperateVue />
    </div>
    <ConnectWalletModalVue />
    
    <div class="content">
      <h2>Buzz 点赞测试</h2>
      
      <div class="test-section">
        <h3>点赞测试</h3>
        <button @click="testLike">测试点赞</button>
        <button @click="testUnlike">测试取消点赞</button>
      </div>
      
      <div v-if="likeResult" class="result">
        <h4>点赞结果:</h4>
        <p>交易ID: {{ likeResult.txid }}</p>
        <p>状态: {{ likeResult.txid ? '成功' : '失败' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import ConnectWalletModalVue from '@/components/ConnectWalletModal/ConnectWalletModal.vue'
import LoginedUserOperateVue from '@/components/LoginUserOperate/LoginUserOperate.vue'
import { useCreateProtocols } from '@/hooks/use-create-protocols'

const { createPayLike } = useCreateProtocols()
const likeResult = ref(null)

const testLike = async () => {
  try {
    const result = await createPayLike({
      path: `${import.meta.env.VITE_ADDRESS_HOST}:/protocols/paylike`,
      body: {
        isLike: '1',
        likeTo: 'test_buzz_pin_id'
      },
      contentType: 'text/plain;utf-8'
    }, {
      chain: 'mvc',
      network: 'mainnet',
      signMessage: 'Test Like'
    })
    
    likeResult.value = result
    console.log('点赞测试结果:', result)
  } catch (error) {
    console.error('点赞测试失败:', error)
  }
}

const testUnlike = async () => {
  try {
    const result = await createPayLike({
      path: `${import.meta.env.VITE_ADDRESS_HOST}:/protocols/paylike`,
      body: {
        isLike: '0',
        likeTo: 'test_buzz_pin_id'
      },
      contentType: 'text/plain;utf-8'
    }, {
      chain: 'mvc',
      network: 'mainnet',
      signMessage: 'Test Unlike'
    })
    
    likeResult.value = result
    console.log('取消点赞测试结果:', result)
  } catch (error) {
    console.error('取消点赞测试失败:', error)
  }
}
</script>

<style lang='scss' scoped>
.content {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.test-section {
  margin: 20px 0;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.test-section button {
  margin-right: 10px;
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.test-section button:hover {
  background: #f0f0f0;
}

.result {
  margin-top: 20px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}

.result h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.result p {
  margin: 5px 0;
  font-family: monospace;
  font-size: 14px;
}
</style>
```

## 协议数据结构

### 点赞数据格式

```typescript
interface PayLikeData {
  isLike: '1' | '0'  // 1 点赞，0 取消点赞
  likeTo: string     // 要点赞的 buzz PinID
}
```

### 完整路径格式

```
metaid://{AddressHost}:/protocols/paylike
```

## 注意事项

1. **PinID 格式**: `likeTo` 字段应该是有效的 buzz PinID
2. **状态管理**: 建议在客户端维护点赞状态，避免重复操作
3. **错误处理**: 需要处理网络错误和交易失败的情况
4. **用户体验**: 提供加载状态和操作反馈
5. **链选择**: 支持 BTC 和 MVC 链，根据需求选择合适的链

## 优势

1. **标准化**: 使用统一的协议格式
2. **灵活性**: 支持点赞和取消点赞
3. **可扩展**: 可以轻松添加更多社交功能
4. **链兼容**: 支持多种区块链
5. **类型安全**: 完整的 TypeScript 支持

现在您可以使用 `createPayLike` 方法来实现向某条 buzz 点赞的功能了！

