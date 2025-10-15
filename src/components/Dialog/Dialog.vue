<script setup lang="ts">
/**
 * Dialog 组件 - 替代 ElDialog
 * 基于 Headless UI 的 Dialog 组件
 */
import { computed } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

interface Props {
  modelValue: boolean
  title?: string
  width?: number | string
  closeOnClickModal?: boolean
  showClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  closeOnClickModal: true,
  showClose: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
    if (!value) {
      emit('close')
    }
  },
})

const dialogWidth = computed(() => {
  if (typeof props.width === 'number') {
    return `${props.width}px`
  }
  return props.width || 'auto'
})

const handleClose = () => {
  if (props.closeOnClickModal) {
    isOpen.value = false
  }
}
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-[9999]" @close="handleClose">
      <!-- 背景遮罩 -->
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-50" />
      </TransitionChild>

      <!-- Dialog 容器 -->
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all"
              :style="{ maxWidth: dialogWidth }"
            >
              <!-- Header -->
              <div v-if="title || showClose" class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <DialogTitle v-if="title" as="h3" class="text-lg font-semibold text-gray-900">
                  {{ title }}
                </DialogTitle>
                <div v-else></div>
                
                <button
                  v-if="showClose"
                  @click="isOpen = false"
                  class="rounded-lg p-1 hover:bg-gray-100 transition-colors"
                  aria-label="关闭"
                >
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Content -->
              <div class="px-6 py-4">
                <slot />
              </div>

              <!-- Footer (如果有) -->
              <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <slot name="footer" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>


