
import { defineStore } from 'pinia'
import { useConnectionStore } from './connection'

const UA = window.navigator.userAgent.toLowerCase()
export const isAndroid = !!(UA && UA.indexOf('android') > 0)
export const isIOS = !!(UA && /iphone|ipad|ipod|ios/.test(UA))

interface RootState {
  isWebView:boolean
}

export const useRootStore = defineStore('root', {
  state: (): RootState => ({
      isWebView: false
    }),
  getters: {
  
  },
  actions: {
    async checkBtcAddressSameAsMvc(){
      const connectionStore=useConnectionStore()
     
      const mvcAddress=await connectionStore.adapter.getMvcAddress() //userStore.last.address
      const btcAddress= await connectionStore.adapter.getBtcAddress()
      if(mvcAddress && btcAddress && mvcAddress !== btcAddress){
       
        throw new Error('BTC 地址与 MVC 地址不一致，请确保使用相同的钱包地址')
      }
    },

    checkWebViewBridge():boolean{
      if(isIOS || isAndroid){
        if (window?.navigator) {  
          const userAgent=window?.navigator?.userAgent || ''
        if(userAgent == 'IDChat-iOS' || userAgent == 'IDChat-Android'){
          this.isWebView=true
          return true
             }else{
               return false
             }
        
        }else{
          return false
        }
      }else{
        return false
      }
    }
  },
})