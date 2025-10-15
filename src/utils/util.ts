

export function sleep(timer = 2000) {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve()
    }, timer)
  })
}

export async function getFileDataFromUrl(fileUrl: string): Promise<ArrayBuffer | undefined> {
  try {
    const response = await fetch(fileUrl)

    const arrayBuffer = await response.arrayBuffer()

    return arrayBuffer
  } catch (error) {}
}

export function hexToBase64(hexString: string) {
  // 移除可能存在的空格和前缀
  const cleanHex = hexString.replace(/\s/g, '').replace(/^0x/, '')

  // 验证是否为有效的十六进制字符串
  if (!/^[0-9A-Fa-f]*$/.test(cleanHex)) {
    throw new Error('Invalid hexadecimal string')
  }

  // 确保十六进制字符串长度为偶数
  const paddedHex = cleanHex.length % 2 === 0 ? cleanHex : '0' + cleanHex

  // 将十六进制字符串转换为字节数组
  const byteArray = []
  for (let i = 0; i < paddedHex.length; i += 2) {
    byteArray.push(parseInt(paddedHex.substr(i, 2), 16))
  }

  // 将字节数组转换为二进制字符串
  const binaryString = byteArray.map(byte => String.fromCharCode(byte)).join('')

  // 使用btoa函数将二进制字符串转换为Base64
  return btoa(binaryString)
}

export function hexToUint8Array(hexString: string) {
  // 移除可能存在的空格或前缀（如0x）
  hexString = hexString.replace(/^0x|\s/g, '')

  // 确保长度为偶数
  if (hexString.length % 2 !== 0) {
    throw new Error('Hex string must have an even length')
  }

  const length = hexString.length / 2
  const array = new Uint8Array(length)

  for (let i = 0; i < length; i++) {
    const byteHex = hexString.substr(i * 2, 2)
    array[i] = parseInt(byteHex, 16)
  }

  return array
}