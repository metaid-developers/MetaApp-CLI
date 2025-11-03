import { HttpRequest } from '@/utils/http'
import {type UserInfo} from '@/api/man'

const MAN_V2_BASE_URL = import.meta.env.VITE_MAN_V2_API || 'https://manapi.metaid.io'


const manV2ApiInstance = new HttpRequest(`${MAN_V2_BASE_URL}`, {
 	
  responseHandler: (response) => {
    return new Promise((resolve, reject) => {
      const { data } = response

     
      if (data && typeof data.code === 'number') {
        if (data.code === 1 || data.code === 200) {
        
          resolve(data.data)
        } else {
         
          reject({
            code: data.code,
            data: data.data,
            message: data.message,
          })
        }
      } else {
      
        resolve(data.data || data)
      }
    })
  },
})


const manV2Api = {
  get: manV2ApiInstance.get.bind(manV2ApiInstance),
  post: manV2ApiInstance.post.bind(manV2ApiInstance),
  put: manV2ApiInstance.put.bind(manV2ApiInstance),
  delete: manV2ApiInstance.delete.bind(manV2ApiInstance),
}




export interface MetaIdListResponse {
  list: string[]
  count: number
}


export interface PinInfo {
    content?: string
    contentSummary?: string
    number: number
    operation: string
    id: string
    type: string
    path: string
    metaid: string
    pop?: number
    chainName: string
    initialOwner?: string
    creator:string
    address: string
    createMetaId:string
    output:string
    outputValue:number
    timestamp:number
    encryption:string
    version:string
    createAddress?: string
    contentType:string
    userInfo?:UserInfo,
    popLv?: number
    preview?: string
}


export interface PinDetail extends PinInfo {
 
}


export interface PinListResponse {
  pins: PinInfo[]
  count: {
    metaId: number
    pin: number
  }
  active: string
  lastId?: string
}


export interface MempoolListResponse {
  pins: PinInfo[]
  count: {
    metaId: number
    pin: number
  }
  active: string
}


export interface AddressPinListResponse {
  list: PinInfo[]
  total: number
}


export interface MetaIdInfo {
  metaId: string
  address: string
  status: number
  [key: string]: any
}


export interface MetaIdInfoResponse {
  metaIdInfo: MetaIdInfo
  unconfirmed: string
  blocked: boolean
}

export interface NotificationInfo {
  notifcationId: number
  fromPinId: string
  type: string
  content: string
}


export interface BlockFilePartCountResponse {
  partCount: number
  btcMin: number
  btcMax: number
  mvcMin: number
  mvcMax: number
}


export interface BlockIdListResponse {
  data: string[]
}



// ==================== API 参数类型定义 ====================

export interface GetMetaIdListParams {
  page?: number
  size?: number
}

export interface GetPinListParams {
  page?: number
  size?: number
  lastId?: string
}

export interface GetMempoolListParams {
  page?: number
  size?: number
}

export interface GetPinDetailParams {
  numberOrId: string
}

export interface GetAddressPinListParams {
  address: string
  cursor?: number
  size?: number
  path: string
}

export interface GetMetaIdPinListParams {
  metaid: string
  cursor?: number
  size?: number
  path: string
}

export interface GetPinListByPathParams {
  cursor?: number
  size?: number
  path: string
}

export interface GetInfoByAddressParams {
  address: string
}

export interface GetInfoByMetaIdParams {
  metaId: string
}

export interface GetNotificationListParams {
  address: string
  lastId?: number
}

export interface DownloadBlockFileParams {
  height: number
  chain: string
  part?: number
}

export interface GetBlockFilePartCountParams {
  height: number
  chain: string
}

export interface CreateBlockFileParams {
  token: string
  chain: string
  from: number
  to: number
}

export interface GetBlockIdListParams {
  token: string
  chain: string
  height: number
}

export interface CreateBlockIdListParams {
  token: string
  chain: string
  from: number
  to: number
}

// ==================== API 方法 ====================

/**
 * 1. 获取 MetaId 列表
 */
export const getMetaIdList = async (
  params: GetMetaIdListParams = {}
): Promise<MetaIdListResponse> => {
  const { page = 0, size = 20 } = params
  const query = new URLSearchParams({
    page: page.toString(),
    size: size.toString()
  }).toString()
  return manV2Api.get(`/metaid/list?${query}`)
}

/**
 * 2. 获取 Pin 列表
 */
export const getPinList = async (
  params: GetPinListParams = {}
): Promise<PinListResponse> => {
  const { page = 0, size = 20, lastId } = params
  const queryParams: any = {
    page: page.toString(),
    size: size.toString()
  }
  if (lastId) queryParams.lastId = lastId
  const query = new URLSearchParams(queryParams).toString()
  return manV2Api.get(`/pin/list?${query}`)
}

/**
 * 3. 获取 Mempool Pin 列表
 */
export const getMempoolList = async (
  params: GetMempoolListParams = {}
): Promise<MempoolListResponse> => {
  const { page = 0, size = 20 } = params
  const query = new URLSearchParams({
    page: page.toString(),
    size: size.toString()
  }).toString()
  return manV2Api.get(`/mempool/list?${query}`)
}

/**
 * 4. 获取 Pin 详情
 */
export const getPinDetail = async (
  params: GetPinDetailParams
): Promise<PinDetail> => {
  const { numberOrId } = params
  return manV2Api.get(`/pin/${numberOrId}`)
}

/**
 * 5. 获取指定地址和 path 下 Pin（倒序分页）
 */
export const getAddressPinList = async (
  params: GetAddressPinListParams
): Promise<AddressPinListResponse> => {
  const { address, cursor = 0, size = 20, path } = params
  const query = new URLSearchParams({
    cursor: cursor.toString(),
    size: size.toString(),
    path
  }).toString()
  return manV2Api.get(`/address/pin/list/${address}?${query}`)
}

/**
 * 6. 获取指定 metaid 和 path 下 Pin（倒序分页）
 */
export const getMetaIdPinList = async (
  params: GetMetaIdPinListParams
): Promise<AddressPinListResponse> => {
  const { metaid, cursor = 0, size = 20, path } = params
  const query = new URLSearchParams({
    cursor: cursor.toString(),
    size: size.toString(),
    path
  }).toString()
  return manV2Api.get(`/metaid/pin/list/${metaid}?${query}`)
}

/**
 * 7. 获取指定 path 下所有 Pin（分页）
 */
export const getPinListByPath = async (
  params: GetPinListByPathParams
): Promise<AddressPinListResponse> => {
  const { cursor = 0, size = 20, path } = params
   const query = new URLSearchParams({
    cursor: cursor.toString(),
    size: size.toString(),
    path
   }).toString()
  return manV2Api.get('/pin/path/list' + `?${query}`)
}

/**
 * 8. 获取地址 MetaId 信息
 */
export const getInfoByAddress = async (
  params: GetInfoByAddressParams
): Promise<UserInfo> => {
  const { address } = params
  return manV2Api.get(`/info/address/${address}`)
}

/**
 * 9. 获取 MetaId 信息
 */
export const getInfoByMetaId = async (
  params: GetInfoByMetaIdParams
): Promise<UserInfo> => {
  const { metaId } = params
  return manV2Api.get(`/info/metaid/${metaId}`)
}

/**
 * 10. 获取通知列表
 */
export const getNotificationList = async (
  params: GetNotificationListParams
): Promise<NotificationInfo[]> => {
  const { address, lastId } = params
  const queryParams: any = { address }
  if (lastId) queryParams.lastId = lastId.toString()
  const query = new URLSearchParams(queryParams).toString()
  return manV2Api.get(`/notifcation/list?${query}`)
}

/**
 * 11. 区块分片文件下载
 */
export const downloadBlockFile = async (
  params: DownloadBlockFileParams
): Promise<Blob> => {
  const { height, chain, part } = params
  const queryParams: any = {
    height: height.toString(),
    chain
  }
  if (part !== undefined) queryParams.part = part.toString()
  const query = new URLSearchParams(queryParams).toString()
  return manV2Api.get(`/block/file?${query}`, undefined, { responseType: 'blob' })
}

/**
 * 12. 查询区块分片文件数量
 */
export const getBlockFilePartCount = async (
  params: GetBlockFilePartCountParams
): Promise<BlockFilePartCountResponse> => {
  const { height, chain } = params
  const query = new URLSearchParams({
    height: height.toString(),
    chain
  }).toString()
  return manV2Api.get(`/block/file/partCount?${query}`)
}

/**
 * 13. 批量创建区块分片文件
 */
export const createBlockFile = async (
  params: CreateBlockFileParams
): Promise<string> => {
  const { token, chain, from, to } = params
  const query = new URLSearchParams({
    token,
    chain,
    from: from.toString(),
    to: to.toString()
  }).toString()
  return manV2Api.get(`/block/file/create?${query}`)
}

/**
 * 14. 获取区块 id 列表
 */
export const getBlockIdList = async (
  params: GetBlockIdListParams
): Promise<BlockIdListResponse> => {
  const { token, chain, height } = params
  const query = new URLSearchParams({
    token,
    chain,
    height: height.toString()
  }).toString()
  return manV2Api.get(`/block/id/list?${query}`)
}

/**
 * 15. 批量设置区块 PinId 列表
 */
export const createBlockIdList = async (
  params: CreateBlockIdListParams
): Promise<string> => {
  const { token, chain, from, to } = params
  const query = new URLSearchParams({
    token,
    chain,
    from: from.toString(),
    to: to.toString()
  }).toString()
  return manV2Api.get(`/block/id/create?${query}`)
}
