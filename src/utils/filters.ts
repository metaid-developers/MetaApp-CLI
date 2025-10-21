
import { useConfig } from '@/hooks/use-config';
export function metafile(metafile: string, width = 235, type: 'metafile' | 'metaId' = 'metafile') {
 
  if (typeof metafile !== 'string') return ''
  if (metafile.indexOf('http://') !== -1 || metafile.indexOf('https://') !== -1) return metafile
  metafile = metafile.replace('metafile://', '')
  metafile = metafile.replace('metacontract://', 'metacontract/')
  if (metafile === '') return ''
  let path = ''
  if (metafile.indexOf('ipfs://') !== -1) {
    // ETH 图片地址
    path = '/metafile/eth/ipfs/'
  } else if (type === 'metaId') {
    // metaId
    path = '/metafile/avatar/'
  } else if (metafile.indexOf('sensible://') !== -1) {
    metafile = metafile.replace('sensible://', 'sensible/')
    path = '/metafile/'
  } else if (metafile.indexOf('eth://') !== -1) {
    metafile = metafile.replace('eth://', 'evm/eth/')
    path = '/metafile/'
  } else if (metafile.indexOf('goerli://') !== -1) {
    metafile = metafile.replace('goerli://', 'evm/goerli/')
    path = '/metafile/'
  } else if (metafile.indexOf('polygon://') !== -1) {
    metafile = metafile.replace('polygon://', 'evm/polygon/')
    path = '/metafile/'
  } else if (metafile.indexOf('mumbai://') !== -1) {
    metafile = metafile.replace('mumbai://', 'evm/mumbai/')
    path = '/metafile/'
  } else {
    if(metafile.indexOf('/content/') < 0){
      path='/content/'
    }
  }
       const {
        manBaseUrl
        } = useConfig();
  const fileUrl = `${manBaseUrl.value}${path}${metafile}`
   
  // 文件后缀
  const fileSuffix = metafile.split('.')[metafile.split('.').length - 1]
  // 非图片格式返回源文件
  const imageType = ['jpg', 'jpeg', 'png', 'gif']
  if (fileSuffix !== '' && !imageType.includes(fileSuffix)) {
    return fileUrl
  }
  // 原图 格式 直接返回
  if (width === -1) {
    return fileUrl
  }

  let query = 'x-oss-process=image/auto-orient,1/quality,q_80'
  if (width) {
    query += `/resize,m_lfit,w_${width}`
  }
  
  return `${fileUrl}?${query}`
}