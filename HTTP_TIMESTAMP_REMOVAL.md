# HTTP 请求时间戳参数移除

## 📝 修改内容

移除了 HTTP 工具类中自动为 GET 请求添加时间戳参数 `_t` 的功能。

## 🔄 修改对比

### 修改前
```typescript
// 请求拦截器会自动添加时间戳
if (config.method === 'get') {
  config.params = {
    ...config.params,
    _t: Date.now(),  // ❌ 自动添加时间戳
  }
}
```

**结果**:
```
GET https://man.metaid.io/api/info/address/16xN11wyQmUTS3qFwaJYbwHbjHaFkibxWo?_t=1760176673202
                                                                           ^^^^^^^^^^^^^^^^^^^^^
                                                                           自动添加的时间戳
```

### 修改后
```typescript
// 请求拦截器 - 不再添加时间戳
// 1. 添加 token（如果存在）
const token = this.getToken()
if (token) {
  config.headers.Authorization = `Bearer ${token}`
}

// 2. 日志记录
console.log(`📤 [${config.method?.toUpperCase()}] ${config.url}`)

return config
```

**结果**:
```
GET https://man.metaid.io/api/info/address/16xN11wyQmUTS3qFwaJYbwHbjHaFkibxWo
                                                                           ✅ 干净的 URL
```

## 🎯 影响范围

### 修改的文件
- `src/utils/http.ts` - 请求拦截器

### 受影响的 API 请求
所有使用 `HttpRequest` 类的 GET 请求：

| API | 修改前 | 修改后 |
|-----|--------|--------|
| `getUserInfoByAddress` | `/info/address/{address}?_t=xxx` | `/info/address/{address}` |
| `getUserInfoByMetaId` | `/info/metaid/{metaid}?_t=xxx` | `/info/metaid/{metaid}` |
| 其他 GET 请求 | `url?_t=xxx` | `url` |

## ⚠️ 注意事项

### 1. 浏览器缓存
移除时间戳后，浏览器可能会缓存 GET 请求的响应。

**如果需要强制刷新数据**，可以：

#### 方案 1: 手动添加参数
```typescript
const userInfo = await getUserInfoByAddress(address, {
  params: {
    refresh: Date.now() // 手动添加刷新参数
  }
})
```

#### 方案 2: 设置请求头
```typescript
// 在 http.ts 中添加
config.headers['Cache-Control'] = 'no-cache'
```

#### 方案 3: 使用配置选项
在特定请求中禁用缓存：
```typescript
await manApi.get('/info/address/xxx', null, {
  headers: {
    'Cache-Control': 'no-cache'
  }
})
```

### 2. API 缓存策略
大多数 API 都有自己的缓存策略，通常不需要客户端添加时间戳：
- ✅ 服务端会处理缓存
- ✅ CDN 会处理缓存
- ✅ 浏览器会根据响应头缓存

### 3. 何时需要防止缓存
只在以下情况需要防止缓存：
- 实时数据（如余额、行情）
- 频繁变化的数据
- 用户特定的敏感数据

对于这些情况，可以在特定请求中手动添加参数，而不是全局添加。

## 💡 推荐做法

### 对于需要实时数据的 API
```typescript
// 创建单独的实时 API 实例
const realtimeApi = new HttpRequest(baseURL, {
  // 可以在这里自定义拦截器
})

// 在拦截器中添加时间戳
realtimeApi.getAxiosInstance().interceptors.request.use(config => {
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      _t: Date.now()
    }
  }
  return config
})
```

### 对于普通 API
```typescript
// 使用默认配置（不添加时间戳）
const api = new HttpRequest(baseURL)

// 让浏览器和服务器处理缓存
await api.get('/info/address/xxx')
```

## 🧪 测试验证

### 验证 URL 格式
```typescript
import { getUserInfoByAddress } from '@/api/man'

// 测试请求
const userInfo = await getUserInfoByAddress('16xN11wyQmUTS3qFwaJYbwHbjHaFkibxWo')

// 检查控制台输出的 URL
// 应该是: https://man.metaid.io/api/info/address/16xN11wyQmUTS3qFwaJYbwHbjHaFkibxWo
// 而不是: https://man.metaid.io/api/info/address/16xN11wyQmUTS3qFwaJYbwHbjHaFkibxWo?_t=1760176673202
```

### 检查网络请求
1. 打开浏览器开发者工具
2. 切换到 Network 标签
3. 触发 API 请求
4. 查看请求 URL - 应该不包含 `_t` 参数

## 📊 修改总结

| 项目 | 修改前 | 修改后 |
|------|--------|--------|
| GET 请求 URL | `url?_t=timestamp` | `url` |
| 时间戳参数 | 自动添加 | 不添加 |
| 缓存控制 | 强制禁用 | 遵循服务器策略 |
| URL 长度 | 较长 | 较短 |
| 日志可读性 | 一般 | 更好 |

## ✅ 验证清单

- [x] 移除时间戳添加代码
- [x] 移除未使用的 baseURL 变量
- [x] 保留 token 添加功能
- [x] 保留日志记录功能
- [x] 无 TypeScript 错误
- [x] 无 Linter 警告

## 🎯 最终效果

### getUserInfoByAddress 请求
```
请求 URL: https://man.metaid.io/api/info/address/16xN11wyQmUTS3qFwaJYbwHbjHaFkibxWo
                                                                              ✅ 干净的 URL
```

### 控制台日志
```
📤 [GET] /info/address/16xN11wyQmUTS3qFwaJYbwHbjHaFkibxWo
{
  params: undefined,  // ✅ 没有 _t 参数
  data: undefined
}
```

---

**修改日期**: 2025-10-11  
**修改文件**: `src/utils/http.ts`  
**影响**: 所有 GET 请求  
**状态**: ✅ 完成



