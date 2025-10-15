# App.vue 点赞功能实现

## 实现内容

已在 `App.vue` 中添加了点赞功能，点击按钮可以向指定的 pinid 进行点赞操作。

## 主要功能

### 1. 界面元素
- 添加了点赞按钮：`👍 点赞测试`
- 添加了结果显示区域，显示交易ID和状态

### 2. 点赞功能
- 调用 `createPayLike` 方法
- 向指定的 pinid `c322798cfe8189624aa3dbc0e62afda6e4bc3cd17bed30f61f31ff8acf5564e2i0` 进行点赞
- 使用 MVC 链和 mainnet 网络

### 3. 错误处理
- 包含完整的 try-catch 错误处理
- 在控制台输出详细日志
- 在界面上显示操作结果

## 代码实现

```vue
<template>
  <div>
    <div class="flex flex-row items-center justify-end bg-[#fff] p-3">
      <LoginedUserOperateVue />
    </div>
    <ConnectWalletModalVue />
  </div>

  <div @click="sendBuzz">发一条buzz</div>
  
  <div @click="likeBuzz" class="like-button">
    👍 点赞测试
  </div>
  
  <div v-if="likeResult" class="result">
    <h4>点赞结果:</h4>
    <p>交易ID: {{ likeResult.txid }}</p>
    <p>状态: {{ likeResult.txid ? '成功' : '失败' }}</p>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import ConnectWalletModalVue from '@/components/ConnectWalletModal/ConnectWalletModal.vue'
import LoginedUserOperateVue from '@/components/LoginUserOperate/LoginUserOperate.vue'
import { useCreateProtocols } from '@/hooks/use-create-protocols'

const { createPayLike } = useCreateProtocols()
const likeResult = ref<any>(null)

async function sendBuzz() {
  // 原有的发 buzz 功能
}

async function likeBuzz() {
  try {
    console.log('开始点赞操作...')
    
    const result = await createPayLike({
      path: `${import.meta.env.VITE_ADDRESS_HOST}:/protocols/paylike`,
      body: {
        isLike: '1',
        likeTo: 'c322798cfe8189624aa3dbc0e62afda6e4bc3cd17bed30f61f31ff8acf5564e2i0'
      }
    }, {
      chain: 'mvc',
      network: 'mainnet',
      signMessage: 'Pay Like'
    })
    
    likeResult.value = result
    console.log('点赞操作完成:', result)
  } catch (error) {
    console.error('点赞操作失败:', error)
    likeResult.value = { error: error.message }
  }
}
</script>

<style lang='scss' scoped>
.like-button {
  margin: 20px;
  padding: 12px 24px;
  background: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 8px;
  cursor: pointer;
  display: inline-block;
  transition: all 0.2s;
  font-size: 16px;
  color: #1976d2;
}

.like-button:hover {
  background: #bbdefb;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
}

.result {
  margin: 20px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #4caf50;
}

.result h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 18px;
}

.result p {
  margin: 5px 0;
  font-family: monospace;
  font-size: 14px;
  color: #666;
}
</style>
```

## 使用说明

1. **点击按钮**：点击 "👍 点赞测试" 按钮
2. **查看控制台**：在浏览器控制台查看详细的操作日志
3. **查看结果**：操作完成后会在按钮下方显示结果

## 点赞数据

- **目标 PinID**: `c322798cfe8189624aa3dbc0e62afda6e4bc3cd17bed30f61f31ff8acf5564e2i0`
- **点赞状态**: `isLike: '1'` (点赞)
- **协议路径**: `${VITE_ADDRESS_HOST}:/protocols/paylike`
- **链类型**: MVC
- **网络**: mainnet

## 样式特性

- **按钮样式**: 蓝色主题，带悬停效果
- **结果展示**: 绿色边框，清晰的交易信息显示
- **响应式**: 支持悬停和点击效果

## 错误处理

- 网络错误会在控制台显示
- 交易失败会在界面上显示错误信息
- 所有操作都有详细的控制台日志

现在您可以点击 "👍 点赞测试" 按钮来测试点赞功能了！

