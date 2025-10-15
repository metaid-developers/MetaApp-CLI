/**
 * Toast 通知服务
 * 替代 Element UI 的 ElMessage
 * 使用方法与 ElMessage 保持一致
 */

import { createApp, type App } from 'vue'
import ToastContainer from '@/components/Toast/ToastContainer.vue'
import type { ToastItem } from '@/components/Toast/ToastContainer.vue'

// Toast 实例
let toastApp: App | null = null
let containerInstance: any = null

/**
 * 初始化 Toast 容器
 */
function initToastContainer() {
  if (containerInstance) return containerInstance

  // 创建容器 DOM
  const container = document.createElement('div')
  container.id = 'toast-container-root'
  document.body.appendChild(container)

  // 创建 Vue 应用实例
  toastApp = createApp(ToastContainer)
  containerInstance = toastApp.mount(container)

  return containerInstance
}

/**
 * 显示 Toast
 */
function showToast(options: Omit<ToastItem, 'id' | 'onClose'>) {
  const container = initToastContainer()
  return container.addToast(options)
}

/**
 * Toast 服务对象（兼容 ElMessage API）
 */
export const toast = {
  /**
   * 成功提示
   */
  success(message: string, duration = 3000) {
    return showToast({ message, type: 'success', duration })
  },

  /**
   * 错误提示
   */
  error(message: string, duration = 3000) {
    return showToast({ message, type: 'error', duration })
  },

  /**
   * 警告提示
   */
  warning(messageOrOptions: string | { message: string; type?: string; duration?: number }, duration = 3000) {
    if (typeof messageOrOptions === 'string') {
      return showToast({ message: messageOrOptions, type: 'warning', duration })
    } else {
      return showToast({
        message: messageOrOptions.message,
        type: 'warning',
        duration: messageOrOptions.duration || duration,
      })
    }
  },

  /**
   * 信息提示
   */
  info(message: string, duration = 3000) {
    return showToast({ message, type: 'info', duration })
  },

  /**
   * 通用方法（支持对象参数）
   */
  show(options: { message: string; type?: 'success' | 'error' | 'warning' | 'info'; duration?: number }) {
    return showToast({
      message: options.message,
      type: options.type || 'info',
      duration: options.duration || 3000,
    })
  },

  /**
   * 清空所有 Toast
   */
  closeAll() {
    if (containerInstance) {
      containerInstance.clearToasts()
    }
  },
}

/**
 * 默认导出（兼容 ElMessage 的使用方式）
 */
export default toast

/**
 * 命名导出（推荐使用）
 */
export { toast as message }

/**
 * ElMessage 兼容别名
 */
export const ElMessage = toast


