import imageCompression from 'browser-image-compression'
import CryptoJs from 'crypto-js'
import encHex from 'crypto-js/enc-hex'

export const IsEncrypt = {
  Yes: 1,
  No: 0,
} as const
type IsEncrypt = typeof IsEncrypt[keyof typeof IsEncrypt]

export interface AttachmentItem {
  fileName: string
  fileType: string
  data: string
  encrypt: IsEncrypt
  sha256: string
  size: number
  url: string
}

export async function compressImage(image: File) {
  const options = {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 2048,
    useWebWorker: true,
  }
  const compressedFile = await imageCompression(image, options)
  return compressedFile
}

export async function compressVideo(video: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const videoElement = document.createElement('video')
    
    videoElement.onloadedmetadata = () => {
      // 设置压缩参数
      const maxWidth = 1280
      const maxHeight = 720
      const quality = 0.7
      
      // 计算新的尺寸
      let { videoWidth, videoHeight } = videoElement
      if (videoWidth > maxWidth || videoHeight > maxHeight) {
        const ratio = Math.min(maxWidth / videoWidth, maxHeight / videoHeight)
        videoWidth *= ratio
        videoHeight *= ratio
      }
      
      canvas.width = videoWidth
      canvas.height = videoHeight
      
      // 开始压缩
      videoElement.currentTime = 0
      videoElement.onseeked = () => {
        ctx?.drawImage(videoElement, 0, 0, videoWidth, videoHeight)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], video.name, {
              type: 'video/webm',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('视频压缩失败'))
          }
        }, 'video/webm', quality)
      }
    }
    
    videoElement.onerror = () => {
      reject(new Error('视频加载失败'))
    }
    
    videoElement.src = URL.createObjectURL(video)
    videoElement.load()
  })
}

export function FileToAttachmentItem(file: File, encrypt: IsEncrypt = IsEncrypt.No) {
  return new Promise<AttachmentItem>(async resolve => {
    function readResult(blob: Blob) {
      return new Promise<void>(resolve => {
        const reader = new FileReader()
        reader.onload = () => {
          // @ts-ignore
          const wordArray = CryptoJs.lib.WordArray.create(reader.result)
          // @ts-ignore
          const buffer = Buffer.from(reader.result)
          // console.log("buffer", buffer, reader.result);
          hex += buffer.toString('hex') // 更新hex
          // 增量更新计算结果
          sha256Algo.update(wordArray) // 更新hash
          resolve()
        }
        reader.readAsArrayBuffer(blob)
      })
    }
    // 分块读取，防止内存溢出，这里设置为20MB,可以根据实际情况进行配置
    const chunkSize = 20 * 1024 * 1024

    let hex = '' // 二进制
    const sha256Algo = CryptoJs.algo.SHA256.create()

    for (let index = 0; index < file.size; index += chunkSize) {
      await readResult(file.slice(index, index + chunkSize))
    }
    resolve({
      data: hex,
      fileName: file.name,
      fileType: file.type,
      sha256: encHex.stringify(sha256Algo.finalize()),
      url: URL.createObjectURL(file),
      encrypt,
      size: file.size,
    })
  })
}

export const image2Attach = async (images: FileList) => {
  const attachments: AttachmentItem[] = []

  for (let i = 0; i < images.length; i++) {
    // 压缩图片
    const current = images[i]
    if (!current) continue

    const compressed = await compressImage(current)
    const result = await FileToAttachmentItem(current.type === 'image/gif' ? current : compressed)
    if (result) attachments.push(result)
  }
  return attachments
}