<template>
  <Image
    class="avatar "
    :src="image"
    :type="type"
    :default-image="DefaultAvatar"
    :custom-class="customClass"
    ref="AvatarRef"
    v-if="!isCustom"
  />

  <div
    v-else
    :style="avatarStyle"
    class="flex items-center justify-center font-semibold text-white rounded-full overflow-hidden"
  >
    {{ props.name ? props.name.slice(0, 2).toUpperCase() : '' }}
  </div>
</template>
<script lang="ts" setup>
import { computed,ref } from 'vue'
import DefaultAvatar from '@/assets/images/default_user.png'

const AvatarRef = ref()
interface Props {
  name?: string
  metaName: string
  metaId?: string
  image: string
  isCustom: boolean
  type?: 'metaId' | 'metafile'
  disabled?: boolean
  imageClass?: string
  size?: number
}
const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  type: 'metaId',
  isCustom: false,
})

const customClass = computed(() => {
  return props.imageClass ? props.imageClass + ' avatar-rounded' : 'avatar-rounded'
})

// 计算头像样式
const avatarStyle = computed(() => {
  return {
    background: generateTelegramGradient(props.name || ''),
    minWidth: `${props.size}px`,
    minHeight: `${props.size}px`,
    fontSize: `${props.size ? props.size / 2.5 : 20}px`,
  }
})

// 生成类似 Telegram 的渐变背景色（基于用户名）
function generateTelegramGradient(name: string) {
  // 更深色的渐变色组合，提高文字可读性
  const gradients = [
    'linear-gradient(135deg, #4a5eb8 0%, #5a3882 100%)', // 深蓝紫渐变
    'linear-gradient(135deg, #c06cc7 0%, #c7455a 100%)', // 深粉红渐变
    'linear-gradient(135deg, #3b8bcc 0%, #0097a7 100%)', // 深蓝青渐变
    'linear-gradient(135deg, #2e8b5b 0%, #26a69a 100%)', // 深绿青渐变
    'linear-gradient(135deg, #c75877 0%, #d4af37 100%)', // 深粉黄渐变
    'linear-gradient(135deg, #6a9daa 0%, #d8749c 100%)', // 深青粉渐变
    'linear-gradient(135deg, #cc9966 0%, #a67c52 100%)', // 深黄橙渐变
    'linear-gradient(135deg, #cc6660 0%, #b8396b 100%)', // 深红粉渐变
    'linear-gradient(135deg, #5faab3 0%, #5db877 100%)', // 深蓝绿渐变
    'linear-gradient(135deg, #a67799 0%, #b8a85a 100%)', // 深紫黄渐变
    'linear-gradient(135deg, #5bc5cc 0%, #4d7fd9 100%)', // 深青蓝渐变
    'linear-gradient(135deg, #cc9a1f 0%, #1a8b8a 100%)', // 深黄青渐变
  ]

  if (!name) return gradients[0]

  // 使用名字的哈希值来选择渐变
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  const index = Math.abs(hash) % gradients.length
  return gradients[index]
}

</script>
<style lang="scss" scoped src="./UserAvatar.scss"></style>
