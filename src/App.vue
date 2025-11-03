<template>
  <div>
    <div class=" flex flex-row  items-center justify-end bg-[#fff] p-3">
         <LoginedUserOperateVue />
    </div>
      <ConnectWalletModalVue />
     
  </div>





</template>
<script setup lang='ts'>

import ConnectWalletModalVue from '@/components/ConnectWalletModal/ConnectWalletModal.vue'
import LoginedUserOperateVue from '@/components/LoginUserOperate/LoginUserOperate.vue'
import {ref,onMounted,onUnmounted,onBeforeUnmount} from 'vue'
import { useRootStore } from './stores/root'
import { useConnectionStore } from './stores/connection'
import { useUserStore } from './stores/user'
import { useToast } from '@/components/Toast/useToast.ts'
import { useCredentialsStore } from './stores/credentials'
import { type Network, useNetworkStore } from '@/stores/network'
import {completeReload, sleep} from '@/utils/util'
import { useConnectionModal } from './hooks/use-connection-modal'

const accountInterval=ref()
const rootStore=useRootStore()
const connectionStore=useConnectionStore()
const userStore=useUserStore()
const credentialsStore=useCredentialsStore()
const { showToast } = useToast()
const isNetworkChanging = ref(false)
const MAX_RETRY_TIME = 10000 // 最大等待时间（毫秒）
const RETRY_INTERVAL = 100  // 重试间隔（毫秒）
const networkStore = useNetworkStore()
const {  closeConnectionModal } =useConnectionModal()



async function connectMetalet() {

  try {
    const connection = await connectionStore.connect('metalet').catch((err) => {
      showToast(err.message,'error')
   
  })
    if (connection?.status === 'connected') {
    await credentialsStore.login()

  }
  } catch (error) {
    showToast(error.message,'error')
  }

    

}

function handleNetworkChanged(network: Network) {
isNetworkChanging.value = true

const appNetwork = networkStore.network
if (network !== appNetwork) {
connectionStore.disconnect()
}

isNetworkChanging.value = false
}

const metaletAccountsChangedHandler = () => {
try {
if (useConnectionStore().last.wallet !== 'metalet') return
if(rootStore.isWebView) return
connectionStore.disconnect()
showToast('Metalet 账户已变更。正在刷新页面...','warning')
sleep().then(()=>completeReload())


} catch (error) {
console.error('Error in metaletAccountsChangedHandler:', error)
}
}




const metaletNetworkChangedHandler = (network: Network) => {
if (useConnectionStore().last.wallet !== 'metalet') return
if(rootStore.isWebView) return
handleNetworkChanged(network)
}

const appLoginSuccessHandler= async (data: any) => {

try {

if (!userStore.isAuthorized) {
await connectMetalet()


}

} catch (error) {
  showToast(error,'error')

}
}




const appAccountSwitchHandler= async(data:any)=>{
//ElMessage.success('调用onAccountSwitch')
try {
if(rootStore.isWebView){

await connectionStore.disconnect()

await connectMetalet()


}
} catch (error) {
throw new Error(error)
}
}

const appLogoutHandler= async (data: any) => {
try {
console.log("退出登录成功", data)
if (userStore.isAuthorized) {
await connectionStore.disconnect()
closeConnectionModal()
}
} catch (error) {
console.error('Error in Logout handler:', error)
}
}







onMounted(async () => {
   
  let retryCount = 0
  let timeoutId: NodeJS.Timeout | undefined
  //document.addEventListener('visibilitychange', handleVisibilityChange);
 
      accountInterval.value = setInterval(async () => {
    try {
       rootStore.checkWebViewBridge()
       if(rootStore.isWebView) return
        if (!userStore.isAuthorized) {
     
        if(rootStore.isWebView){
        await connectMetalet()
        }
        }
      if (window.metaidwallet && connectionStore.last.status == 'connected' && userStore.isAuthorized) {
        const res = await window.metaidwallet.getAddress()

        if ((res as any)?.status === 'not-connected' || userStore.last?.address !== res) {
          connectionStore.disconnect()
          showToast('Metalet 账户已变更','warning')
        }
      }
    } catch (error) {
      console.error('Error checking account status:', error)
    }
  }, 2 * 1000)
  







  const checkMetalet =  () => {
    rootStore.checkWebViewBridge()
    if (window.metaidwallet) {
      
      try {
          
        ;(window.metaidwallet as any)?.on('accountsChanged',metaletAccountsChangedHandler)
        ;(window.metaidwallet as any)?.on('networkChanged',metaletNetworkChangedHandler)

        ;(window.metaidwallet as any)?.on('LoginSuccess',appLoginSuccessHandler)




        ;(window.metaidwallet as any)?.on('onAccountSwitch',appAccountSwitchHandler)



        ;(window.metaidwallet as any)?.on('Logout',appLogoutHandler)

      } catch (err) {
        
        console.error('Failed to setup Metalet listeners:', err)
      }
    } else if (retryCount * RETRY_INTERVAL < MAX_RETRY_TIME) {
      
      retryCount++
      timeoutId = setTimeout(checkMetalet, RETRY_INTERVAL)
    } else {
      
      console.warn('Metalet wallet not detected after timeout')
    }
  }

  // 初始检查
  checkMetalet()


  if(window.metaidwallet && connectionStore.last.status == 'connected' && userStore.isAuthorized){
      rootStore.checkBtcAddressSameAsMvc().then().catch(()=>{
            showToast('Metalet BTC当前地址与MVC地址不一致，请切换BTC地址与MVC地址一致后再进行使用','warning')
              setTimeout(() => {
                 connectionStore.disconnect()
              }, 3000);

        })



  }


  onUnmounted(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })
})

onBeforeUnmount(async () => {
  // remove event listener
  try {
    ;(window.metaidwallet as any)?.removeListener(
      'accountsChanged',
      metaletAccountsChangedHandler,
    )
    ;(window.metaidwallet as any)?.removeListener(
      'networkChanged',
      metaletNetworkChangedHandler,
    )

    ;(window.metaidwallet as any)?.removeListener('LoginSuccess',appLoginSuccessHandler)
    ;(window.metaidwallet as any)?.removeListener('Logout',appLogoutHandler)
  
    ;(window.metaidwallet as any)?.removeListener(
    'onAccountSwitch',
    appAccountSwitchHandler

    )
  

    clearInterval(accountInterval.value)
  } catch (error) {
    console.error('Error removing event listeners:', error)
  }
})


</script>
<style lang='scss' scoped>

</style>