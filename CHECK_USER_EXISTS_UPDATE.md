# checkUserExists 方法更新说明

## 📝 更新内容

`checkUserExists` 方法已更新为使用 MAN API 来判断用户是否为新用户。

## 🔄 改动对比

### 旧逻辑
```typescript
// 通过 localStorage 判断
const storedAddress = localStorage.getItem('metaid_wallet_address')
const exists = storedAddress === address

return {
  exists,
  isNewUser: !exists
}
```

### 新逻辑（参照 IDChat）
```typescript
// 调用 MAN API 获取用户信息
const userInfo = await getUserInfoByAddress(address)

// 判断用户是否设置了 name
const hasName = !!userInfo.name && userInfo.name.trim() !== ''
const isNewUser = !hasName

return {
  exists: true,    // 用户在链上存在
  isNewUser        // 是否为新用户（未设置名称）
}
```

## 🎯 判断逻辑

用户被认为是"新用户"的条件：
1. ✅ API 返回 404（用户完全不存在）
2. ✅ API 返回的用户信息中 `name` 字段为空
3. ✅ API 返回的用户信息中 `name` 字段为空字符串

用户被认为是"老用户"的条件：
- ✅ API 返回的用户信息中 `name` 字段有值且不为空

## 📊 返回值说明

```typescript
interface CheckUserResult {
  exists: boolean    // 用户是否在链上存在
  isNewUser: boolean // 是否为新用户（未设置名称）
}
```

### 示例场景

#### 场景 1：完全新用户（从未注册）
```typescript
// API 返回 404 或空
{
  exists: false,
  isNewUser: true
}
```

#### 场景 2：已注册但未设置名称
```typescript
// API 返回：{ address: "xxx", metaid: "yyy", name: "" }
{
  exists: true,
  isNewUser: true  // name 为空，需要设置
}
```

#### 场景 3：已注册且设置了名称
```typescript
// API 返回：{ address: "xxx", metaid: "yyy", name: "Alice" }
{
  exists: true,
  isNewUser: false  // 老用户，可以直接登录
}
```

## 🔧 使用示例

```typescript
import { checkUserExists } from '@/api/user'

async function handleLogin(address: string) {
  try {
    // 检查用户状态
    const { exists, isNewUser } = await checkUserExists(address)
    
    if (isNewUser) {
      console.log('新用户，需要设置基本信息')
      // 引导用户设置名称等信息
      showSetProfileModal()
    } else {
      console.log('老用户，直接登录')
      // 直接进入应用
      navigateToHome()
    }
  } catch (error) {
    console.error('检查用户失败:', error)
    // 错误处理
  }
}
```

## 🔍 调试日志

方法执行时会输出详细的日志：

```
🔍 检查用户是否存在: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
✅ 用户信息: {
  address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  metaid: "xxx",
  name: "Alice",
  hasName: true,
  isNewUser: false
}
```

或者：

```
🔍 检查用户是否存在: 1NewUserAddress...
⚠️ 用户不存在（新用户）
```

## ⚠️ 注意事项

1. **API 依赖**：需要确保 `VITE_MAN_API` 环境变量正确配置
2. **网络错误**：如果 API 调用失败（非 404），会抛出错误，需要上层捕获处理
3. **空值判断**：会检查 `name` 字段是否为空字符串或只包含空格
4. **兼容性**：与 IDChat 项目的逻辑保持一致

## 🚀 后续优化建议

1. 可以添加缓存机制，避免重复调用 API
2. 可以添加重试机制，提高可靠性
3. 可以添加更多的用户状态判断（如是否完善了资料等）

## 📚 相关文件

- `src/api/user.ts` - checkUserExists 方法实现
- `src/api/man.ts` - getUserInfoByAddress API
- `src/services/walletConnect.ts` - 使用 checkUserExists 的地方

## 🔗 参考

- [IDChat 项目](https://github.com/lgs18928191781/idchat)
- [MAN API 文档](https://man.metaid.io/api/docs)


