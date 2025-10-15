# Metalet 钱包检测机制说明

## 🎯 为什么需要异步轮询？

浏览器扩展（如 Metalet 钱包）注入到网页的 `window` 对象需要时间，通常有几种情况：

1. **扩展加载延迟** - 浏览器启动扩展需要时间
2. **内容脚本注入延迟** - 扩展脚本注入到页面需要时间
3. **网络加载顺序** - 页面 JavaScript 可能比扩展先执行

因此，简单的同步检查 `window.metaidwallet` 可能会得到 `undefined`，即使扩展已经安装。

## 🔄 轮询检测机制

### 实现原理

```typescript
// 异步检测 Metalet 钱包（带重试机制）
const waitForMetalet = async (maxRetries = 50, interval = 300): Promise<boolean> => {
  return new Promise((resolve) => {
    let retries = 0
    
    const checkMetalet = () => {
      // 检测是否已注入
      if (typeof window !== 'undefined' && window.metaidwallet) {
        console.log(`✅ Metalet 钱包检测成功（第 ${retries + 1} 次尝试）`)
        resolve(true)
        return
      }
      
      retries++
      
      // 超时判断
      if (retries >= maxRetries) {
        const timeoutSeconds = (maxRetries * interval) / 1000
        console.log(`⏱️ Metalet 钱包检测超时（${timeoutSeconds}秒）`)
        resolve(false)
        return
      }
      
      // 继续轮询
      setTimeout(checkMetalet, interval)
    }
    
    checkMetalet()
  })
}
```

### 参数说明

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `maxRetries` | 50 | 最大重试次数 |
| `interval` | 300 | 重试间隔（毫秒） |
| 总超时时间 | 15秒 | maxRetries × interval ÷ 1000 |

### 使用场景

#### 场景 1：页面初始化

```typescript
// 在组件挂载时
onMounted(async () => {
  isDetecting.value = true
  
  // 等待 Metalet 注入（最多 15 秒）
  await walletStore.init()
  
  isDetecting.value = false
})
```

**用户体验：**
```
页面加载 → 显示"检测钱包中..." → 检测成功 → 显示钱包按钮
                                  ↓
                          （或超时后显示安装提示）
```

#### 场景 2：连接钱包时

```typescript
// 点击连接按钮时
const connect = async () => {
  isConnecting.value = true
  
  // 再次确认 Metalet 可用（最多 6 秒）
  const isAvailable = await waitForMetalet(20, 300)
  
  if (!isAvailable) {
    error.value = '未检测到 Metalet 钱包'
    return
  }
  
  // 调用连接 API
  const result = await window.metaidwallet!.connect()
  // ...
}
```

**用户体验：**
```
点击按钮 → 按钮显示"连接中..." → 检测 Metalet → 弹出授权 → 连接成功
```

## 📊 检测时序图

```
时间轴（毫秒）
0ms     页面加载，开始检测
        ↓
300ms   第 1 次检查 → 未找到
        ↓
600ms   第 2 次检查 → 未找到
        ↓
900ms   第 3 次检查 → ✅ 找到！
        ↓
        返回 true，停止轮询
```

**最坏情况（未安装）：**
```
0ms     开始检测
        ↓
3000ms  第 10 次检查（输出日志）
        ↓
6000ms  第 20 次检查（输出日志）
        ↓
15000ms 第 50 次检查 → 超时
        ↓
        返回 false
```

## 🎨 UI 状态流转

### 状态 1：检测中（0-15秒）

```
┌───────────────────────┐
│ ⏳ 检测钱包中...      │
└───────────────────────┘
```

**实现：**
```vue
<div v-if="isDetecting">
  <button disabled>
    <spinner-icon />
    检测钱包中...
  </button>
</div>
```

### 状态 2：未安装（检测超时）

```
┌───────────────────────┐
│ ⚠️ 安装 Metalet       │
└───────────────────────┘
```

**实现：**
```vue
<div v-else-if="!walletStore.isMetaletInstalled()">
  <button @click="openDownload">
    安装 Metalet
  </button>
</div>
```

### 状态 3：已安装未连接

```
┌───────────────────────┐
│ ⚡ Connect Wallet     │
└───────────────────────┘
```

### 状态 4：已连接

```
┌────────────────────────────┐
│ 🟢 0.00001234 BTC 1AB...xy │
└────────────────────────────┘
```

## 🔧 配置优化

### 快速检测（适合大部分情况）

```typescript
// 最多等待 3 秒
await waitForMetalet(10, 300)
```

**适用场景：**
- 用户已经打开过页面（Metalet 已加载）
- 网络状况良好
- 扩展正常工作

### 标准检测（默认）

```typescript
// 最多等待 15 秒
await waitForMetalet(50, 300)
```

**适用场景：**
- 首次访问页面
- 扩展可能加载较慢
- 提供充足的等待时间

### 快速失败（仅用于测试）

```typescript
// 最多等待 1.5 秒
await waitForMetalet(5, 300)
```

**适用场景：**
- 开发测试
- 快速失败反馈

## 📝 日志输出

### 正常情况（快速检测成功）

```javascript
🔍 开始检测 Metalet 钱包...
🔍 检测 Metalet 钱包... (1/50)
✅ Metalet 钱包检测成功（第 2 次尝试）
ℹ️ 钱包未连接（正常状态）
```

### 检测较慢（需要多次重试）

```javascript
🔍 开始检测 Metalet 钱包...
🔍 检测 Metalet 钱包... (1/50)
🔍 检测 Metalet 钱包... (10/50)
✅ Metalet 钱包检测成功（第 12 次尝试）
```

### 检测失败（未安装）

```javascript
🔍 开始检测 Metalet 钱包...
🔍 检测 Metalet 钱包... (1/50)
🔍 检测 Metalet 钱包... (10/50)
🔍 检测 Metalet 钱包... (20/50)
🔍 检测 Metalet 钱包... (30/50)
🔍 检测 Metalet 钱包... (40/50)
⏱️ Metalet 钱包检测超时（15秒）
❌ 未检测到 Metalet 钱包
```

## 🐛 故障排除

### Q: 为什么需要等 15 秒？

**A:** 虽然大部分情况下 1-2 秒就能检测到，但为了覆盖以下情况：
- 慢速网络
- 浏览器性能较差
- 扩展首次加载
- 系统资源紧张

15 秒是一个安全的超时时间。

### Q: 可以缩短超时时间吗？

**A:** 可以！根据您的需求调整：

```typescript
// 快速模式（3秒）
await waitForMetalet(10, 300)

// 标准模式（6秒）
await waitForMetalet(20, 300)

// 保守模式（15秒）- 默认
await waitForMetalet(50, 300)
```

### Q: 检测成功后为什么还要再检查？

**A:** 在 `connect()` 方法中再次检查是为了：
- 用户可能在检测后禁用了扩展
- 确保连接时 Metalet 仍然可用
- 提供更准确的错误信息

### Q: 如何优化检测性能？

**A:** 可以添加缓存机制：

```typescript
let metaletDetected = false

const waitForMetalet = async (...) => {
  // 如果已经检测过，直接返回
  if (metaletDetected && isMetaletInstalled()) {
    return true
  }
  
  // 执行检测逻辑...
  
  if (检测成功) {
    metaletDetected = true
    return true
  }
}
```

## 📊 性能分析

### 最佳情况

- **第 1 次检查**：立即找到（0-300ms）
- **用户体验**：几乎无感知
- **日志**：`✅ Metalet 钱包检测成功（第 1 次尝试）`

### 一般情况

- **第 2-5 次检查**：1-1.5 秒
- **用户体验**：看到短暂的"检测中..."
- **日志**：`✅ Metalet 钱包检测成功（第 3 次尝试）`

### 较慢情况

- **第 10-20 次检查**：3-6 秒
- **用户体验**：明显的等待时间，但可接受
- **日志**：每 10 次输出进度

### 超时情况

- **第 50 次检查**：15 秒后超时
- **用户体验**：显示安装提示
- **日志**：`⏱️ Metalet 钱包检测超时（15秒）`

## 🎓 最佳实践

### 1. 在页面初始化时使用长超时

```typescript
// App.vue 或根组件
onMounted(async () => {
  // 给予充足的时间（15秒）
  await walletStore.init()
})
```

### 2. 在用户操作时使用短超时

```typescript
// 连接按钮点击时
const connect = async () => {
  // 快速检测（6秒）
  const isAvailable = await waitForMetalet(20, 300)
  if (!isAvailable) {
    alert('请确保 Metalet 扩展已安装并启用')
    return
  }
  // ...
}
```

### 3. 提供重试选项

```vue
<div v-if="!metaletDetected">
  <p>未检测到 Metalet 钱包</p>
  <button @click="retry">重新检测</button>
</div>
```

### 4. 显示加载进度（可选）

```vue
<div v-if="isDetecting">
  <spinner />
  <p>检测钱包中... {{ retryCount }}/50</p>
  <progress :value="retryCount" max="50"></progress>
</div>
```

## 🔗 相关代码

- **Store 实现**: `src/stores/wallet.ts`
- **组件使用**: `src/components/ConnectWallet.vue`
- **类型定义**: `src/types/metalet.d.ts`

## 📚 参考资源

- **Metalet GitHub**: https://github.com/metalet-labs/metalet-extension-next
- **集成指南**: [METALET_INTEGRATION.md](./METALET_INTEGRATION.md)
- **测试指南**: [WALLET_TEST_GUIDE.md](./WALLET_TEST_GUIDE.md)

## 🎉 总结

通过实现异步轮询检测机制：

✅ **可靠性提升** - 即使扩展加载慢也能检测到  
✅ **用户体验好** - 显示检测状态，不会让用户困惑  
✅ **容错性强** - 处理各种网络和性能情况  
✅ **日志清晰** - 方便调试和问题定位  

---

**推荐配置：** 页面初始化 15秒超时，用户操作 6秒超时，提供最佳的用户体验！

