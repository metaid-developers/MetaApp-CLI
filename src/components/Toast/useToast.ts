import { toast } from '@/utils/toast'

/**
 * useToast composable
 * 提供便捷的toast通知方法
 */
export function useToast() {
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration = 3000
  ) => {
    return toast.show({ message, type, duration })
  }

  return {
    showToast,
    toast,
  }
}
