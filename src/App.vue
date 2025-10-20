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



</script>
<style lang='scss' scoped>

</style>