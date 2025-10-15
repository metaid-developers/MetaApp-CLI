<script setup lang="ts">
import { ref } from 'vue'
import Toast, { type ToastProps } from './Toast.vue'

export interface ToastItem extends ToastProps {
  id: number
}

const toasts = ref<ToastItem[]>([])

// 添加 toast
const addToast = (toast: Omit<ToastItem, 'id' | 'onClose'>) => {
  const id = Date.now() + Math.random()
  const item: ToastItem = {
    ...toast,
    id,
    onClose: () => removeToast(id),
  }
  toasts.value.push(item)
  return id
}

// 移除 toast
const removeToast = (id: number) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// 清空所有 toast
const clearToasts = () => {
  toasts.value = []
}

// 暴露方法给外部使用
defineExpose({
  addToast,
  removeToast,
  clearToasts,
})
</script>

<template>
  <div class="toast-container">
    <TransitionGroup
      name="toast-list"
      tag="div"
      class="fixed top-4 right-4 z-[9999] flex flex-col gap-2"
    >
      <Toast
        v-for="toast in toasts"
        :key="toast.id"
        v-bind="toast"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-list-move,
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.3s ease;
}

.toast-list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.toast-list-leave-active {
  position: absolute;
}
</style>


