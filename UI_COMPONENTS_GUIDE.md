# UI 组件快速使用指南

本项目使用 **Tailwind CSS + Headless UI** 构建，完全替代了 Element UI。

## 🎯 核心组件

### 1. Toast 通知 (替代 ElMessage)

#### 基础用法
```typescript
import { toast } from '@/utils/toast'

// 成功提示
toast.success('操作成功！')

// 错误提示
toast.error('操作失败！')

// 警告提示
toast.warning('请注意！')

// 信息提示
toast.info('提示信息')
```

#### 自定义时长
```typescript
// 默认 3000ms
toast.success('消息', 3000)

// 5秒后关闭
toast.error('错误信息', 5000)

// 不自动关闭
toast.info('重要信息', 0)
```

#### 兼容旧代码
```typescript
// ✅ 如果旧代码使用了 ElMessage，无需修改
import { ElMessage } from '@/utils/toast'

ElMessage.success('成功')
ElMessage.error('失败')
```

### 2. Dialog 对话框 (替代 ElDialog)

#### 基础用法
```vue
<template>
  <div>
    <button @click="open = true">打开对话框</button>
    
    <Dialog
      v-model="open"
      title="对话框标题"
      :width="400"
      @close="handleClose"
    >
      <p>这是对话框内容</p>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Dialog from '@/components/Dialog/Dialog.vue'

const open = ref(false)

const handleClose = () => {
  console.log('对话框关闭了')
}
</script>
```

#### 带底部按钮
```vue
<Dialog v-model="open" title="确认删除">
  <p>确定要删除这条记录吗？</p>
  
  <template #footer>
    <div class="flex justify-end gap-3">
      <button
        @click="open = false"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        取消
      </button>
      <button
        @click="handleDelete"
        class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
      >
        删除
      </button>
    </div>
  </template>
</Dialog>
```

#### 配置选项
```vue
<Dialog
  v-model="open"
  title="对话框标题"              <!-- 标题文字 -->
  :width="600"                    <!-- 宽度（px 或 string） -->
  :close-on-click-modal="false"   <!-- 点击遮罩是否关闭 -->
  :show-close="true"              <!-- 是否显示关闭按钮 -->
  @close="handleClose"            <!-- 关闭事件 -->
>
  <!-- 内容 -->
</Dialog>
```

## 🎨 常用 Tailwind CSS 样式

### 按钮样式

#### 主要按钮
```html
<button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
  主要按钮
</button>
```

#### 次要按钮
```html
<button class="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
  次要按钮
</button>
```

#### 危险按钮
```html
<button class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
  删除
</button>
```

#### 禁用按钮
```html
<button disabled class="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed">
  禁用按钮
</button>
```

### 输入框样式
```html
<input
  type="text"
  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
  placeholder="请输入..."
/>
```

### 卡片样式
```html
<div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
  卡片内容
</div>
```

## 🔔 实际使用示例

### 示例 1: 表单提交
```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input
      v-model="name"
      type="text"
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      placeholder="请输入名称"
    />
    
    <button
      type="submit"
      class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      提交
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { toast } from '@/utils/toast'

const name = ref('')

const handleSubmit = () => {
  if (!name.value) {
    toast.error('请输入名称')
    return
  }
  
  toast.success('提交成功！')
}
</script>
```

### 示例 2: 确认对话框
```vue
<template>
  <div>
    <button @click="showConfirm = true" class="px-4 py-2 bg-red-600 text-white rounded-lg">
      删除账户
    </button>
    
    <Dialog v-model="showConfirm" title="危险操作" :width="400">
      <div class="space-y-4">
        <p class="text-gray-600">确定要删除账户吗？此操作无法撤销。</p>
        
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p class="text-sm text-yellow-800">⚠️ 删除后所有数据将被清空</p>
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            @click="showConfirm = false"
            class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="handleDelete"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            确认删除
          </button>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Dialog from '@/components/Dialog/Dialog.vue'
import { toast } from '@/utils/toast'

const showConfirm = ref(false)

const handleDelete = async () => {
  try {
    // 执行删除操作
    await deleteAccount()
    
    showConfirm.value = false
    toast.success('账户已删除')
  } catch (error: any) {
    toast.error(error.message)
  }
}
</script>
```

### 示例 3: 加载状态
```vue
<template>
  <button
    @click="handleSubmit"
    :disabled="loading"
    class="relative px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <span :class="{ 'opacity-0': loading }">提交</span>
    
    <!-- 加载中动画 -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { toast } from '@/utils/toast'

const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true
  
  try {
    await someAsyncOperation()
    toast.success('操作成功')
  } catch (error: any) {
    toast.error(error.message)
  } finally {
    loading.value = false
  }
}
</script>
```

## 🚀 快速开始

1. **直接使用 Toast**
   ```typescript
   import { toast } from '@/utils/toast'
   toast.success('Hello!')
   ```

2. **直接使用 Dialog**
   ```vue
   <script setup>
   import Dialog from '@/components/Dialog/Dialog.vue'
   </script>
   ```

3. **查看示例**
   - Toast: `src/components/Toast/Toast.vue`
   - Dialog: `src/components/Dialog/Dialog.vue`
   - 使用示例: `src/components/ConnectWalletModal/ConnectWalletModal.vue`

---

**所有组件都已完成迁移，功能保持一致！** 🎉


