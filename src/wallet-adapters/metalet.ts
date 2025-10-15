import { toast } from '@/utils/toast'
import { Buffer } from 'buffer'

import { useConnectionStore } from "@/stores/connection";

import { useApprovedStore } from '@/stores/approved';
import { useChainStore } from '@/stores/chain';
import {MAN_PUB_KEY} from '@/data/constants'


function checkMetalet() {
  const connectionStore=useConnectionStore()
  if (!window.metaidwallet && !connectionStore.connected) {
    throw new Error('Please install the Metalet wallet extension first.')
  }
}

function checkMetaletStatus(res: any, actionName: string) {
  if (res?.status) {
    throw new Error(`Metalet ${actionName} status: ${res?.status}`)
  }
  return res
}

export const connect: () => Promise<connectRes> = async () => {
  
  checkMetalet()

  const connectRes = await window.metaidwallet!.connect()
  
  return checkMetaletStatus(connectRes, 'connect')
}

export const metaletConnect: () => Promise<connectRes> = async () => {
  checkMetalet()
   
  const connectRes = await window.metaidwallet!.connect()
  
  return checkMetaletStatus(connectRes, 'connect')
}

export const getMvcAddress = async () => {
  checkMetalet()
  
  const addressRes = await window.metaidwallet!.getAddress()
  const address = checkMetaletStatus(addressRes, 'get address')
  return address
}


export const getBtcAddress = async () => {
  checkMetalet()
  
  const addressRes = await window.metaidwallet!.btc.getAddress()
  const address = checkMetaletStatus(addressRes, 'get btc address')
  return address
}

export const getMvcBalance = async () => {
  checkMetalet()
  
  const balance = await window.metaidwallet!.getMvcBalance()
  return balance
}

export const getUseableUtxo = async () => {
  checkMetalet()
  
  const utxos = await window.metaidwallet!.getUtxos().catch(()=>{
    return []
  })

  if(utxos.length){
   return utxos.filter((utxo)=>{
      return utxo.value !== 600 && utxo.value !== 1 && utxo.value > 1000
    })
  }else{
    return []
  }
  
}

export const signMvcMessage = async (Message: { message: string }) => {
  checkMetalet()
  const { message } = Message
 
  const { signature } = await window.metaidwallet!.signMessage({
    message: message,
  })
  const buffer = Buffer.from(signature.signature, 'hex')
  const base64 = buffer.toString('base64')

  return base64
}

export const getMvcPublickey = async () => {
  checkMetalet()

  const MvcPubkey = await window.metaidwallet!.getPublicKey()
  const publickey = checkMetaletStatus(MvcPubkey, 'get mvc publickey')
  return publickey
}



export const getEcdhPublickey = async (pubkey?:string):Promise<{
  externalPubKey: string;
    sharedSecret: string;
    ecdhPubKey: string;
    creatorPubkey: string;
} | any> => {
  checkMetalet()
  
  try {
    
    const ecdh = await window.metaidwallet!.common.ecdh({
    externalPubKey:pubkey ? pubkey : MAN_PUB_KEY //'048add0a6298f10a97785f7dd069eedb83d279a6f03e73deec0549e7d6fcaac4eef2c279cf7608be907a73c89eb44c28db084c27b588f1bd869321a6f104ec642d'//pubkey
  })
  
  return ecdh
  } catch (error) {
    
  }
  
}

export const getAddress = async () => {
  checkMetalet()
  
  const addressRes = await window.metaidwallet!.getAddress()
  const address = checkMetaletStatus(addressRes, 'get address')

  return address
}


interface connectRes {
  address: string
  pubKey: string
}

export const getNetwork = async () => {
  checkMetalet()
  
  return await window.metaidwallet!.getNetwork().then(({ network }) => {
    if (network === 'mainnet') {
      return 'livenet'
    }

    return 'testnet'
  })
}

export const switchNetwork = async (network: 'livenet' | 'testnet') => {
  checkMetalet()
  
  return await window.metaidwallet!.switchNetwork(network as 'mainnet' | 'testnet').then((res) => {
    if (res.status === 'canceled') {
      throw new Error('Switch network canceled')
    }

    if (res.network === 'mainnet') {
      return 'livenet'
    }

    return 'testnet'
  })
}

export const disconnect = async () => {}

export const signMessage = async (message: string): Promise<string> => {
  checkMetalet()
  const messageBase64 = await window.metaidwallet!.btc.signMessage(message)
  return checkMetaletStatus(messageBase64, 'get signature')
}

export const pay=async (toPayTransactions:{
  transactions:Array<{
  txComposer: string,
  message: string,
}>,
hasMetaid:boolean,
feeb?:number
})=>{
   checkMetalet()
   const chainStore=useChainStore()
  if(!toPayTransactions.feeb){
    
    toPayTransactions.feeb=chainStore.mvcFeeRate()
  }
  return await window.metaidwallet!.pay(toPayTransactions)
}


export const smallPay=async (toPayTransactions:{
  transactions:Array<{
  txComposer: string,
  message: string,
}>,
hasMetaid:boolean,
feeb?:number
})=>{
  const chainStore=useChainStore()
   checkMetalet()
   
  if(!toPayTransactions.feeb){
    toPayTransactions.feeb=chainStore.mvcFeeRate()
  }
  if(window.metaidwallet?.smallPay){
    
      const approvedStore=useApprovedStore()
       await approvedStore.getPaymentStatus()
      await approvedStore.getAutoPayment()
      
    if(approvedStore.canUse){
     
      try {

        console.log('toPayTransactions',toPayTransactions,JSON.stringify(toPayTransactions))
         const res= await window.metaidwallet!.smallPay!(toPayTransactions)
         
         
          if(res.status === 'error' && res.message?.includes('The fee is too high')){
             return await window.metaidwallet!.pay(toPayTransactions)
          }else if(res.status === 'error' && res.message == "Not enough balance"){
            throw new Error(res.message.toString())

          }else if(res.status === 'error' && res.message?.includes('Auto payment limit reached for the last 24 hours')){
            
             throw new Error(res.message.toString())

          }else if(res.status === 'error' && !res.message?.includes('The fee is too high')){
             throw new Error(res.message?.toString())
               
          }
          
         return res

      
       
      } catch (error: any) {
          
        if(error.message == 'Not enough balance'){
          
         return toast.error(error.message)
          
        }else if(error.message.includes('Auto payment limit reached for the last 24 hours')){
          
           return toast.error(error.message)
        } else {
           toast.error(error.message)
           return await window.metaidwallet!.pay(toPayTransactions)
        }
      
      }
    }else{
      return await window.metaidwallet!.pay(toPayTransactions)
    }
  }else{
    return await window.metaidwallet!.pay(toPayTransactions)
  }

}


export const autoPaymentStatus=async()=>{
  checkMetalet()
   return await window.metaidwallet!.autoPaymentStatus!()
}

export const autoPayment=async()=>{
  checkMetalet()
  
   return await window.metaidwallet!.autoPayment!()
}


export const needWebRefresh=async(params:{isNeed:boolean})=>{

  try {
  checkMetalet()
  return await window.metaidwallet!.needWebRefresh!(params)
  } catch (error) {
      console.log('执行needWebRefresh出错了')
  }
}
