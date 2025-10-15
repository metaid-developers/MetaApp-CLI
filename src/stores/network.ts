import { defineStore } from 'pinia'
import { NETWORK } from '@/data/constants'

export type Network = 'livenet' | 'testnet'
export const useNetworkStore = defineStore('network', {
  getters: {
    network: () => NETWORK,
    isTestnet: () => NETWORK === 'testnet',
  },
})

