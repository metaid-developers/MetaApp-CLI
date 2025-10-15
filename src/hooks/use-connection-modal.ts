import { createGlobalState } from '@vueuse/core'
import { type Ref, ref } from 'vue'

import {type Wallet } from '@/stores/connection'

export const useConnectionModal = createGlobalState(() => {
  // state
  const isConnectionModalOpen = ref(false)
  const isWalletMissingModalOpen = ref(false)
  const missingWallet: Ref<Wallet | undefined> = ref()

  // actions
  const openConnectionModal = () => {
    
    isConnectionModalOpen.value = true
  }

  const closeConnectionModal = () => {
    isConnectionModalOpen.value = false
  }

  const openWalletMissingModal = () => {
    isWalletMissingModalOpen.value = true
  }

  const closeWalletMissingModal = () => {
    isWalletMissingModalOpen.value = false
  }

  const setMissingWallet = (wallet: Wallet) => {
    missingWallet.value = wallet
    openWalletMissingModal()
  }

  return {
    isConnectionModalOpen,
    openConnectionModal,
    closeConnectionModal,

    isWalletMissingModalOpen,
    openWalletMissingModal,
    closeWalletMissingModal,
    missingWallet,
    setMissingWallet,
  }
})
