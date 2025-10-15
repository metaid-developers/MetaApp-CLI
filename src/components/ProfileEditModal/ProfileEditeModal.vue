<template>
  <TransitionRoot appear :show="modelValue" as="template">
    <Dialog as="div" class="relative z-[9999]" @close="emit('update:modelValue', false)">
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
            <DialogPanel class="w-full max-w-[500px] transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all">
    <div class="profile-edit-modal py-8 px-6">
      <button
        class="close flex items-center justify-center"
        @click="emit('update:modelValue', false)"
        type="button"
      >
        <!-- X Mark Icon -->
        <svg class="icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div class="title">Set Up Your Profile</div>

      <div class="profile-edit-modal">
        <p class="description text-center text-gray-500 mb-6">
         Make your account stand out — add a unique avatar and display name!
        </p>

        <div class="avatar-section mb-6">
          <div class="rounded-full flex items-center justify-center space-x-4">
            <!-- 自定义文件上传 -->
            <div class="avatar-uploader relative">
              <input
                type="file"
                ref="fileInput"
                @change="handleFileChange"
                accept="image/jpeg,image/png"
                class="hidden"
                id="avatar-upload"
              />
              <label for="avatar-upload" class="cursor-pointer">
                <img class="avatar-preview" :src="imageUrl || currentAvatar" alt="Avatar Preview" />
                
                <!-- 相机图标按钮 -->
                <button
                  type="button"
                  @click.prevent="triggerFileInput"
                  class="upload-button absolute bottom-4 right-0 w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-lg"
                >
                  <!-- Camera Icon -->
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  
                  <!-- Optional 文字 -->
                  <!-- <span class="optional-text">Optional</span> -->
                </button>
              </label>
            </div>
          </div>
        </div>

        <div class="username-section mb-6 mt-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
           User Name
          </label>
          <input
            v-model="username"
            type="text"
            placeholder="What's Your MetaWeb User Name?"
            class=" main-border w-full text-base px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div class="username-section mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Profile
          </label>
          <input
            v-model="profile"
            type="text"
            placeholder="Profile (Optional)"
            class="main-border  w-full text-base  px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div class="flex justify-end">
          <button
            type="button"
            :class="['main-border', hasChanges && !loading ? 'primary' : '']"
            @click="save"
            :disabled="loading"
            class="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
          >
            <!-- Arrow Right Icon -->
            <svg
              v-if="!loading"
              class="w-6 h-6 cursor-pointer hover:text-gray-700 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            
            <!-- Loading Spinner -->
            <div v-else class="loading-spinner w-8 h-8">
              <div class="spinner"></div>
            </div>
          </button>
        </div>
      </div>
    </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineProps, defineEmits } from 'vue'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { toast } from '@/utils/toast'
import { useUserStore } from '@/stores/user'
import DefaultAvatar from '@/assets/images/default_user.png'
import { DB } from '@/utils/db'
import { image2Attach } from '@/lib/file'
import { createOrUpdateUserInfo, getMVCRewards } from '@/utils/userInfo'
import {getEcdhPublickey} from '@/wallet-adapters/metalet'



const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue'])



const userStore = useUserStore()
const avatarPreview = ref<string>('')
const username = ref<string>('')
const profile = ref<string>('')
const imageUrl = ref('')
const currentAvatar = ref<string>(DefaultAvatar)
const imgRaw = ref<File | null>(null)
const loading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)



watch(
  () => userStore.last?.avatar,
  () => {
    getImageUrl()
  },
  { immediate: true }
)

// eslint-disable-next-line no-undef
const getBase64 = (img: File, callback: (url: string) => void) => {
  const reader = new FileReader()
  // eslint-disable-next-line node/no-callback-literal
  reader.addEventListener('load', () => callback(reader.result as string))
  reader.readAsDataURL(img)
}

async function getImageUrl() {
  const src = userStore.last?.avatar
  DB.getMetaFile(src, 235, 'metafile').then(res => {
    currentAvatar.value = res || DefaultAvatar
  })
}

// 初始化表单数据（只在modal第一次打开时初始化）
let hasInitialized = false
watch(
  () => props.modelValue,
  newVal => {
    if (newVal && !hasInitialized) {
      // 只在modal第一次打开时初始化，避免死循环
      avatarPreview.value = userStore.last?.avatar || ''
      username.value = userStore.last?.name || ''
      profile.value = userStore.last?.bio || ''
      hasInitialized = true
    } else if (!newVal) {
      // modal关闭时重置表单
      avatarPreview.value = ''
      username.value = ''
      profile.value = ''
      hasInitialized = false
    }
  }
)

const hasChanges = computed(() => {
  return (
    imageUrl.value ||
    username.value !== (userStore.last?.name || '') ||
    profile.value !== (userStore.last?.bio || '')
  )
})

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // 验证文件类型
  if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
    toast.error('Avatar picture must be JPG or PNG format!')
    return
  }

  try {
    // 压缩图片并显示预览
    getBase64(file, url => {
      imageUrl.value = url
    })
    imgRaw.value = file
  } catch (error) {
    console.error('Failed to process image:', error)
    toast.error('Failed to compress image. Please try another image.')
  }
}

const save = async () => {
  if (!hasChanges.value || loading.value) {
    toast.info('No changes to save.')
    return
  }

  loading.value = true
  try {
    const values: any = {}
    if (imgRaw.value) {
      const [image] = await image2Attach(([imgRaw.value] as unknown) as FileList)
      values.avatar = Buffer.from(image.data, 'hex').toString('base64')
    }
    if (username.value !== userStore.last?.name) {
      values.name = username.value
    }
    if (profile.value !== userStore.last?.bio) {
      values.bio = profile.value
    }
    if(!userStore.last?.chatpubkey){
      
      const ecdh=await getEcdhPublickey()
      if(ecdh){
         values.chatpubkey=ecdh?.ecdhPubKey
       
      }
      
    }

    await createOrUpdateUserInfo({
      userData: values,
      oldUserData: {
        nameId: userStore.last?.nameId || '',
        bioId: userStore.last?.bioId || '',
        avatarId: userStore.last?.avatarId || '',
        chatpubkey:userStore.last?.chatpubkey || ''
      },
      options: {
        feeRate: 1,
        network: 'mainnet',
        assistDomain: 'https://www.metaso.network/assist-open-api',
      },
    })
    if (!userStore.last.nameId) {
      const publicKey = await window.metaidwallet!.btc.getPublicKey!()
      const signature: any = await window.metaidwallet!.btc.signMessage('metaso.network')
      await getMVCRewards(
        {
          address: userStore.last!.address,
          gasChain: 'mvc',
        },
        {
          'X-Public-Key': publicKey,
          'X-Signature': signature,
        }
      )
    }
    
    await userStore.setUserInfo(userStore.last!.address)
    console.log('Saving profile changes:', values)
    toast.success('Profile updated successfully!')
    emit('update:modelValue', false)

  } catch (error) {
    console.error('Failed to save profile changes:', error)
    toast.error('Failed to save profile changes.')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.profile-edit-modal {
  .close {
    position: absolute;
    left: 50%;
    bottom: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--themeBgSecondColor, #f3f4f6);
    cursor: pointer;
    margin-left: -20px;
    margin-bottom: -70px;
    border: none;
    transition: all 0.3s ease;

    &:hover {
      background: #e5e7eb;
      transform: scale(1.1);
      
      .icon {
        transform: rotate(180deg);
      }
    }

    .icon {
      transition: all 0.5s ease;
      color: var(--themeTextColor, #1f2937);
    }
  }
  
  :global(.dark) & {
    .close {
      background: var(--themeBgSecondColor, #374151);
      
      &:hover {
        background: #4b5563;
      }
      
      .icon {
        color: var(--themeTextColor, #f9fafb);
      }
    }
  }
  .title {
    font-size: 24px;
    font-weight: 600;
    color: var(--themeTextColor);
    margin-bottom: 16px;
    text-align: center;
  }

  .description {
    font-size: 16px;
    line-height: 1.5;
    color: var(--themeTextSecondColor);
    margin-bottom: 24px;
    text-align: left;
  }
  .username-section {
    display: flex;
    align-items: center;
    label {
      min-width: 100px;
    }
  }
  .avatar-section {
    width: 110px;
    height: 110px;
    margin: 0 auto;
    .avatar-wrap {
      img {
        width: 110px;
        height: 110px;
        border-radius: 33%;
        object-fit: cover;
        box-shadow: 2px 5px 0px 1px rgba(0, 0, 0, 1);
      }
    }
    .avatar-preview {
      width: 110px;
      height: 110px;
      border-radius: 33%;
      object-fit: cover;
      // box-shadow: 2px 5px 0px 1px rgba(0, 0, 0, 1);
      border: 2px solid rgba(0, 0, 0, 1);
    }
    .avatar-uploader {
      position: relative;
      
      .upload-button {
        position: relative;
        
        .optional-text {
          position: absolute;
          top: 50%;
          left: 100%;
          transform: translateY(-50%);
          margin-left: 10px;
          white-space: nowrap;
          font-size: 14px;
          color: var(--themeTextSecondColor);
        }
      }
    }
  }

  .loading-spinner {
    display: flex;
    align-items: center;
    justify-content: center;

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid var(--themeTextColor);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
