# 完整使用指南 v2.0

## 🎉 项目版本：v2.0.0

参考 [IDChat 项目](https://github.com/lgs18928191781/idchat) 实现的企业级 Web3 登录注册系统！

## 🚀 快速开始（3 步）

### 步骤 1：启动项目

```bash
./dev.sh
```

服务器启动后会显示：
```
VITE v7.1.9  ready in 452 ms
➜  Local:   http://localhost:5174/
```

### 步骤 2：安装 Metalet 钱包

访问 [Chrome 扩展商店](https://chromewebstore.google.com/detail/metalet/lbjapbcmmceacocpimbpbidpgmlmoaao) 安装 Metalet 钱包。

### 步骤 3：连接钱包

1. 访问 `http://localhost:5174`
2. 点击右上角 **"Connect Wallet"**
3. 在弹窗中勾选《用户协议》和《隐私政策》
4. 点击 **"Metalet 钱包"**
5. 在 Metalet 插件中**确认连接**
6. ✅ 自动登录完成！

## 📊 登录注册流程

```
点击 "Connect Wallet"
    ↓
弹出 Modal 弹窗
    ↓
勾选《用户协议》和《隐私政策》
    ↓
点击 "Metalet 钱包"
    ↓
【步骤 1】检测钱包（6秒）
    显示：🔄 "正在检测 Metalet 钱包..."
    ↓
【步骤 2】连接钱包
    显示：🔗 "请在 Metalet 中确认连接"
    ↓
【步骤 3】检查用户类型
    显示：🔍 "正在检查用户信息..."
    ↓
【步骤 4A】新用户 → 注册
    显示：📝 "正在为您创建账户..."
    ↓
【步骤 4B】老用户 → 登录
    显示：🔐 "正在登录..."
    ↓
【步骤 5】成功
    显示：✅ "登录成功！"
    保存：用户信息 → localStorage
    自动：关闭弹窗（1.5秒后）
```

## 🎨 功能演示

### 1. 首次登录（新用户）

```
访问页面
  ↓
看到 "Connect Wallet" 按钮
  ↓
点击按钮
  ↓
弹出 Modal
  ↓
勾选用户协议
  ↓
点击 "Metalet 钱包"
  ↓
检测钱包（2秒） ✅
  ↓
连接钱包（用户确认） ✅
  ↓
检查用户类型 → 新用户
  ↓
自动注册（生成默认用户名）
  ↓
保存到 localStorage:
  - metaid_user_info
  - metaid_access_token
  - metaid_wallet_address
  ↓
显示成功 ✅
  ↓
关闭弹窗
  ↓
页面显示用户信息
```

### 2. 刷新页面（自动恢复）

```
刷新页面
  ↓
检测 Metalet（15秒） ✅
  ↓
从 localStorage 加载用户信息
  ↓
验证钱包地址是否匹配
  ↓
地址匹配 ✅
  ↓
自动恢复登录状态
  ↓
无需重新登录！
```

### 3. 账户切换

```
在 Metalet 中切换账户
  ↓
触发 accountsChanged 事件
  ↓
检测到新地址
  ↓
清空旧用户信息
  ↓
提示重新登录
  ↓
用户点击 "Connect Wallet"
  ↓
自动登录新账户
```

### 4. 退出登录

```
点击 "断开连接"
  ↓
调用 disconnect()
  ↓
清空所有 localStorage:
  - metaid_user_info ❌
  - metaid_access_token ❌
  - metaid_wallet_address ❌
  ↓
清空所有状态
  ↓
返回未登录状态
```

## 🎯 核心代码

### connectMetalet() 核心方法

```typescript
// services/walletConnect.ts

export async function connectMetalet(callbacks?: ConnectCallbacks): Promise<ConnectResult> {
  const walletStore = useWalletStore()
  const userStore = useUserStore()

  try {
    // 1. 检测钱包
    callbacks?.onStepChange?.('detecting')
    const isAvailable = await walletStore.waitForMetalet(20, 300)
    
    // 2. 连接钱包
    callbacks?.onStepChange?.('connecting')
    const success = await walletStore.connect()
    
    // 3. 检查用户
    callbacks?.onStepChange?.('checking')
    const { isNewUser } = await checkUserExists(account.address)
    
    // 4. 注册或登录
    if (isNewUser) {
      callbacks?.onStepChange?.('registering')
      await registerUser(account)
    } else {
      callbacks?.onStepChange?.('logging-in')
      await loginUser(account)
    }
    
    // 5. 保存并完成
    userStore.saveToStorage()
    callbacks?.onSuccess?.(account, isNewUser)
    
    return { success: true, isNewUser, account }
  } catch (error) {
    callbacks?.onError?.(error.message)
    return { success: false, error: error.message }
  }
}
```

### 组件中使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import ConnectWalletModal from '@/components/ConnectWalletModal.vue'
import { useUserStore } from '@/stores/user'

const showModal = ref(false)
const userStore = useUserStore()

const handleSuccess = (isNewUser: boolean) => {
  console.log(isNewUser ? '新用户注册成功!' : '欢迎回来!')
}
</script>

<template>
  <!-- 登录按钮 -->
  <button 
    v-if="!userStore.isLoggedIn" 
    @click="showModal = true"
  >
    Connect Wallet
  </button>

  <!-- 用户信息 -->
  <div v-else>
    <p>{{ userStore.displayName }}</p>
    <p>{{ userStore.userInfo?.address }}</p>
  </div>

  <!-- 登录 Modal -->
  <ConnectWalletModal 
    v-model="showModal"
    @success="handleSuccess"
  />
</template>
```

## 💾 LocalStorage 数据

### 存储的数据

登录后，以下数据会自动保存到浏览器的 localStorage：

```javascript
{
  "metaid_user_info": {
    "address": "1ABCxxxxxxxxxxxxxxxxxxy123",
    "mvcAddress": "xxx...",
    "btcAddress": "bc1...",
    "name": "用户1ABC",
    "loginTime": 1696934400000,
    "lastActiveTime": 1696934400000
  },
  "metaid_access_token": "token_1ABC..._1696934400000",
  "metaid_wallet_address": "1ABCxxxxxxxxxxxxxxxxxxy123"
}
```

### 查看存储数据

1. 打开浏览器控制台（F12）
2. 切换到 **Application** 标签
3. 左侧选择 **Local Storage** → `http://localhost:5174`
4. 可以看到所有 `metaid_*` 数据

## 🔧 高级用法

### 1. 自定义成功处理

```typescript
import { connectMetalet } from '@/services/walletConnect'

const result = await connectMetalet({
  onSuccess: (account, isNewUser) => {
    if (isNewUser) {
      // 新用户引导
      showWelcomeTour()
      router.push('/welcome')
    } else {
      // 老用户直接进入
      router.push('/dashboard')
    }
  }
})
```

### 2. 自定义错误处理

```typescript
const result = await connectMetalet({
  onError: (error) => {
    // 自定义错误提示
    if (error.includes('未检测到')) {
      showInstallGuide()
    } else if (error.includes('连接失败')) {
      showRetryButton()
    } else {
      showGenericError(error)
    }
  }
})
```

### 3. 自定义进度显示

```typescript
const progressSteps = ref([
  { step: 'detecting', done: false },
  { step: 'connecting', done: false },
  { step: 'checking', done: false },
  { step: 'registering', done: false },
  { step: 'success', done: false },
])

await connectMetalet({
  onStepChange: (step) => {
    const index = progressSteps.value.findIndex(s => s.step === step)
    if (index >= 0) {
      progressSteps.value[index].done = true
    }
  }
})
```

## 🐛 常见问题

### Q1: 弹窗打不开？

```typescript
// 检查
<ConnectWalletModal v-model="showModal" />

// 确保绑定正确
const showModal = ref(false)
<button @click="showModal = true">打开</button>
```

### Q2: 连接成功但未登录？

检查控制台日志：
```
✅ [步骤 2/5] 钱包连接成功
🔍 [步骤 3/5] 检查用户是否存在
📝 [步骤 4/5] 开始注册新用户  ← 应该有这一步
✅ [步骤 4/5] 用户注册成功
🎉 [步骤 5/5] 连接流程完成！
```

如果缺少步骤 4 或 5，检查代码：
```typescript
// src/services/walletConnect.ts
// 确保调用了 userStore.saveToStorage()
```

### Q3: 刷新后登录状态丢失？

检查初始化代码：
```typescript
// App.vue 或 main.ts
onMounted(async () => {
  userStore.init()  // ← 必须调用
  await walletStore.init()
})
```

### Q4: 未勾选协议就能连接？

检查代码：
```typescript
// ConnectWalletModal.vue
const canProceed = computed(() => isAgreementAccepted.value)

if (!canProceed.value) {
  errorMessage.value = '请先同意协议'
  return
}
```

## 📖 文档导航

### 快速开始
- [3分钟快速开始](./METALET_QUICKSTART.md)
- [5分钟用户系统](./USER_QUICKSTART.md)

### 核心文档
- [🌟 实现总结](./IMPLEMENTATION_SUMMARY.md)
- [🌟 架构文档](./ARCHITECTURE.md)
- [🌟 登录流程](./LOGIN_FLOW.md)

### 详细文档
- [用户系统](./USER_SYSTEM.md)
- [钱包集成](./METALET_INTEGRATION.md)
- [钱包检测](./WALLET_DETECTION.md)
- [环境配置](./ENV_CONFIG.md)

### 测试文档
- [测试指南](./WALLET_TEST_GUIDE.md)
- [调试指南](./HOW_TO_DEBUG.md)

### 参考文档
- [更新日志](./CHANGELOG.md)
- [文档索引](./INDEX.md)

## 🎊 功能清单

### Web3 钱包功能

- [x] 异步轮询检测（300ms × 50 = 15秒）
- [x] 钱包连接/断开
- [x] 余额实时显示
- [x] 地址管理和复制
- [x] 网络切换（主网/测试网）
- [x] 消息签名
- [x] 账户切换监听
- [x] 网络切换监听

### 用户系统功能

- [x] Modal 弹窗登录
- [x] 用户协议保护
- [x] 多阶段状态管理（5个步骤）
- [x] 新老用户识别
- [x] 自动注册
- [x] 自动登录
- [x] LocalStorage 持久化
- [x] 刷新页面自动恢复
- [x] 账户切换自动处理
- [x] 退出登录清空数据
- [x] 7天过期检测

### UI/UX 功能

- [x] 响应式设计（移动端适配）
- [x] 暗色模式支持
- [x] 加载动画
- [x] 错误提示
- [x] 成功提示
- [x] ESC 键关闭
- [x] 遮罩层关闭
- [x] 禁止连接中关闭

## 🏗️ 架构特点

### 分层架构

```
UI Layer        → ConnectWallet.vue, ConnectWalletModal.vue
    ↓
Service Layer   → walletConnect.ts (核心业务逻辑)
    ↓
Store Layer     → wallet.ts, user.ts (状态管理)
    ↓
API Layer       → user.ts (HTTP 请求)
    ↓
Utils Layer     → storage.ts, format.ts (工具函数)
```

### 模块化清晰

| 模块 | 职责 | 文件 |
|------|------|------|
| 服务层 | 核心业务逻辑 | `services/walletConnect.ts` |
| API层 | HTTP 请求封装 | `api/user.ts` |
| 状态层 | Pinia 状态管理 | `stores/wallet.ts`, `stores/user.ts` |
| 工具层 | 通用函数 | `utils/storage.ts`, `utils/format.ts` |
| 组件层 | UI 渲染 | `components/*.vue` |

## 📁 项目文件

```
metaid-demo-app/
├── src/
│   ├── api/                    # 👈 API 层（新增）
│   │   └── user.ts            # 用户 API
│   │
│   ├── services/               # 👈 服务层（新增）
│   │   └── walletConnect.ts   # 核心连接逻辑
│   │
│   ├── components/
│   │   ├── ConnectWallet.vue  # 顶部钱包按钮
│   │   └── ConnectWalletModal.vue  # 登录注册弹窗
│   │
│   ├── stores/
│   │   ├── wallet.ts          # 钱包状态
│   │   └── user.ts            # 用户状态
│   │
│   ├── utils/                  # 👈 工具层（新增）
│   │   ├── storage.ts         # localStorage 工具
│   │   └── format.ts          # 格式化工具
│   │
│   └── types/
│       └── metalet.d.ts       # Metalet 类型
│
├── public/
│   ├── agreement.html          # 👈 用户协议（新增）
│   └── privacy.html            # 👈 隐私政策（新增）
│
└── docs/ (根目录下的 .md 文件)
    ├── ARCHITECTURE.md         # 👈 架构文档（新增）
    ├── IMPLEMENTATION_SUMMARY.md  # 👈 实现总结（新增）
    ├── LOGIN_FLOW.md           # 👈 登录流程（新增）
    ├── ENV_CONFIG.md           # 👈 环境配置（新增）
    └── ... 其他文档
```

## 🎓 学习路径

### 初学者

1. 阅读 [METALET_QUICKSTART.md](./METALET_QUICKSTART.md) - 3分钟快速开始
2. 运行 `./dev.sh` 启动项目
3. 点击 "Connect Wallet" 体验流程
4. 打开浏览器控制台查看日志

### 进阶开发者

1. 阅读 [LOGIN_FLOW.md](./LOGIN_FLOW.md) - 理解登录流程
2. 阅读 [ARCHITECTURE.md](./ARCHITECTURE.md) - 理解架构设计
3. 查看 `services/walletConnect.ts` - 学习核心实现
4. 查看 `api/user.ts` - 理解 API 封装

### 高级开发者

1. 阅读 [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - 完整实现细节
2. 阅读 [USER_SYSTEM.md](./USER_SYSTEM.md) - 用户系统设计
3. 修改 API 层对接真实后端
4. 扩展新的钱包支持（MetaMask, WalletConnect）

## 🚀 生产部署

### 1. 环境变量配置

```bash
# 创建生产环境配置
cp .env.example .env.production

# 编辑配置
vim .env.production
```

```env
# .env.production
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_DEFAULT_NETWORK=mainnet
VITE_DEBUG_MODE=false
```

### 2. 构建

```bash
npm run build
```

### 3. 预览

```bash
npm run preview
```

### 4. 部署

```bash
# 部署到 Vercel
vercel deploy

# 或部署到 Netlify
netlify deploy --prod

# 或使用其他平台
```

## 📊 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | 3.5.22 | 前端框架 |
| TypeScript | 5.9.3 | 类型系统 |
| Vite | 7.1.9 | 构建工具 |
| Pinia | 3.0.3 | 状态管理 |
| Tailwind CSS | 3.4.0 | 样式框架 |
| SCSS | 1.93.2 | CSS 预处理器 |
| Headless UI | 1.7.23 | 无样式组件 |
| Metalet Wallet | - | Web3 钱包 |

## 🎉 完成！

您现在拥有一个：

✅ **企业级的 Web3 DApp**
✅ **完整的登录注册系统**
✅ **模块化清晰的代码架构**
✅ **易于维护和扩展**
✅ **完善的文档体系**

### 下一步

1. **对接真实后端 API**
   - 修改 `src/api/user.ts` 中的 API 调用
   - 替换模拟实现为真实 HTTP 请求

2. **添加更多功能**
   - 用户个人中心
   - 个人资料编辑
   - 交易历史
   - NFT 展示

3. **优化体验**
   - 添加 loading 骨架屏
   - 实现 Toast 通知
   - 优化移动端体验

---

**立即开始您的 Web3 开发之旅：**

```bash
./dev.sh
```

访问 `http://localhost:5174` 🚀

