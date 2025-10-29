import { HttpRequest } from '@/utils/http'
import { useConfig } from '@/hooks/use-config';

const {
  manBaseUrl
} = useConfig();



// 创建 MAN API 实例，配置自定义响应处理
const manApiInstance = new HttpRequest(
  `${manBaseUrl.value}/api` || 'https://man-test.metaid.io/api',
  {
    // 自定义响应处理器（适配 MAN API 的响应格式）
    responseHandler: (response) => {
      return new Promise((resolve, reject) => {
        const { data } = response
        
        // MAN API 响应格式：{ code: 1, data: {...}, message: '...' }
        if (data && typeof data.code === 'number') {
          if (data.code === 1) {
            // 成功：返回 data 字段
            resolve(data.data)
          } else {
            // 失败：返回错误信息
            reject({
              code: data.code,
              message: data.message || '请求失败',
            })
          }
        } else {
          // 兼容其他格式，直接返回 data
          resolve(data.data || data)
        }
      })
    },
  }
)

// 导出 API 实例（保持原有的使用方式）
const manApi = {
  get: manApiInstance.get.bind(manApiInstance),
  post: manApiInstance.post.bind(manApiInstance),
  put: manApiInstance.put.bind(manApiInstance),
  delete: manApiInstance.delete.bind(manApiInstance),
}

export interface ChatUserInfo{

address:string
avatar:string
avatarImage:string
chatPublicKey:string
chatPublicKeyId:string
metaid:string
name:string
}

export interface UserInfo {
  address: string
  avatar: string
  avatarId: string
  background: string
  bio: string
  bioId: string
  blocked: boolean
  chainName: string
  fdv: number
  followCount: number
  isInit: boolean
  metaid: string
  name: string
  nameId: string
  nftAvatar: string
  nftAvatarId: string
  number: number
  pdv: number
  pinId: string
  soulbondToken: string
  unconfirmed: string
  chatpubkey?:string
}

export const getUserInfoByAddress = async (address: string): Promise<UserInfo> => {
  

  return manApi.get(`/info/address/${address}`).then(res => {
   
    
    return res
  })
}

export const getUserInfoByMetaId = async (metaid: string): Promise<UserInfo> => {
  const res = await manApi.get(`/info/metaid/${metaid}`)

  if (res && !res?.name) {
    // res.name = res.metaid.slice(0, 6)
  }

  return res
}
