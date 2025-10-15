// LocalStorage 工具函数

/**
 * 安全地从 localStorage 获取数据
 */
export function getStorage<T>(key: string, defaultValue: T | null = null): T | null {
  try {
    const item = localStorage.getItem(key)
    if (item === null) return defaultValue
    return JSON.parse(item) as T
  } catch (error) {
    console.error(`获取 localStorage ${key} 失败:`, error)
    return defaultValue
  }
}

/**
 * 安全地设置 localStorage 数据
 */
export function setStorage(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`设置 localStorage ${key} 失败:`, error)
    return false
  }
}

/**
 * 移除 localStorage 数据
 */
export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`移除 localStorage ${key} 失败:`, error)
  }
}

/**
 * 清空所有 localStorage 数据
 */
export function clearAllStorage(): void {
  try {
    localStorage.clear()
    console.log('✅ 所有本地存储已清空')
  } catch (error) {
    console.error('❌ 清空本地存储失败:', error)
  }
}

/**
 * 清空指定前缀的 localStorage 数据
 */
export function clearStorageByPrefix(prefix: string): void {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key)
      }
    })
    console.log(`✅ 清空前缀为 ${prefix} 的本地存储`)
  } catch (error) {
    console.error('❌ 清空本地存储失败:', error)
  }
}

/**
 * 获取 localStorage 使用情况
 */
export function getStorageStats(): { used: number; total: number; percentage: number } {
  try {
    let used = 0
    Object.keys(localStorage).forEach(key => {
      const value = localStorage.getItem(key) || ''
      used += key.length + value.length
    })
    
    // 大多数浏览器的 localStorage 限制是 5-10MB
    const total = 5 * 1024 * 1024 // 5MB
    const percentage = (used / total) * 100

    return { used, total, percentage: Math.round(percentage * 100) / 100 }
  } catch (error) {
    console.error('获取存储统计失败:', error)
    return { used: 0, total: 0, percentage: 0 }
  }
}

