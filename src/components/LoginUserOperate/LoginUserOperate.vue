<template>

  <template v-if="!connectionStore.connected && !isAndroid && !isIOS && !rootStore.isWebView">
    <a class="main-border primary connect-wallet" @click="openConnectionModal">Connect Wallet</a>
  </template>

  <template v-else-if="!credentialsStore.get && !isAndroid && !isIOS && !rootStore.isWebView">
    <a class="main-border primary connect-wallet" @click="credentialsStore.login()">Authorize</a>
  </template>

  <template v-else>
    <div class="user-warp flex flex-align-center" v-if="userStore.isAuthorized">
     
      <!-- 👤 头像 -->
      <UserAvatar
        :image="userStore.last!.avatar"
        :meta-id="userStore.last!.metaid"
        :name="userStore.last.name"
        class="user-warp-item  overflow-hidden"
        :meta-name="''"
        :disabled="true"
      />
     
    </div>
  </template>

  <!-- 更多操作 - 使用 Headless UI Menu -->
  <Menu as="div" class="relative">
    <MenuButton
      class="more flex items-center justify-center user-warp-item"
      :class="{ active: isShowUserMenu }"
      @click="isShowUserMenu = !isShowUserMenu"
    >
      <svg v-if="isShowUserMenu" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
      </svg>
    </MenuButton>

    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <MenuItems class="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
        <div class="p-2">
          <!-- Fee Settings Item -->
          <MenuItem v-slot="{ active }">
            <button
              :class="[
                active ? 'bg-gray-100 dark:bg-gray-700' : '',
                'w-full rounded-lg p-3 text-left transition-colors flex items-center justify-center'
              ]"
              @click="handleFeeClick"
            >
              <div class="fee-select flex items-center ">
                <img
                  :src="currentChainIcon"
                  :alt="chainStore.state.currentChain.toUpperCase()"
                  class="chain-icon-menu w-6 h-6 rounded-full mr-2"
                />
                <div class="flex-1 flex items-center mr-2">
                  <div class="fee-rate-menu font-medium mr-1 text-gray-900 dark:text-white">
                    {{ currentFeeRate }}
                  </div>
                  <div class="fee-unit-menu text-sm text-gray-500 dark:text-gray-400">
                    {{ chainStore.state.currentChain === 'btc' ? 'sat/vB' : 'sats/b' }}
                  </div>
                </div>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </MenuItem>

             <!-- Logout Item -->
          <MenuItem v-slot="{ active }">
            <button
              :class="[
                active ? 'bg-red-50 dark:bg-red-900/20' : '',
                'w-full rounded-lg p-3 text-left transition-colors flex items-center justify-center  text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300'
              ]"
              @click="connectionStore.disconnect()"
            >
             <div class=" flex items-center justify-center">
               <!-- 登出图标 -->
              <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              
              <!-- 文字 -->
              <span class="font-medium">Logout</span>
             </div>
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>

  <!-- Fee Modal -->
  <Teleport to="body">
    <FeeModal v-model="showFeeModal" @confirm="handleFeeConfirm" />
  </Teleport>

    <!-- Profile Edit Modal -->
  <Teleport to="body">
    <ProfileEditModal v-model="layout.isShowProfileEditModal" />
  </Teleport>


</template>

<script setup lang="ts">
import { useRootStore } from '@/stores/root'
import { useUserStore } from '@/stores/user'
import { useChainStore } from '@/stores/chain'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { computed, ref, nextTick } from 'vue'

import FeeModal from '@/components/FeeModal/FeeModal.vue'

import { useConnectionModal } from '@/hooks/use-connection-modal'
import { useConnectionStore } from '@/stores/connection'
import { useCredentialsStore } from '@/stores/credentials'

import btcIcon from '@/assets/images/btc.png'
import mvcIcon from '@/assets/images/mvc.png'
import { isAndroid, isIOS } from '@/stores/root'
import { useLayoutStore } from '@/stores/layout'
import ProfileEditModal from '@/components/ProfileEditModal/ProfileEditeModal.vue'

const { openConnectionModal } = useConnectionModal()

const connectionStore = useConnectionStore()
const credentialsStore = useCredentialsStore()
const rootStore=useRootStore()
const layout=useLayoutStore()
const userStore = useUserStore()
const chainStore = useChainStore()


const isShowUserMenu = ref(false)
const showFeeModal = ref(false)

// Fee badge computed properties
const currentChainIcon = computed(() => {
  return chainStore.state.currentChain === 'btc' ? btcIcon : mvcIcon
})

const currentFeeRate = computed(() => {
  const currentChain = chainStore.state.currentChain
  const chainData = chainStore.state[currentChain]
  const selectedFeeType = chainData.selectedFeeType
  return chainData[selectedFeeType]
})

// Handle fee confirmation
const handleFeeConfirm = (data: { chain: 'btc' | 'mvc'; feeType: string; customFee?: number }) => {
  console.log('Fee configuration updated:', data)
}

const handleFeeClick = (event?: Event) => {
  if (event) {
    event.stopPropagation()
    event.preventDefault()
  }
  console.log('Current showFeeModal:', showFeeModal.value)
  showFeeModal.value = true
  isShowUserMenu.value = false // 关闭下拉菜单
  console.log('Updated showFeeModal:', showFeeModal.value)
  // 稍微延迟一下，确保下拉菜单关闭后再显示模态框
  nextTick(() => {
    console.log('NextTick - showFeeModal:', showFeeModal.value)
  })
}


</script>

<style lang="scss" scoped src="./LoginUserOperate.scss">


</style>
