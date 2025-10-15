import { enc, AES, mode, pad } from 'crypto-js'
const Utf8 = enc.Utf8
const iv = Utf8.parse('0000000000000000')
export function decryptToBlob(
  encryptedData: ArrayBuffer | Uint8Array,
  secretKey: string,
  
): Blob | null {
  try {
    // 将ArrayBuffer或Uint8Array转换为hex字符串
    const uint8Array =
      encryptedData instanceof Uint8Array ? encryptedData : new Uint8Array(encryptedData)
    const hexString = Array.from(uint8Array)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')
    
    const result = ecdhDecryptForPrivateImg(hexString, secretKey)

    if (!result) {
      console.error('解密失败，返回空结果')
      return null
    }

    // 解密后的数据应该是原始图片的hex格式
    // 直接转换为Blob
    return hexStringToBlob(result)
  } catch (error) {
    console.error('转换为 Blob 失败:', error)
    return null
  }
}

export function ecdhDecryptForPrivateImg(message: string, secretKey: string): string {
  try {
    // 将hex字符串转换为WordArray
    const messageWordArray = enc.Hex.parse(message)
    const secretKeyWordArray = enc.Hex.parse(secretKey)

    // 使用CipherParams创建正确的解密参数
    const cipherParams = {
      ciphertext: messageWordArray,
    } as any

    const messageBytes = AES.decrypt(cipherParams, secretKeyWordArray, {
      mode: mode.CBC,
      padding: pad.Pkcs7,
      iv: iv,
    })

    return messageBytes.toString(enc.Hex)
  } catch (error) {
    console.error('ECDH解密失败:', error)
    return ''
  }
}


// 十六进制字符串转 Blob
export function hexStringToBlob(
  hexString: string,
  mimeType: string = 'application/octet-stream'
): Blob {
  const byteArray = new Uint8Array(hexString.length / 2)

  for (let i = 0; i < hexString.length; i += 2) {
    byteArray[i / 2] = parseInt(hexString.substr(i, 2), 16)
  }

  return new Blob([byteArray], { type: mimeType })
}