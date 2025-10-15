import { defineStore,type _GettersTree } from 'pinia'
import { useLocalStorage, type RemovableRef } from '@vueuse/core'
import {type UTXO} from '@/@types/common'




export const useUtxosStore =defineStore('utxos', {
  state: () => {
    return {
      utxoList: useLocalStorage(
        'useable-utxo',
        Array<UTXO>,
      ) as RemovableRef<
        Array<UTXO>
      >
    }
  },

  getters: {
    getUtxo: (state) => {
      return (address: string) => {
        return state.utxoList.find((s) => s.address === address)
      }
    },
  },

  actions: {
    insert(utxos:UTXO,address:string) {
      if (this.utxoList.find((s) => s.address === address)) return
       this.utxoList.push(utxos)
      
    },

  
    remove(address: string) {
      this.utxoList = this.utxoList.filter((s) => s.address !== address)
    },

 

 
  },
})