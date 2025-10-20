/**
 * 全局组件类型声明
 * 使 TypeScript 能够识别全局注册的组件
 */

import Image from './components/Image/Image.vue'
import UserAvatar from './components/UserAvatar/UserAvatar.vue'

declare module 'vue' {
  export interface GlobalComponents {
    Image: typeof Image
    UserAvatar: typeof UserAvatar
  }
}

export {}




