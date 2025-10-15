<template>
  <!-- 连接钱包 - 使用 Headless UI Dialog -->
  <TransitionRoot appear :show="isConnectionModalOpen" as="template">
    <Dialog as="div" class="relative z-[9999]" @close="closeConnectionModal">
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
            <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
              <div class="login-warp flex">
                <!-- 关闭按钮 -->
                <button
                  v-if="!loading"
                  class="close flex items-center justify-center absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
                  @click="closeConnectionModal"
                  aria-label="关闭"
                >
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div class="flex-1 p-6">
                  <!-- 选择钱包 -->
                  <div class="connect-wallet flex flex-col gap-6">
                    <div
                      class="connect-wallet-section"
                      v-for="(item, index) in wallets"
                      :key="index"
                    >
                      <div class="title text-lg font-semibold text-gray-900 mb-4">{{ item.title() }}</div>
                      <div class="btn-list flex flex-col gap-3">
                        <button
                          class="main-border flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                          @click="wallet.fun()"
                          v-for="(wallet, walletIndex) in item.list"
                          :key="walletIndex"
                        >
                          <img class="icon w-10 h-10" :src="wallet.icon" />
                          <div class="flex-1 text-left">
                            <div class="font-semibold text-gray-900">{{ wallet.name() }}</div>
                            <span class="desc text-sm text-gray-500">{{ wallet.desc() }}</span>
                          </div>
                        </button>
                      </div>
                    </div>
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

import { useRootStore } from '@/stores/root'
import { useUserStore } from '@/stores/user'
import { sleep } from '@/utils/util'
import { ref } from 'vue'
import { toast } from '@/utils/toast'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'

import SPACEIcon from '@/assets/images/metalet-logo-v3.svg?url'
import { useCredentialsStore } from '@/stores/credentials'
import { useConnectionStore } from '@/stores/connection'
import { useConnectionModal } from '@/hooks/use-connection-modal'

const rootStore = useRootStore()
const credentialsStore = useCredentialsStore()
const connectionStore = useConnectionStore()
const { isConnectionModalOpen, closeConnectionModal, setMissingWallet } =
  useConnectionModal()

const userStore = useUserStore()
const loading = ref(false)
const wallets = [
  {
    title: () => {
      return '连接钱包'
    },
    list: [
      {
        name: () => {
          return 'Metalet'
        },
        desc: () => {
          return ``
        },
        icon: SPACEIcon,
        fun: connectMetalet,
      },
      
    ],
  },

]

async function connectMetalet() {
  debugger
   if (!window.metaidwallet) {
    setMissingWallet('metalet')
   
    return
  }


    const connection = await connectionStore.connect('metalet').catch((err) => {
    toast.warning(err.message)
  })


    if (connection?.status === 'connected') {
    await credentialsStore.login()
    
    if(!userStore.last.name){
       closeConnectionModal()
      return
    }

    await sleep(300)

    closeConnectionModal()
    
  }



rootStore.checkBtcAddressSameAsMvc().then().catch(()=>{
          
            toast.warning('BTC 地址与 MVC 地址不一致')
           
            
        })


}


</script>
<style lang="scss" scoped></style>
