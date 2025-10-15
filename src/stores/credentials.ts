import { defineStore,type _GettersTree } from 'pinia'
import { useLocalStorage, type RemovableRef } from '@vueuse/core'
import { useConnectionStore } from '@/stores/connection'
import { SIGNING_MESSAGE } from '@/data/constants'
import {useUserStore} from '@/stores/user'



export const useCredentialsStore =defineStore('credentials', {
  state: () => {
    return {
      credentials: useLocalStorage(
        'credentials',
        [] as { publicKey: string; signature: string; address: string,shareSecret?:string,marketSig?:string }[],
      ) as RemovableRef<
        { publicKey: string; signature: string; address: string,shareSecret?:string,marketSig?:string }[]
      >,
      signing: false,
    }
  },

  getters: {
    getByAddress: (state) => {
      return (address: string) => {
        return state.credentials.find((s) => s.address === address)
      }
    },

    has: (state) => {
      return (address: string) => {
        return !!state.credentials.find((s) => s.address === address)
      }
    },

    get: (state) => {
      const connectionStore = useConnectionStore()
      const connected = connectionStore.connected
      const address = connectionStore.getAddress
      const credential = state.credentials.find((s) => s.address === address)

      const ready = connected && !!credential

      if (!ready) return false

      return credential
    },

    ready: (state) => {
      const connectionStore = useConnectionStore()
      const connected = connectionStore.connected
      const address = connectionStore.getAddress
      const credential = state.credentials.find((s) => s.address === address)

      return connected && !!credential
    },
  },

  actions: {
    add({
      publicKey,
      signature,
      address,
     
    }: {
      publicKey: string
      signature: string
      address: string
     
    }) {
      if (this.credentials.find((s) => s.address === address)) return

      this.credentials.push({ publicKey, signature, address })
    },

    remove(address: string) {
      this.credentials = this.credentials.filter((s) => s.address !== address)
    },

    clear(){
      this.credentials=[]
    },

    update(shareSecret: string){
        const connectionStore = useConnectionStore()
        const address = connectionStore.getAddress
        this.credentials.forEach((s) => {
        if( s.address === address && !s.shareSecret){
        s.shareSecret=shareSecret
        }
        })
    },

    async sign() {
      
      const connectionStore = useConnectionStore()
      const connection = connectionStore.last
      if (!connection.address || connection.status === 'disconnected') {
        throw new Error('Please connect to a wallet first.')
      }
      
      const address = connectionStore.getAddress


      const credential = this.getByAddress(address)
      if (credential) return credential


      this.signing = true

   
      const message = SIGNING_MESSAGE
    
      let publicKey: string = connection.pubKey
      let signature: string = ''
    
      try {
        switch (connection.wallet) {
          case 'metalet':
            publicKey = await connectionStore.adapter.getMvcPublickey()
            
            signature = await connectionStore.adapter.signMessage(message)
            
            break
          default:
            throw new Error(`Unsupported wallet: ${connection.wallet}`)
        }

        this.add({ publicKey, signature, address })

        return { publicKey, signature, address }
      } catch (e) {
      
        this.signing = false
      }
    },

    async login() {
    
      
      const connectionStore = useConnectionStore()
      const synced = await connectionStore.sync()
      if (!synced) {
        return false
      }


      const credential = await this.sign()
      
      if (!credential) return false
      debugger
      const userStore=useUserStore()
      await userStore.setUserInfo(credential.address)
      return credential
    },
  },
})
