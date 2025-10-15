# Metalet 钱包快速开始 ⚡

## 🎯 3 分钟完成钱包集成测试

### 第 1 步：安装 Metalet 钱包（2分钟）

1. **访问 Chrome 扩展商店**
   ```
   https://chromewebstore.google.com/detail/metalet/lbjapbcmmceacocpimbpbidpgmlmoaao
   ```

2. **点击"添加到 Chrome"**

3. **设置钱包**
   - 创建新钱包或导入现有钱包
   - 设置密码
   - ⚠️ **重要：备份助记词！**

### 第 2 步：启动项目（30秒）

```bash
# 切换到正确的 Node.js 版本
nvm use 20.19.1

# 一键启动
./dev.sh
```

看到以下输出表示成功：
```
✓ Node.js: v20.19.1
✓ npm: 10.8.2

VITE v7.1.9  ready in 467 ms
➜  Local:   http://localhost:5173/
➜  Vue DevTools: http://localhost:5173/__devtools__/
```

### 第 3 步：连接钱包（30秒）

1. **浏览器打开**
   ```
   http://localhost:5173
   ```

2. **点击右上角 "Connect Wallet" 按钮**

3. **在 Metalet 弹窗中**
   - 点击 "连接" 或 "Connect"
   - 授权应用访问钱包

4. **完成！** 🎉
   - 页面显示您的地址
   - 显示 BTC 余额
   - 钱包连接成功

## 🎨 界面预览

### 右上角钱包按钮

**未连接时：**
```
┌───────────────────┐
│  ⚡ Connect Wallet │
└───────────────────┘
```

**连接后：**
```
┌────────────────────────────┐
│ 🟢 0.00001234 BTC 1AB...xy ▼│
└────────────────────────────┘
```

**点击展开菜单：**
```
┌─────────────────────────────┐
│ 我的地址                     │
│ 1ABCxxxxxxxxxxxxxxxxxxy123  │
│ (点击复制)                   │
├─────────────────────────────┤
│ 已确认: 0.00001234 BTC      │
│ 未确认: 0.00000000 BTC      │
│ 总计:   0.00001234 BTC      │
├─────────────────────────────┤
│ 🔄 刷新余额                  │
│ 📋 复制地址                  │
├─────────────────────────────┤
│ 🔌 断开连接                  │
└─────────────────────────────┘
```

## ✨ 核心功能

### 1. 自动检测钱包

- ✅ 未安装：显示安装按钮
- ✅ 已安装但未连接：显示连接按钮
- ✅ 已连接：显示钱包信息

### 2. 余额显示

- ✅ 实时显示 BTC 余额
- ✅ 区分已确认/未确认
- ✅ 自动格式化（satoshis → BTC）
- ✅ 一键刷新

### 3. 地址管理

- ✅ 完整地址显示
- ✅ 短地址显示（前6后4）
- ✅ 一键复制
- ✅ 复制成功提示

### 4. 网络指示

- ✅ 🟢 绿色圆点 = 主网
- ✅ 🟠 橙色圆点 = 测试网
- ✅ 自动跟随 Metalet 网络切换

### 5. 自动更新

- ✅ 切换账户时自动刷新
- ✅ 切换网络时自动刷新
- ✅ 无需手动刷新页面

## 🔧 开发者功能

### 在代码中使用钱包

```vue
<script setup lang="ts">
import { useWalletStore } from '@/stores/wallet'

const walletStore = useWalletStore()

// 获取连接状态
const isConnected = walletStore.isConnected

// 获取地址
const address = walletStore.account?.address

// 获取余额
const balance = walletStore.balance?.total

// 签名消息
const signMyMessage = async () => {
  const result = await walletStore.signMessage('Hello MetaID!')
  console.log('签名:', result.signature)
}
</script>

<template>
  <div v-if="walletStore.isConnected">
    <p>地址: {{ walletStore.shortAddress }}</p>
    <p>余额: {{ (balance / 100000000).toFixed(8) }} BTC</p>
    <button @click="signMyMessage">签名消息</button>
  </div>
</template>
```

### 钱包 Store API

```typescript
import { useWalletStore } from '@/stores/wallet'

const wallet = useWalletStore()

// 状态
wallet.isConnected       // 是否已连接
wallet.account          // 账户信息
wallet.balance          // 余额信息
wallet.shortAddress     // 短地址
wallet.network          // 当前网络

// 方法
await wallet.connect()           // 连接钱包
await wallet.disconnect()        // 断开连接
await wallet.fetchBalance()      // 刷新余额
await wallet.signMessage(msg)    // 签名消息
wallet.isMetaletInstalled()      // 检查是否安装
```

## 🐛 常见问题

### Q: 显示"未检测到 Metalet 钱包"？

**解决方案：**
1. 确认已安装 Metalet 扩展
2. 刷新页面（Cmd/Ctrl + R）
3. 检查扩展是否启用：
   - 浏览器地址栏 → 扩展图标 → 管理扩展
   - 确保 Metalet 开关打开

### Q: 点击连接没有弹窗？

**解决方案：**
1. 检查浏览器是否阻止弹窗
2. 点击地址栏的弹窗图标
3. 允许该网站弹窗

### Q: 余额显示为 0？

**原因：**
- 钱包确实没有余额（正常）
- 或网络连接问题

**验证：**
1. 打开 Metalet 扩展
2. 查看钱包内余额
3. 如果不一致，点击 "刷新余额"

### Q: 切换账户后没有更新？

**解决方案：**
1. 刷新页面
2. 检查控制台是否有错误
3. 重新连接钱包

## 📊 测试清单

完成以下测试确认功能正常：

- [ ] ✅ 能检测到 Metalet 钱包
- [ ] ✅ 点击连接成功
- [ ] ✅ 显示正确的地址
- [ ] ✅ 显示正确的余额
- [ ] ✅ 可以复制地址
- [ ] ✅ 可以刷新余额
- [ ] ✅ 可以断开连接
- [ ] ✅ 切换账户自动更新
- [ ] ✅ 网络指示器正确

## 🔗 相关资源

- **完整集成指南**: [METALET_INTEGRATION.md](./METALET_INTEGRATION.md)
- **详细测试步骤**: [WALLET_TEST_GUIDE.md](./WALLET_TEST_GUIDE.md)
- **Metalet GitHub**: https://github.com/metalet-labs/metalet-extension-next
- **Chrome 扩展**: https://chromewebstore.google.com/detail/metalet/lbjapbcmmceacocpimbpbidpgmlmoaao

## 🎉 下一步

钱包集成完成后，您可以：

1. **构建 NFT 市场**
2. **实现 Token 转账**
3. **添加交易历史**
4. **集成其他 MetaID 协议功能**

参考完整 API 文档开始构建您的 Web3 应用！

---

**立即开始：** `./dev.sh` → 浏览器打开 → 点击 "Connect Wallet" → ✅

