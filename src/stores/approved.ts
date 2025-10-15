import { defineStore } from 'pinia'
import { useLocalStorage, type RemovableRef } from '@vueuse/core'
import { useConnectionStore } from './connection'


export type ApproveType= {
isEnabled:boolean,
isApproved:boolean ,
autoPaymentAmount:number,
}

export const useApprovedStore = defineStore('approved', {
  state: () => {
    return {
      last: useLocalStorage('last-approved', {
        isEnabled:true,
        isApproved: false,
        autoPaymentAmount:10000,
      } as ApproveType) as RemovableRef<ApproveType>,
    }
  },

  getters: {
    has: (state) => !!state.last,
    canUse:(state) => state.last.isEnabled  && state.last.isApproved,
    canApproved:(state)=>state.last.isEnabled === true && state.last.isApproved === false
  },

  actions: {
       async getPaymentStatus(){
        
            const connectionStore=useConnectionStore()
            const res= await connectionStore.adapter.autoPaymentStatus()
            
            this.last=res
        },

        async getAutoPayment(){
            if(this.canApproved){
                const connectionStore=useConnectionStore()
               
                const res=await connectionStore.adapter.autoPayment()
                if(res.message == "Auto payment approved"){
                  this.last.isApproved=true
                }
                  
            }
        },

        clear(){
                 if (!this.last) return
                this.last.isEnabled = true
                this.last.isApproved = false
                this.last.autoPaymentAmount = 10000
        }

  },
})