import { defineStore } from 'pinia'
import { useLocalStorage, type RemovableRef } from '@vueuse/core'
import { toast } from '@/utils/toast'
import * as metaletAdapter from '@/wallet-adapters/metalet'
import { useCredentialsStore } from '@/stores/credentials'
import {type Network, useNetworkStore } from './network'
import { useUserStore } from './user'
import { useApprovedStore } from './approved'
import { useEcdhsStore } from './ecdh'

function getWalletAdapter(wallet: Wallet) {
  switch (wallet) {
    case 'metalet':
      return metaletAdapter
    default:
      throw new Error(`Unsupported wallet: ${wallet}`)
  }
}

function getWalletProvider(wallet: Wallet) {
  switch (wallet) {
    case 'metalet':
      return window.metaidwallet
    default:
      throw new Error(`Unsupported wallet: ${wallet}`)
  }
}

export type Wallet = 'metalet'
export type WalletConnection = {
  wallet: Wallet
  status: 'connected' | 'disconnected'
  address: string
  pubKey: string
}

export const useConnectionStore = defineStore('connection', {
  state: () => {
    return {
      last: useLocalStorage('last-connection', {
        wallet: 'metalet',
        status: 'disconnected',
        address: '',
        pubKey: '',
      } as WalletConnection) as RemovableRef<WalletConnection>,
    }
  },

  getters: {
    has: (state) => !!state.last,
    connected: (state) =>
      state.last.status === 'connected' && !!state.last.address,
    getAddress: (state) => {
      return state.last.address
    },
    isTaproot: (state) =>
      state.last.address.startsWith('bc1p') ||
      state.last.address.startsWith('tb1p'),
    getPubKey: (state) => state.last.pubKey,
    provider: (state) => {
      if (!state.last) return null
      return getWalletProvider(state.last.wallet)
    },
    adapter: (state) => {
      if (!state.last) throw new Error('No connection')

      const adapter: {
      
        getMvcBalance: () => Promise<any>
        getMvcAddress: () => Promise<string>
        getBtcAddress: () => Promise<string>
        pay:(toPayTransactions:{
        transations:Array<{
        txComposer: string
        message?: string
        }>,

        hasMetaid: boolean,
        feeb?: number
        }

      )=>{
        payedTransactions:string[]
      }
      smallPay:(toPayTransactions:{
        transations:Array<{
        txComposer: string
        message?: string
        }>,

        hasMetaid: boolean,
        feeb?: number
        }

      )=>{
        payedTransactions:string[]
      }
      autoPaymentStatus:()=>{
        isEnabled:boolean,
         isApproved:boolean,
         autoPaymentAmount:number
      }
      autoPayment:()=>{
        message:string
      }

        finishPsbt: (psbt: string) => string
        getAddress: () => Promise<string>

        signMvcMessage: (message: any) => Promise<any>
        getMvcPublickey: () => Promise<string>
        getPubKey: () => Promise<string>
        connect: () => Promise<{
          address: string
          pubKey: string
        }>
        metaletConnect?: () => Promise<{
          address: string
          pubKey: string
        }>
        disconnect: () => Promise<void>
        getBalance: () => Promise<number>
        inscribe: (tick: string) => Promise<string | undefined>
        signPsbt: (psbt: string, options?: any) => Promise<string>
        signPsbts: (psbts: string[], options?: any) => Promise<string[]>
        pushPsbt: (psbt: string) => Promise<string>
        signMessage: (message: string) => Promise<string>
        getPublicKey(): any
        getNetwork: () => Promise<Network>
        switchNetwork: (network: 'livenet' | 'testnet') => Promise<{
        address: string
        network: 'mainnet' | 'testnet'
        status: string
        }>
    
      } = getWalletAdapter(state.last.wallet)

      return adapter
    },
  },

  actions: {
    async connect(wallet: Wallet) {
      const connection: WalletConnection = this.last
        ? (JSON.parse(JSON.stringify(this.last)) as WalletConnection)
        : {
            wallet,
            status: 'disconnected',
            address: '',
            pubKey: '',
          }

      let connectRes = await getWalletAdapter(wallet).connect()
          
      try {
        if (connectRes) {
     
          const networkStore = useNetworkStore()
          const appNetwork = networkStore.network
          switch (wallet) {
            case 'metalet':
              const metaNetwork = await getWalletAdapter('metalet').getNetwork()
              if (metaNetwork !== appNetwork) {
                await getWalletAdapter('metalet').switchNetwork(appNetwork)
                connectRes = await getWalletAdapter('metalet').connect()
              }
              break
          }

          connection.address = connectRes.address
          connection.pubKey = connectRes.pubKey

          connection.status = 'connected'
          connection.wallet = wallet

          this.last = connection

          return this.last
        }
      } catch (e: any) {
        toast.error(e.message)
        connection.status = 'disconnected'
        connection.wallet = wallet
        this.last = connection
      }

      return this.last
    },

    async sync() {

      if (!this.connected) return

      this.last.status = 'connected'
      this.last.address = await this.adapter.getAddress()
      this.last.pubKey = await this.adapter.getMvcPublickey()
      const networkStore = useNetworkStore()

      const appNetwork = networkStore.network
      let networkSynced = true
      switch (this.last.wallet) {
        case 'metalet':
          const network = await this.adapter.getNetwork()
          if (network !== appNetwork) {
            networkSynced = false
            this.disconnect()
          }
          const userStore = useUserStore()
          await userStore.setUserInfo(this.last.address)
          break
      }

      if (networkSynced) {
        return this.last
      }
    },

    async disconnect() {
      if (!this.last) return

      this.last.status = 'disconnected'
      this.last.address = ''
      this.last.pubKey = ''
      this.last.wallet= 'metalet'

      const userStore = useUserStore()
 
      const approvedStore = useApprovedStore()
      const ecdhsStore=useEcdhsStore()
     const credentialsStore=useCredentialsStore()
     
      await userStore.clearUserInfo()
      ecdhsStore.clear()
      credentialsStore.clear()
     
      if (window.metaidwallet?.smallPay) {
        await approvedStore.clear()
      }
   
    },
  },
})
