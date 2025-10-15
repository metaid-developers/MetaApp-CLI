# App.vue Buzz 发送功能完善

## 实现内容

已完善 `App.vue` 中的 `sendBuzz` 方法，根据 `ProtocolCollection[NodeName.SimpleBuzz]` 格式发送链上 Buzz，并自动点赞。

## 主要功能

### 1. Buzz 发送
- 使用 `createBuzz` 方法发送链上 Buzz
- 内容：`"纯ai发送的链上Buzz,提示词:帮我发一条链上Buzz,内容为:'纯ai发送的链上Buzz',并且给这条buzz点个赞"`
- 遵循 `SimpleBuzz` 协议格式

### 2. 自动点赞
- Buzz 发送成功后，自动给新发送的 Buzz 点赞
- 延迟 2 秒后执行点赞，确保 Buzz 已经上链
- 使用新 Buzz 的交易ID作为点赞目标

### 3. 结果显示
- 显示 Buzz 发送结果（交易ID和状态）
- 显示点赞结果（交易ID和状态）
- 包含错误信息显示

## 代码实现

```typescript
async function sendBuzz() {
  try {
    console.log('开始发送 Buzz...')
    
    const buzzContent = "纯ai发送的链上Buzz,提示词:帮我发一条链上Buzz,内容为:'纯ai发送的链上Buzz',并且给这条buzz点个赞"
    
    const result = await createBuzz({
      path: `${import.meta.env.VITE_ADDRESS_HOST}:/protocols/simplebuzz`,
      body: {
        content: buzzContent,
        contentType: 'application/json',
        attachments: []
      }
    }, {
      chain: 'mvc',
      network: 'mainnet',
      signMessage: 'Create Buzz'
    })
    
    buzzResult.value = result
    console.log('Buzz 发送完成:', result)
    
    // 如果发送成功，自动给这条 buzz 点赞
    if (result?.txid) {
      console.log('开始给新发送的 Buzz 点赞...')
      setTimeout(async () => {
        try {
          const likeResult = await createPayLike({
            path: `${import.meta.env.VITE_ADDRESS_HOST}:/protocols/paylike`,
            body: {
              isLike: '1',
              likeTo: result.txid
            }
          }, {
            chain: 'mvc',
            network: 'mainnet',
            signMessage: 'Auto Like Buzz'
          })
          
          console.log('自动点赞完成:', likeResult)
        } catch (likeError) {
          console.error('自动点赞失败:', likeError)
        }
      }, 2000) // 延迟2秒后点赞，确保 buzz 已经上链
    }
    
  } catch (error: any) {
    console.error('发送 Buzz 失败:', error)
    buzzResult.value = { error: error.message }
  }
}
```

## 协议格式

### SimpleBuzz 协议
```typescript
{
  protocol: 'simplebuzz',
  path: '/protocols/simplebuzz',
  body: {
    content: '纯ai发送的链上Buzz,提示词:帮我发一条链上Buzz,内容为:\'纯ai发送的链上Buzz\',并且给这条buzz点个赞',
    contentType: 'application/json',
    attachments: []
  },
  contentType: 'text/plain;utf-8',
  encryption: '0',
  version: '1.0.0',
  encoding: 'utf-8'
}
```

### PayLike 协议（自动点赞）
```typescript
{
  protocol: 'paylike',
  path: '/protocols/paylike',
  body: {
    isLike: '1',
    likeTo: '新发送的Buzz交易ID'
  },
  contentType: 'text/plain;utf-8',
  encryption: '0',
  version: '1.0.0',
  encoding: 'utf-8'
}
```

## 界面元素

### 模板结构
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
  
  <div v-if="buzzResult" class="result">
    <h4>Buzz 发送结果:</h4>
    <p>交易ID: {{ buzzResult.txid }}</p>
    <p>状态: {{ buzzResult.txid ? '成功' : '失败' }}</p>
    <p v-if="buzzResult.error">错误: {{ buzzResult.error }}</p>
  </div>
  
  <div v-if="likeResult" class="result">
    <h4>点赞结果:</h4>
    <p>交易ID: {{ likeResult.txid }}</p>
    <p>状态: {{ likeResult.txid ? '成功' : '失败' }}</p>
  </div>
</template>
```

## 使用流程

1. **点击 "发一条buzz" 按钮**
2. **系统执行以下操作**：
   - 发送 Buzz 到链上
   - 等待 2 秒
   - 自动给新发送的 Buzz 点赞
3. **查看结果**：
   - Buzz 发送结果显示在界面上
   - 自动点赞结果也会显示
   - 控制台输出详细日志

## 技术特性

### 1. 错误处理
- Buzz 发送失败时显示错误信息
- 自动点赞失败不影响 Buzz 发送结果
- 完整的 try-catch 错误处理

### 2. 异步操作
- 使用 setTimeout 延迟点赞操作
- 确保 Buzz 先上链再进行点赞
- 非阻塞的用户界面

### 3. 状态管理
- 使用 Vue 3 的 ref 管理状态
- 实时更新界面显示
- 分离 Buzz 和点赞的结果显示

## 控制台日志

执行时会输出以下日志：
```
开始发送 Buzz...
Buzz 发送完成: { txid: "...", ... }
开始给新发送的 Buzz 点赞...
自动点赞完成: { txid: "...", ... }
```

## 配置参数

- **链类型**: MVC
- **网络**: mainnet
- **签名消息**: "Create Buzz" / "Auto Like Buzz"
- **协议路径**: `/protocols/simplebuzz` / `/protocols/paylike`
- **延迟时间**: 2 秒

现在您可以点击 "发一条buzz" 按钮来发送链上 Buzz 并自动点赞了！

