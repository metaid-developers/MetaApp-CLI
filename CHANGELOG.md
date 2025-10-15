# 更新日志

## 2025-10-10 (v4) - 钱包连接状态持久化 🎉

### 🚀 重要更新：钱包状态持久化

解决了页面刷新后钱包连接状态丢失的问题！

**新增功能：**
- ✅ **钱包连接持久化** - 刷新页面自动恢复钱包连接状态
- ✅ **余额数据持久化** - 保存并恢复余额信息
- ✅ **网络设置持久化** - 保存并恢复网络类型（主网/测试网）
- ✅ **智能地址验证** - 刷新时验证地址一致性
- ✅ **自动清理机制** - 账户切换或退出时清空所有钱包数据

**新增 localStorage 键：**
- `metaid_wallet_account` - 钱包账户信息
- `metaid_wallet_balance` - 余额信息
- `metaid_wallet_network` - 网络类型
- `metaid_wallet_connected` - 连接状态标记

**更新文件：**
- `src/stores/wallet.ts` - 添加持久化方法
  - `saveWalletToStorage()` - 保存钱包状态
  - `loadWalletFromStorage()` - 加载钱包状态
  - `clearWalletStorage()` - 清空钱包状态
  - 更新 `init()` - 恢复钱包连接状态
  - 更新 `connect()` - 连接成功后自动保存
  - 更新 `disconnect()` - 断开时清空钱包 + 用户 localStorage
  - 更新 `fetchBalance()` - 获取余额后自动保存
  - 更新 `accountsChanged` - 账户切换时清空所有数据

**新增文档：**
- `WALLET_PERSISTENCE.md` - 钱包持久化完整文档

### 🔄 刷新页面恢复流程

```
刷新页面 (F5)
    ↓
从 localStorage 加载钱包状态
    ├─ account ✅ (钱包地址)
    ├─ balance ✅ (余额信息)
    └─ network ✅ (网络类型)
    ↓
检测 Metalet 钱包
    ↓
验证地址一致性
    ├─ 地址匹配 → ✅ 保持连接 + 刷新余额
    └─ 地址不匹配 → ⚠️ 清空所有 localStorage
    ↓
✅ 完整状态恢复！无需重新连接！
```

### 🗑️ 清空 localStorage 时机

**只在以下2种情况清空：**

1. **退出登录** - 用户主动点击"断开连接"
   ```typescript
   disconnect() → clearWalletStorage() + userStore.logout()
   ```

2. **切换账户** - 在 Metalet 中切换到不同地址
   ```typescript
   accountsChanged 事件 → 
     if (地址变更) {
       clearWalletStorage() + userStore.logout()
     }
   ```

**其他情况保持连接：**
- ✅ 刷新页面 → 保持连接
- ✅ 关闭标签页再打开 → 保持连接
- ✅ 浏览器重启 → 保持连接（只要 localStorage 未清空）
- ✅ 网络切换 → 保持连接

### 💡 用户体验提升

**改进前：**
```
连接钱包 → 刷新页面 → 钱包状态丢失 ❌ → 需要重新连接 😞
```

**改进后：**
```
连接钱包 → 刷新页面 → 钱包状态保持 ✅ → 无需任何操作 😊
```

### 🎯 技术亮点

- **双重持久化** - 钱包状态 + 用户状态 同时持久化
- **智能验证** - 地址一致性验证，确保数据安全
- **自动同步** - 余额、网络自动保存
- **优雅降级** - 检测到异常自动清理过期数据
- **边缘处理** - 卸载、切换、断开 全面覆盖

---

## 2025-10-10 (v3) - 完整登录注册流程（参考 IDChat）

### 🎉 重大更新：企业级登录注册流程

参考 [IDChat 项目](https://github.com/lgs18928191781/idchat) 的 ConnectWalletModal 核心逻辑，实现了完整的登录注册流程！

**新增功能：**
- ✅ **Modal 弹窗登录** - 专业的弹窗式登录体验
- ✅ **用户协议保护** - 必须同意协议才能连接
- ✅ **多阶段状态管理** - 检测→连接→注册/登录→成功
- ✅ **新老用户识别** - 自动判断并执行对应流程
- ✅ **加载状态提示** - 每个阶段都有清晰的视觉反馈
- ✅ **错误处理增强** - 友好的错误提示和重试机制
- ✅ **ESC 关闭** - 支持键盘快捷键
- ✅ **响应式设计** - 支持暗色模式

**新增文件：**
- `src/components/ConnectWalletModal.vue` - 登录注册弹窗组件
- `public/agreement.html` - 用户协议页面
- `public/privacy.html` - 隐私政策页面
- `LOGIN_FLOW.md` - 完整登录注册流程文档

**更新文件：**
- `src/components/ConnectWallet.vue` - 集成 Modal 弹窗
- `src/stores/user.ts` - 增加 register() 注册方法
- `README.md` - 添加登录注册流程说明
- `INDEX.md` - 添加文档索引

### 📊 登录注册流程

```
点击 "Connect Wallet"
  ↓
打开 Modal 弹窗
  ↓
勾选用户协议
  ↓
点击 "Metalet 钱包"
  ↓
【阶段 1】检测钱包（6秒超时）
  ↓
【阶段 2】连接钱包（用户确认）
  ↓
【阶段 3】判断用户类型
  ├─ 新用户 → 注册流程
  └─ 老用户 → 登录流程
  ↓
【阶段 4】成功（自动关闭）
```

### 🎨 UI 改进

**Modal 弹窗状态：**
1. **select** - 选择钱包 + 协议勾选
2. **detecting** - 检测钱包动画
3. **connecting** - 连接钱包动画 + 提示
4. **registering** - 注册中动画
5. **success** - 成功图标 + 地址显示

**交互优化：**
- 遮罩层点击关闭
- ESC 键快速关闭
- 连接中禁止关闭
- 错误自动重置
- 成功自动关闭（1.5秒）

### 🔐 安全增强

**用户协议保护：**
```typescript
// 必须勾选协议才能连接
const isAgreementAccepted = ref(false)

if (!isAgreementAccepted.value) {
  errorMessage.value = '请先阅读并同意用户协议和隐私政策'
  return
}
```

**新用户检测：**
```typescript
// 自动识别新老用户
const isNewUser = await checkIfNewUser(address)

if (isNewUser) {
  await userStore.register(account) // 注册流程
} else {
  // 登录流程（已自动完成）
}
```

### 🎯 使用示例

```vue
<script setup>
import { ref } from 'vue'
import ConnectWalletModal from '@/components/ConnectWalletModal.vue'

const showModal = ref(false)
</script>

<template>
  <button @click="showModal = true">登录</button>
  <ConnectWalletModal v-model="showModal" />
</template>
```

---

## 2025-10-10 (v2) - 用户登录注册系统集成

### 🎉 重大更新：完整用户系统

参考 [IDChat 项目](https://github.com/lgs18928191781/idchat) 实现了完整的用户登录注册系统！

**新增功能：**
- ✅ **钱包登录** - 连接钱包自动登录
- ✅ **用户信息持久化** - 保存到 localStorage
- ✅ **自动恢复登录** - 刷新页面自动恢复
- ✅ **账户切换处理** - 自动切换用户
- ✅ **退出登录** - 清空所有 localStorage
- ✅ **过期检测** - 7天未活跃自动退出
- ✅ **用户信息更新** - 支持修改个人资料

### 📁 新增文件

**Stores：**
- `src/stores/user.ts` - 用户状态管理
  - 用户信息（UserInfo）
  - Access Token
  - 登录/注册/退出逻辑
  - localStorage 持久化

**工具函数：**
- `src/utils/storage.ts` - localStorage 工具
  - 安全读写
  - 清空指定前缀
  - 存储使用统计
- `src/utils/format.ts` - 格式化工具
  - 地址格式化
  - 余额格式化
  - 时间格式化（相对时间）
  - 复制到剪贴板

**文档：**
- `USER_SYSTEM.md` - 用户系统完整文档
  - 登录流程
  - 数据结构
  - API 参考
  - 使用示例

### 🔄 更新文件

**Store 集成：**
- `src/stores/wallet.ts`
  - 导入 `useUserStore`
  - 连接钱包后自动登录
  - 断开钱包自动退出登录
  - 账户切换自动重新登录
  - 初始化时恢复登录状态

**UI 更新：**
- `src/App.vue`
  - 新增登录状态卡片
  - 显示用户信息（头像、名称、地址）
  - 显示登录时间和最后活跃时间
  - 更新 API 示例（包含用户相关 API）

**文档更新：**
- `README.md` - 添加用户系统功能说明
- `INDEX.md` - 添加用户系统文档索引
- `METALET_INTEGRATION.md` - 补充登录流程说明
- `FINAL_SUMMARY.md` - 更新项目总结

### 💾 LocalStorage 数据

| 键名 | 说明 |
|------|------|
| `metaid_user_info` | 用户完整信息（UserInfo） |
| `metaid_access_token` | 访问令牌（Token） |
| `metaid_wallet_address` | 钱包地址（快速访问） |

### 📊 登录流程

```
连接钱包
  ↓
获取钱包地址
  ↓
自动调用 loginWithWallet()
  ↓
创建 UserInfo
  ↓
生成 Access Token
  ↓
保存到 localStorage
  ↓
✅ 登录成功
```

### 🔄 状态恢复流程

```
页面加载/刷新
  ↓
初始化 userStore
  ↓
从 localStorage 加载用户信息
  ↓
初始化 walletStore（异步检测）
  ↓
获取当前钱包地址
  ↓
地址匹配？
  ├─ 是 → ✅ 恢复登录状态
  └─ 否 → ⚠️ 清空旧用户信息
```

### 🎯 使用示例

```typescript
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 检查登录状态
if (userStore.isLoggedIn) {
  console.log('用户名:', userStore.displayName)
  console.log('地址:', userStore.userInfo?.address)
  console.log('Token:', userStore.accessToken)
}

// 退出登录（自动清空 localStorage）
userStore.logout()

// 更新用户信息
await userStore.updateUserInfo({
  name: '新名字',
  avatar: 'https://...'
})
```

### 🔧 技术亮点

- **双重 Store 管理** - Wallet Store + User Store 协同工作
- **自动化流程** - 连接→登录→恢复→切换→退出 全自动
- **持久化存储** - localStorage 安全存储，自动恢复
- **地址验证** - 切换账户时验证地址匹配
- **过期检测** - 7天未活跃自动清除登录状态
- **类型安全** - 完整的 TypeScript 类型定义

### 🎨 UI 改进

- 新增登录状态卡片
- 显示用户头像（基于地址生成）
- 显示用户信息（名称、地址、时间）
- 显示 Access Token（前40字符）
- 更新功能说明（6项功能）

---

## 2025-10-10 (v1) - 集成 Metalet 钱包功能

### 🎉 重大更新：Web3 钱包集成

项目已完成 **Metalet 钱包**的完整集成！

**新增功能：**
- ✅ **智能检测机制** - 异步轮询检测钱包注入（每 300ms，最多 50 次）
- ✅ 钱包连接/断开
- ✅ 余额实时显示（BTC satoshis）
- ✅ 地址管理和复制
- ✅ 网络指示器（主网/测试网）
- ✅ 账户切换自动更新
- ✅ 网络切换自动更新
- ✅ 消息签名支持
- ✅ 完整的错误处理
- ✅ 检测状态显示（加载动画）

### 📁 新增文件

**组件：**
- `src/components/ConnectWallet.vue` - 钱包连接组件
  - 三种状态：未安装、未连接、已连接
  - Headless UI 下拉菜单
  - 完整的 UI/UX 设计

**状态管理：**
- `src/stores/wallet.ts` - 钱包状态管理
  - Pinia store
  - 完整的类型支持
  - 事件监听和自动更新

**类型定义：**
- `src/types/metalet.d.ts` - Metalet 钱包类型
  - 完整的 API 类型定义
  - Window 接口扩展

**文档：**
- `METALET_INTEGRATION.md` - Metalet 集成完整指南
- `WALLET_TEST_GUIDE.md` - 钱包功能测试指南
- `WALLET_DETECTION.md` - 钱包检测机制详解
- `METALET_QUICKSTART.md` - 3分钟快速开始

### 🎨 UI 特性

**右上角钱包组件（4 种状态）：**

1. **检测中**（页面加载 0-15 秒）
   - 显示 "🔄 检测钱包中..." 按钮
   - 旋转动画
   - 禁用状态

2. **未安装**（检测超时或确认未安装）
   - 显示 "⚠️ 安装 Metalet" 按钮
   - 点击跳转到扩展商店

3. **未连接**（已安装但未连接）
   - 显示 "⚡ Connect Wallet" 按钮
   - 点击触发连接流程
   - 带加载动画

4. **已连接**
   - 显示钱包信息卡片
   - 网络指示器（🟢 主网 / 🟠 测试网）
   - BTC 余额
   - 短地址（前6后4位）
   - 下拉菜单（地址详情、余额、操作）

**响应式设计：**
- 支持深色模式
- 移动端适配
- Tailwind CSS + SCSS（已修复 @apply 兼容性）

### 🔧 技术实现

**智能检测机制：**
```typescript
// 异步轮询检测（每 300ms 检查一次，最多 50 次 = 15 秒）
const waitForMetalet = async (maxRetries = 50, interval = 300) => {
  return new Promise((resolve) => {
    let retries = 0
    const checkMetalet = () => {
      if (window.metaidwallet) {
        resolve(true) // 检测成功
        return
      }
      retries++
      if (retries >= maxRetries) {
        resolve(false) // 超时
        return
      }
      setTimeout(checkMetalet, interval) // 继续检测
    }
    checkMetalet()
  })
}

// 页面初始化时自动检测
await walletStore.init() // 内部调用 waitForMetalet()

// 连接时再次确认
await walletStore.connect() // 内部再次调用 waitForMetalet(20, 300)
```

**核心 API：**
```typescript
// 连接钱包
await window.metaidwallet.connect()

// 获取余额
await window.metaidwallet.getBalance()

// 签名消息
await window.metaidwallet.signMessage(message)

// 事件监听
window.metaidwallet.on('accountsChanged', callback)
window.metaidwallet.on('networkChanged', callback)
```

**状态管理：**
- 使用 Pinia Store
- 响应式状态更新
- 自动事件监听
- 异步初始化

**类型安全：**
- 完整的 TypeScript 支持
- API 自动补全
- 类型检查

**样式系统：**
- 标准 CSS + SCSS（不使用 @apply，避免兼容性问题）
- Tailwind 类名用于 template
- 深色模式支持

### 📚 参考资源

- **Metalet GitHub**: https://github.com/metalet-labs/metalet-extension-next
- **IDChat 项目**: https://www.idchat.io/chat
- **Chrome 扩展**: https://chromewebstore.google.com/detail/metalet/lbjapbcmmceacocpimbpbidpgmlmoaao

### 🎯 使用方法

1. **安装 Metalet 钱包**
   - 访问 Chrome 扩展商店
   - 安装 Metalet 扩展
   - 创建或导入钱包

2. **启动项目**
   ```bash
   ./dev.sh
   ```

3. **连接钱包**
   - 点击右上角 "Connect Wallet"
   - 在 Metalet 弹窗中授权
   - 查看余额和地址

4. **使用功能**
   - 查看余额详情
   - 复制地址
   - 刷新余额
   - 断开连接

### 🔍 调试和测试

**控制台调试：**
```javascript
// 查看钱包对象
console.log(window.metaidwallet)

// 查看 store 状态  
console.log(walletStore.account)
console.log(walletStore.balance)
```

**完整测试：**
参见 [WALLET_TEST_GUIDE.md](./WALLET_TEST_GUIDE.md)

---

## 2025-10-10 - 升级到 Vite 7.x 最新版本

### 🚀 重大升级

**升级内容：**
- ✅ Vite: 5.4.20 → **7.1.9**
- ✅ @vitejs/plugin-vue: 5.2.4 → **6.0.1**
- ✅ @types/node: 18.x → **20.19.0**
- ✅ 新增 **vite-plugin-vue-devtools@8.0.2**（内置 Vue DevTools）
- ✅ Node.js 要求: 18.x → **20.19+ 或 22.12+**

### 🎯 新功能

1. **内置 Vue DevTools**
   - 在浏览器中直接访问 `http://localhost:5173/__devtools__/`
   - 或按快捷键 `Option + Shift + D` 切换 DevTools
   - 无需安装浏览器扩展即可调试

2. **性能提升**
   - Vite 7 启动速度更快（< 500ms）
   - 更好的 HMR（热模块替换）性能
   - 优化的构建速度

3. **自动版本管理**
   - 新增 `.nvmrc` 文件（指定 Node.js 20.19.1）
   - 新增 `dev.sh` 启动脚本（自动切换 Node.js 版本）
   - 自动检查 Node.js 版本要求

### 📝 使用说明

#### 快速启动（推荐）

```bash
./dev.sh  # 自动切换到正确的 Node.js 版本并启动
```

#### 手动启动

```bash
nvm use 20.19.1  # 切换 Node.js 版本
npm run dev      # 启动开发服务器
```

### ⚙️ 系统要求更新

- **Node.js**: 必须 20.19+ 或 22.12+
- **npm**: 建议 10.0.0+
- **推荐**: 使用 nvm 管理 Node.js 版本

### 🔧 破坏性变更

1. **Node.js 版本要求提高**
   - 旧版本：Node.js 18.x
   - 新版本：Node.js 20.19+ 或 22.12+
   - **如果使用 Node.js 18，项目将无法启动**

2. **依赖版本更新**
   - 所有 Vite 相关插件已更新到最新版本
   - 确保所有插件与 Vite 7 兼容

### 🎉 升级后的优势

- ✨ 更快的开发体验
- 🛠️ 内置调试工具（Vue DevTools）
- 🚀 最新的 Vite 特性和性能优化
- 🔒 更好的类型支持

### 📚 相关链接

- [Vite 7 发布说明](https://vitejs.dev/blog/)
- [Vue DevTools 文档](https://devtools.vuejs.org/)

---

## 2025-10-09 - 修复 Vue DevTools 插件兼容性问题

### 🐛 问题描述

**错误信息：**
```
TypeError: Cannot convert undefined or null to object
    at configureServer (vite-plugin-inspect)
```

**原因分析：**
- ❌ `vite-plugin-vue-devtools@8.0.2` 需要 Vite 6.x 或 7.x
- ❌ 项目使用的是 Vite 5.x，版本不兼容
- ❌ 插件的 peer dependency 警告被忽略

### ✅ 解决方案

1. **移除不兼容的插件**
   ```bash
   npm uninstall vite-plugin-vue-devtools
   ```

2. **更新 vite.config.ts**
   - 移除 `VueDevTools` 的导入和使用
   - 保持基础的 Vue 插件配置

3. **清理混合的包管理器锁文件**
   ```bash
   rm -f yarn.lock
   npm install
   ```

### 💡 说明

Vue DevTools 可以通过浏览器扩展使用，不需要额外的 Vite 插件：
- Chrome: [Vue.js devtools](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- Firefox: [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

### 🎯 验证结果

- ✅ 开发服务器正常启动
- ✅ 无错误信息
- ✅ 所有功能正常工作

---

## 2025-10-09 - 修复项目启动问题

### 🐛 修复的问题

**原始错误：**
- ❌ 使用 `rolldown-vite` 需要 Node.js 20.19+ 或 22.12+，但当前系统是 Node.js 18.17.1
- ❌ 缺少 `@rolldown/binding-darwin-*` 原生绑定模块
- ❌ 无法启动开发服务器

### ✅ 解决方案

1. **更换构建工具**
   - 从 `rolldown-vite@7.1.14` 改为标准 `vite@^5.0.0`
   - 移除了 package.json 中的 overrides 配置

2. **调整依赖版本以兼容 Node.js 18**
   - `@vitejs/plugin-vue`: `6.0.1` → `^5.0.0`
   - `@types/node`: `24.6.0` → `^18.0.0`
   - `tailwindcss`: `4.1.14` → `^3.4.0`
   - `vite`: `npm:rolldown-vite@7.1.14` → `^5.0.0`

3. **清理并重新安装依赖**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### 📦 当前依赖版本

```json
{
  "dependencies": {
    "@headlessui/vue": "^1.7.23",
    "pinia": "^3.0.3",
    "vue": "^3.5.22"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "@vitejs/plugin-vue": "^5.0.0",
    "@vue/tsconfig": "^0.8.1",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6",
    "sass": "^1.93.2",
    "tailwindcss": "^3.4.0",
    "typescript": "~5.9.3",
    "vite": "^5.0.0",
    "vue-tsc": "^3.1.0"
  }
}
```

### 🎯 验证结果

- ✅ 开发服务器成功启动
- ✅ 运行在 `http://localhost:5173`
- ✅ 所有功能正常工作
- ✅ 与 Node.js 18.17.1 完全兼容

### 💡 使用说明

现在可以正常使用所有命令：

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 📝 注意事项

- 项目现在使用标准的 Vite 5.x，性能稳定可靠
- 所有依赖版本已调整为兼容 Node.js 18+
- Tailwind CSS 使用 v3 版本（稳定版）
- 所有原有功能（Vue 3、TypeScript、SCSS、Headless UI、Pinia）保持不变

