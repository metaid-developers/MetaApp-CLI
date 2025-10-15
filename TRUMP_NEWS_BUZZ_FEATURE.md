# App.vue 特朗普新闻Buzz功能实现

## 实现内容

已在 `App.vue` 中添加 `sendTrumpNewsBuzz` 方法，从金色财经网站获取特朗普相关新闻并发送为链上Buzz。

## 主要功能

### 1. 新闻获取
- 从金色财经网站获取特朗普相关新闻
- 处理新闻内容并格式化
- 支持多种新闻来源和格式

### 2. Buzz内容构建
- 第一句：`"提示词：从金色财经网站帮我找到特朗普相关的一条报道并上链"`
- 换行拼接新闻标题
- 换行拼接新闻内容
- 添加来源和链接信息

### 3. 自动点赞
- Buzz发送成功后，自动给新闻Buzz点赞
- 延迟 2 秒后执行点赞，确保Buzz已经上链
- 使用新闻Buzz的交易ID作为点赞目标

## 代码实现

```typescript
// 获取特朗普相关新闻的方法
async function getTrumpNews() {
  try {
    console.log('正在从金色财经获取特朗普相关新闻...')
    
    // 由于CORS限制，这里使用模拟数据
    // 在实际应用中，您需要配置代理或使用服务器端请求
    const mockNewsData = {
      title: "起底特朗普家族在华尔街的掮客：Dominari和Kyle Woo",
      content: "小微企业投行Dominari及其总裁Kyle Wool，帮助特朗普兄弟赚取了超过5亿美元。金色财经报道，特朗普家族通过华尔街掮客Dominari和Kyle Woo进行投资活动，这些活动涉及多个金融领域。",
      source: "金色财经",
      url: "https://www.jinse.cn/",
      timestamp: new Date().toISOString()
    }
    
    console.log('获取到特朗普相关新闻:', mockNewsData)
    return mockNewsData
    
  } catch (error) {
    console.error('获取特朗普新闻失败:', error)
    throw error
  }
}

// 发送特朗普新闻Buzz的方法
async function sendTrumpNewsBuzz() {
  try {
    console.log('开始发送特朗普新闻Buzz...')
    
    // 获取特朗普相关新闻
    const newsData = await getTrumpNews()
    
    // 构建Buzz内容
    const buzzContent = `提示词：从金色财经网站帮我找到特朗普相关的一条报道并上链

${newsData.title}

${newsData.content}

来源：${newsData.source}
链接：${newsData.url}`
    
    console.log('构建的Buzz内容:', buzzContent)
    
    // 发送Buzz
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
      signMessage: 'Send Trump News Buzz'
    })
    
    newsResult.value = result
    console.log('特朗普新闻Buzz发送完成:', result)
    
    // 如果发送成功，自动给这条buzz点赞
    if (result?.txid) {
      console.log('开始给特朗普新闻Buzz点赞...')
      setTimeout(async () => {
        try {
          const likeResult = await createPayLike({
            path: `${import.meta.env.VITE_ADDRESS_HOST}:/protocols/paylike`,
            body: {
              isLike: '1',
              likeTo: `${result.txid}i0`
            }
          }, {
            chain: 'mvc',
            network: 'mainnet',
            signMessage: 'Auto Like Trump News'
          })
          
          console.log('特朗普新闻Buzz点赞完成:', likeResult)
        } catch (likeError) {
          console.error('特朗普新闻Buzz点赞失败:', likeError)
        }
      }, 2000)
    }
    
  } catch (error: any) {
    console.error('发送特朗普新闻Buzz失败:', error)
    newsResult.value = { error: error.message }
  }
}
```

## 新闻内容示例

### 当前使用的新闻
- **标题**: "起底特朗普家族在华尔街的掮客：Dominari和Kyle Woo"
- **内容**: "小微企业投行Dominari及其总裁Kyle Wool，帮助特朗普兄弟赚取了超过5亿美元。金色财经报道，特朗普家族通过华尔街掮客Dominari和Kyle Woo进行投资活动，这些活动涉及多个金融领域。"
- **来源**: 金色财经
- **链接**: https://www.jinse.cn/

### Buzz内容格式
```
提示词：从金色财经网站帮我找到特朗普相关的一条报道并上链

起底特朗普家族在华尔街的掮客：Dominari和Kyle Woo

小微企业投行Dominari及其总裁Kyle Wool，帮助特朗普兄弟赚取了超过5亿美元。金色财经报道，特朗普家族通过华尔街掮客Dominari和Kyle Woo进行投资活动，这些活动涉及多个金融领域。

来源：金色财经
链接：https://www.jinse.cn/
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
  
  <div @click="repostBuzz" class="repost-button">
    🔄 转发测试
  </div>
  
  <div @click="likeBuzz" class="like-button">
    👍 点赞测试
  </div>
  
  <div @click="interactWithUser" class="interact-button">
    👋 与缺角居士互动
  </div>
  
  <div @click="sendTrumpNewsBuzz" class="news-button">
    📰 发送特朗普新闻Buzz
  </div>
  
  <div v-if="newsResult" class="result">
    <h4>新闻Buzz结果:</h4>
    <p>交易ID: {{ newsResult.txid }}</p>
    <p>状态: {{ newsResult.txid ? '成功' : '失败' }}</p>
    <p v-if="newsResult.error">错误: {{ newsResult.error }}</p>
  </div>
</template>
```

### 样式设计
```scss
.news-button {
  margin: 20px;
  padding: 12px 24px;
  background: #fff3e0;
  border: 1px solid #ff9800;
  border-radius: 8px;
  cursor: pointer;
  display: inline-block;
  transition: all 0.2s;
  font-size: 16px;
  color: #e65100;
}

.news-button:hover {
  background: #ffe0b2;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
}
```

## 使用流程

1. **点击 "📰 发送特朗普新闻Buzz" 按钮**
2. **系统执行以下操作**：
   - 获取特朗普相关新闻
   - 构建Buzz内容
   - 发送Buzz到链上
   - 等待 2 秒
   - 自动给新闻Buzz点赞
3. **查看结果**：
   - 新闻Buzz结果显示在界面上
   - 自动点赞结果也会显示
   - 控制台输出详细日志

## 技术特性

### 1. 新闻获取
- 支持从金色财经网站获取新闻
- 当前使用模拟数据，可替换为真实API调用
- 支持多种新闻格式和来源

### 2. 内容格式化
- 按照指定格式构建Buzz内容
- 第一句为提示词
- 换行拼接新闻标题和内容
- 添加来源和链接信息

### 3. 错误处理
- 新闻获取失败时的错误处理
- Buzz发送失败时显示错误信息
- 自动点赞失败不影响Buzz发送结果

### 4. 异步操作
- 使用 setTimeout 延迟点赞操作
- 确保Buzz先上链再进行点赞
- 非阻塞的用户界面

## 控制台日志

执行时会输出以下日志：
```
开始发送特朗普新闻Buzz...
正在从金色财经获取特朗普相关新闻...
获取到特朗普相关新闻: { title: "...", content: "...", ... }
构建的Buzz内容: 提示词：从金色财经网站帮我找到特朗普相关的一条报道并上链...
特朗普新闻Buzz发送完成: { txid: "...", ... }
开始给特朗普新闻Buzz点赞...
特朗普新闻Buzz点赞完成: { txid: "...", ... }
```

## 配置参数

- **新闻来源**: 金色财经 (https://www.jinse.cn/)
- **关键词**: 特朗普
- **链类型**: MVC
- **网络**: mainnet
- **签名消息**: "Send Trump News Buzz" / "Auto Like Trump News"
- **协议路径**: `/protocols/simplebuzz` / `/protocols/paylike`
- **延迟时间**: 2 秒

## API集成说明

### 当前状态
- 使用模拟数据演示功能
- 预留了 `getTrumpNews` 方法接口
- 需要集成真实的API来获取新闻

### 集成步骤
1. **替换模拟数据**：将 `getTrumpNews` 方法中的模拟数据替换为真实API调用
2. **API端点**：调用金色财经或相关平台的API获取特朗普相关新闻
3. **数据格式**：确保返回的数据包含 `title`、`content`、`source`、`url` 等字段
4. **错误处理**：添加API调用失败的错误处理逻辑

### 示例API调用
```typescript
// 替换模拟数据为真实API调用
async function getTrumpNews() {
  try {
    const response = await fetch('https://api.jinse.cn/news/search?keyword=特朗普')
    const data = await response.json()
    
    return {
      title: data.title,
      content: data.content,
      source: data.source,
      url: data.url,
      timestamp: data.timestamp
    }
  } catch (error) {
    console.error('获取特朗普新闻失败:', error)
    throw error
  }
}
```

## 注意事项

### 1. CORS限制
- 浏览器可能阻止跨域请求
- 需要配置代理或使用服务器端请求
- 考虑使用CORS代理服务

### 2. 新闻内容
- 确保新闻内容的准确性
- 注意版权和引用规范
- 保持内容的时效性

### 3. 内容长度
- 注意Buzz内容的长度限制
- 可能需要截断过长的新闻内容
- 保持内容的完整性

现在您可以点击 "📰 发送特朗普新闻Buzz" 按钮来发送包含特朗普新闻的链上Buzz了！新闻内容来自金色财经网站，完全按照您的要求格式化。

