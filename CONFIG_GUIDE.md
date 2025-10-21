# 动态配置系统使用指南

## 概述

本项目实现了动态配置系统，允许在打包后通过修改 `public/app-config.json` 文件来调整应用行为，无需重新编译和打包。

## 配置文件结构

### 完整配置示例

```json
{
  "app": {
    "name": "MetaID Demo App",
    "version": "2.0.0",
    "environment": "production",
    "debug": false
  },
  "api": {
    
    "timeout": 10000,
    "retryAttempts": 3
  },
  "wallet": {
    "network": "mainnet",
    "autoConnect": true,
    "showBalance": true
  },
  "features": {
    "enableUpload": true,
    "enableProfileEdit": true,
    "enableNotifications": true,
    "enableAnalytics": false
  },
  "ui": {
    "theme": "light",
    "language": "zh-CN",
    "showWelcomeMessage": true,
    "maxFileSize": "10MB"
  },
  "security": {
    "enableCSP": true,
    "enableHSTS": true,
 
  }
}
```

## 配置项说明

### app 应用配置
- `name`: 应用名称
- `version`: 应用版本
- `environment`: 运行环境 (`development` | `production` | `staging`)
- `debug`: 是否启用调试模式

### api API配置
- `baseUrl`: API基础URL
- `timeout`: 请求超时时间（毫秒）
- `retryAttempts`: 重试次数

### wallet 钱包配置
- `network`: 网络类型 (`mainnet` | `testnet`)
- `autoConnect`: 是否自动连接钱包
- `showBalance`: 是否显示余额

### features 功能开关
- `enableUpload`: 启用文件上传功能
- `enableProfileEdit`: 启用个人资料编辑
- `enableNotifications`: 启用通知功能
- `enableAnalytics`: 启用分析统计

### ui 界面配置
- `theme`: 主题 (`light` | `dark` | `auto`)
- `language`: 语言 (`zh-CN` | `en-US`)
- `showWelcomeMessage`: 显示欢迎消息
- `maxFileSize`: 最大文件大小（支持 KB、MB、GB）

### security 安全配置
- `enableCSP`: 启用内容安全策略
- `enableHSTS`: 启用HTTP严格传输安全


## 在组件中使用配置

### 1. 基础用法

```vue
<script setup lang="ts">
import { useConfig } from '@/hooks/use-config';

const { config, isFeatureEnabled, apiBaseUrl } = useConfig();

// 检查功能是否启用
if (isFeatureEnabled('enableUpload').value) {
  // 显示上传功能
}

// 获取API URL
const apiUrl = apiBaseUrl.value;
</script>
```

### 2. 专用配置钩子

```vue
<script setup lang="ts">
import { useApiConfig, useWalletConfig, useUIConfig } from '@/hooks/use-config';

// API配置
const { baseUrl, timeout } = useApiConfig();

// 钱包配置
const { network, autoConnect } = useWalletConfig();

// UI配置
const { theme, language, maxFileSize } = useUIConfig();
</script>
```

### 3. 动态更新配置

```vue
<script setup lang="ts">
import { useConfig } from '@/hooks/use-config';

const { updateConfig } = useConfig();

// 切换调试模式
const toggleDebug = () => {
  updateConfig({
    app: {
      ...config.value.app,
      debug: !config.value.app.debug
    }
  });
};
</script>
```

## 配置管理API

### ConfigManager 类方法

```typescript
// 加载外部配置
await configManager.loadConfig();

// 更新配置
configManager.updateConfig({
  features: {
    enableUpload: false
  }
});

// 获取配置值
const apiUrl = configManager.getConfigValue<string>('api.baseUrl');

// 检查功能是否启用
const isUploadEnabled = configManager.isFeatureEnabled('enableUpload');

// 获取文件大小限制（字节）
const maxBytes = configManager.getMaxFileSizeBytes();
```

## 部署和更新

### 1. 部署时
确保 `public/app-config.json` 文件被正确部署到服务器。

### 2. 更新配置
1. 修改服务器上的 `public/app-config.json` 文件
2. 用户刷新页面即可生效
3. 无需重新打包或部署应用

### 3. 配置验证
应用启动时会自动验证配置文件格式，如果格式错误会使用默认配置。

## 最佳实践

### 1. 配置设计
- 将经常需要调整的参数放在配置文件中
- 使用有意义的配置项名称
- 提供合理的默认值

### 2. 类型安全
- 使用 TypeScript 类型定义确保配置类型安全
- 在运行时验证配置值

### 3. 性能考虑
- 配置在应用启动时加载一次
- 避免频繁的配置更新
- 使用计算属性缓存配置值

### 4. 错误处理
- 配置加载失败时使用默认配置
- 提供清晰的错误信息
- 记录配置加载状态

## 故障排除

### 配置不生效
1. 检查 `public/app-config.json` 文件是否存在
2. 验证JSON格式是否正确
3. 检查浏览器控制台是否有错误信息

### 配置加载失败
1. 检查网络连接
2. 确认服务器正确提供配置文件
3. 查看浏览器开发者工具的网络面板

### 类型错误
1. 确保配置值类型与定义一致
2. 检查 TypeScript 编译错误
3. 验证配置项名称拼写
