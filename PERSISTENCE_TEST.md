# 钱包持久化测试指南

## 🧪 测试钱包连接状态持久化

### 测试环境准备

```bash
# 1. 启动项目
./dev.sh

# 2. 访问页面
http://localhost:5174

# 3. 打开浏览器控制台（F12）
```

---

## 📋 测试用例

### 测试 1：连接钱包后刷新页面

**步骤：**

1. 点击右上角 "Connect Wallet"
2. 在弹窗中勾选用户协议
3. 点击 "Metalet 钱包"
4. 在 Metalet 中确认连接
5. ✅ 连接成功，页面显示钱包信息
6. 📝 **记录当前余额和地址**
7. **刷新页面（F5 或 Cmd+R）**

**预期结果：**

✅ 钱包连接状态自动恢复  
✅ 地址显示正确  
✅ 余额显示正确（或自动刷新为最新）  
✅ 网络类型保持（主网/测试网）  
✅ 用户登录状态保持  
✅ 无需重新点击"Connect Wallet"  

**验证方法：**

```javascript
// 在控制台查看日志
✅ 从 localStorage 恢复钱包连接状态: 1ABC...
✅ 钱包连接状态已从 localStorage 恢复
💰 余额信息已更新: { total: ... }
✅ 用户登录状态已完全恢复
```

**查看 localStorage：**

```javascript
// Application → Local Storage → localhost
✅ metaid_wallet_account
✅ metaid_wallet_balance
✅ metaid_wallet_network
✅ metaid_wallet_connected = true
✅ metaid_user_info
✅ metaid_access_token
```

---

### 测试 2：退出登录后刷新页面

**步骤：**

1. 确保已登录状态
2. 点击右上角用户卡片下拉菜单
3. 点击 "断开连接"
4. ✅ 退出成功，显示 "Connect Wallet" 按钮
5. **刷新页面（F5）**

**预期结果：**

✅ 钱包连接状态未恢复（正确）  
✅ 用户登录状态未恢复（正确）  
✅ 显示 "Connect Wallet" 按钮  
✅ localStorage 中无钱包和用户数据  

**验证方法：**

```javascript
// 控制台日志
ℹ️ localStorage 中没有钱包连接状态
ℹ️ 钱包未连接（正常状态）
```

**查看 localStorage：**

```javascript
// Application → Local Storage → localhost
❌ metaid_wallet_account (已删除)
❌ metaid_wallet_balance (已删除)
❌ metaid_wallet_network (已删除)
❌ metaid_wallet_connected (已删除)
❌ metaid_user_info (已删除)
❌ metaid_access_token (已删除)
```

---

### 测试 3：在 Metalet 中切换账户

**步骤：**

1. 确保已登录状态
2. 打开 Metalet 浏览器插件
3. 切换到另一个账户
4. 观察页面变化

**预期结果：**

✅ 页面检测到账户切换  
✅ 自动清空旧的钱包连接状态  
✅ 自动清空旧的用户登录状态  
✅ 显示 "Connect Wallet" 按钮  
✅ localStorage 已清空  

**验证方法：**

```javascript
// 控制台日志
🔄 账户已切换: { address: "新地址..." }
⚠️ 账户地址已变更，清空所有本地存储
🗑️ 钱包 localStorage 已清空
✅ 本地存储已清空
ℹ️ 请重新连接钱包以登录新账户
```

**查看 localStorage：**

```javascript
// Application → Local Storage
❌ 所有 metaid_* 键都已删除
```

---

### 测试 4：关闭浏览器重新打开

**步骤：**

1. 确保已登录状态
2. **完全关闭浏览器**
3. 重新打开浏览器
4. 访问 `http://localhost:5174`

**预期结果：**

✅ 钱包连接状态自动恢复  
✅ 用户登录状态自动恢复  
✅ 无需重新连接  

> **注意：** 这取决于浏览器设置。如果浏览器设置为"退出时清除数据"，localStorage 会被清空。

---

### 测试 5：在 Metalet 中切换网络

**步骤：**

1. 确保已登录状态
2. 打开 Metalet 插件
3. 从"主网"切换到"测试网"（或反之）
4. 观察页面变化

**预期结果：**

✅ 页面检测到网络切换  
✅ 网络指示器更新（🟢主网 / 🟠测试网）  
✅ 余额自动刷新  
✅ 新网络保存到 localStorage  
✅ 钱包连接状态保持  
✅ 用户登录状态保持  

**验证方法：**

```javascript
// 控制台日志
🌐 网络已切换: testnet
💰 余额信息已更新: { total: ... }
```

**查看 localStorage：**

```javascript
localStorage.getItem('metaid_wallet_network')
// → "testnet" ✅ (已更新)
```

---

### 测试 6：余额变化后刷新

**步骤：**

1. 确保已登录状态
2. 📝 **记录当前余额**
3. 使用另一个钱包向当前地址转账
4. 等待交易确认
5. **刷新页面（F5）**

**预期结果：**

✅ 钱包连接状态恢复  
✅ 余额自动刷新为最新值  
✅ 显示正确的余额  

**验证方法：**

```javascript
// 控制台日志
✅ 钱包连接状态已从 localStorage 恢复
💰 余额信息已更新: { total: 新余额 }
```

---

### 测试 7：地址不匹配（异常情况）

**测试场景：** 模拟 localStorage 数据损坏或地址不匹配

**步骤：**

1. 确保已登录（地址 A）
2. 打开控制台，手动修改 localStorage：
   ```javascript
   const wrongAccount = { address: '假地址123...' }
   localStorage.setItem('metaid_wallet_account', JSON.stringify(wrongAccount))
   ```
3. **刷新页面（F5）**

**预期结果：**

✅ 检测到地址不匹配  
✅ 自动清空所有 localStorage  
✅ 显示 "Connect Wallet" 按钮  
✅ 提示重新登录  

**验证方法：**

```javascript
// 控制台日志
⚠️ 钱包地址已变更，清空旧的连接状态和用户信息
🗑️ 钱包 localStorage 已清空
✅ 本地存储已清空
```

---

## 🔍 调试技巧

### 1. 实时监控 localStorage

```javascript
// 在控制台运行
const originalSetItem = localStorage.setItem
localStorage.setItem = function(key, value) {
  console.log('💾 localStorage.setItem:', key, value.substring(0, 50) + '...')
  return originalSetItem.apply(this, arguments)
}

const originalRemoveItem = localStorage.removeItem
localStorage.removeItem = function(key) {
  console.log('🗑️ localStorage.removeItem:', key)
  return originalRemoveItem.apply(this, arguments)
}
```

### 2. 查看所有 metaid_* 数据

```javascript
// 在控制台运行
const metaidData = {}
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('metaid_')) {
    try {
      metaidData[key] = JSON.parse(localStorage.getItem(key))
    } catch {
      metaidData[key] = localStorage.getItem(key)
    }
  }
})
console.table(metaidData)
```

### 3. 手动清空测试

```javascript
// 清空所有 metaid_* 数据
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('metaid_')) {
    localStorage.removeItem(key)
  }
})

// 刷新页面
location.reload()

// 预期：显示 "Connect Wallet" 按钮
```

### 4. 检查钱包状态

```typescript
import { useWalletStore } from '@/stores/wallet'

const walletStore = useWalletStore()

// 查看当前状态
console.log('连接状态:', walletStore.isConnected)
console.log('账户信息:', walletStore.account)
console.log('余额信息:', walletStore.balance)
console.log('网络类型:', walletStore.network)
```

## ✅ 测试检查清单

### 基础功能

- [ ] 连接钱包成功
- [ ] 刷新页面后钱包状态保持
- [ ] 刷新页面后用户登录状态保持
- [ ] 刷新页面后余额显示正确
- [ ] 刷新页面后网络类型正确

### 退出登录

- [ ] 点击断开连接成功
- [ ] localStorage 全部清空
- [ ] 刷新页面后确认未恢复连接

### 账户切换

- [ ] 在 Metalet 中切换账户
- [ ] 页面检测到切换
- [ ] localStorage 全部清空
- [ ] 显示"Connect Wallet"按钮

### 网络切换

- [ ] 在 Metalet 中切换网络
- [ ] 页面网络指示器更新
- [ ] localStorage 保存了新网络
- [ ] 刷新页面后网络设置保持

### 边缘情况

- [ ] 卸载 Metalet 后刷新页面
- [ ] 地址不匹配时自动清理
- [ ] localStorage 损坏时优雅降级

## 🎯 预期行为总结

### ✅ 应该保持连接的情况

| 操作 | 钱包连接 | 用户登录 | localStorage |
|------|---------|---------|-------------|
| 刷新页面（F5） | ✅ 保持 | ✅ 保持 | ✅ 保持 |
| 关闭标签页重开 | ✅ 保持 | ✅ 保持 | ✅ 保持 |
| 浏览器重启 | ✅ 保持 | ✅ 保持 | ✅ 保持 |
| 切换网络 | ✅ 保持 | ✅ 保持 | ✅ 更新 |

### ❌ 应该清空的情况

| 操作 | 钱包连接 | 用户登录 | localStorage |
|------|---------|---------|-------------|
| 点击"断开连接" | ❌ 清空 | ❌ 清空 | ❌ 全部清空 |
| 切换钱包账户 | ❌ 清空 | ❌ 清空 | ❌ 全部清空 |
| 地址不匹配 | ❌ 清空 | ❌ 清空 | ❌ 全部清空 |

## 🎉 测试通过标准

所有测试用例都通过，即可确认钱包持久化功能正常工作！

### 成功标志

1. ✅ 刷新页面不需要重新连接钱包
2. ✅ 刷新页面不需要重新登录
3. ✅ 余额数据正确显示
4. ✅ 退出登录正确清空所有数据
5. ✅ 切换账户正确清空所有数据
6. ✅ 控制台日志清晰明了

---

**立即开始测试：**

```bash
./dev.sh
```

访问 http://localhost:5174 并按照测试用例逐个验证！🚀

