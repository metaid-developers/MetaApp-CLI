// 格式化工具函数

/**
 * 格式化地址（显示前 N 位和后 M 位）
 */
export function formatAddress(address: string, prefix = 6, suffix = 4): string {
  if (!address || address.length <= prefix + suffix) {
    return address
  }
  return `${address.slice(0, prefix)}...${address.slice(-suffix)}`
}

/**
 * 格式化余额（satoshis 转 BTC）
 */
export function formatBalance(satoshis: number, decimals = 8): string {
  return (satoshis / 100000000).toFixed(decimals)
}

/**
 * 格式化时间（相对时间）
 */
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days} 天前`
  if (hours > 0) return `${hours} 小时前`
  if (minutes > 0) return `${minutes} 分钟前`
  if (seconds > 0) return `${seconds} 秒前`
  return '刚刚'
}

/**
 * 格式化日期时间
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

/**
 * 复制到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('复制失败:', error)
    
    // 降级方案
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return true
    } catch (fallbackError) {
      console.error('降级复制也失败:', fallbackError)
      return false
    }
  }
}

/**
 * 验证地址格式
 */
export function isValidAddress(address: string): boolean {
  // BTC Legacy 地址（1 开头）
  const btcLegacyRegex = /^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/
  // BTC SegWit 地址（3 开头）
  const btcSegwitRegex = /^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/
  // BTC Bech32 地址（bc1 开头）
  const btcBech32Regex = /^bc1[a-z0-9]{39,87}$/
  
  return btcLegacyRegex.test(address) || 
         btcSegwitRegex.test(address) || 
         btcBech32Regex.test(address)
}

/**
 * 截断文本
 */
export function truncateText(text: string, maxLength = 50): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * 睡眠函数（用于测试或延迟）
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

