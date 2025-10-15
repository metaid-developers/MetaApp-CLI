/**
 * HTTP 请求工具 - 基于 axios 封装
 * 支持请求拦截、响应拦截、错误处理等功能
 */

import axios, {type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'

// 请求配置接口
export interface HttpRequestConfig extends AxiosRequestConfig {
  // 自定义响应处理函数
  responseHandler?: (response: AxiosResponse) => Promise<any>
  // 自定义错误处理函数
  errorHandler?: (error: AxiosError) => Promise<any>
  // 是否显示加载状态
  showLoading?: boolean
  // 是否显示错误提示
  showError?: boolean
  // 请求重试次数
  retry?: number
  // 请求重试延迟（毫秒）
  retryDelay?: number
}

// 响应数据接口（通用）
export interface HttpResponse<T = any> {
  code: number
  data: T
  message?: string
}

/**
 * HTTP 请求类
 */
export class HttpRequest {
  private instance: AxiosInstance
  private config: HttpRequestConfig

  /**
   * 构造函数
   * @param baseURL API 基础 URL
   * @param config 请求配置
   */
  constructor(baseURL: string, config?: HttpRequestConfig) {
    this.config = config || {}

    // 创建 axios 实例
    this.instance = axios.create({
      baseURL,
      timeout: 30000, // 默认 30 秒超时
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    })

    // 设置拦截器
    this.setupInterceptors()
  }

  /**
   * 设置拦截器
   */
  private setupInterceptors() {
    // ========== 请求拦截器 ==========
    this.instance.interceptors.request.use(
      (config) => {
        // 1. 添加 token（如果存在）
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // 2. 日志记录
        console.log(`📤 [${config.method?.toUpperCase()}] ${config.url}`, {
          params: config.params,
          data: config.data,
        })

        return config
      },
      (error) => {
        console.error('❌ 请求拦截器错误:', error)
        return Promise.reject(error)
      }
    )

    // ========== 响应拦截器 ==========
    this.instance.interceptors.response.use(
      (response) => {
        // 日志记录
        console.log(`📥 [${response.config.method?.toUpperCase()}] ${response.config.url}`, {
          status: response.status,
          data: response.data,
        })

        // 使用自定义响应处理函数（如果提供）
        if (this.config.responseHandler) {
          return this.config.responseHandler(response)
        }

        // 默认响应处理
        return this.handleResponse(response)
      },
      (error: AxiosError) => {
        console.error('❌ 响应错误:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        })

        // 使用自定义错误处理函数（如果提供）
        if (this.config.errorHandler) {
          return this.config.errorHandler(error)
        }

        // 默认错误处理
        return this.handleError(error)
      }
    )
  }

  /**
   * 默认响应处理
   */
  private handleResponse(response: AxiosResponse): Promise<any> {
    const { data } = response

    // 如果响应数据包含 code 字段
    if (data && typeof data.code === 'number') {
      // 成功（根据业务约定，code === 1 表示成功）
      if (data.code === 1 || data.code === 0 || data.code === 200) {
        return Promise.resolve(data.data !== undefined ? data.data : data)
      }
      
      // 失败
      return Promise.reject({
        code: data.code,
        message: data.message || '请求失败',
        data: data.data,
      })
    }

    // 直接返回数据
    return Promise.resolve(data)
  }

  /**
   * 默认错误处理
   */
  private handleError(error: AxiosError): Promise<any> {
    let message = '请求失败'

    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          message = '请求参数错误'
          break
        case 401:
          message = '未授权，请重新登录'
          // 可以在这里处理 token 过期，跳转到登录页
          this.handleUnauthorized()
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        case 502:
          message = '网关错误'
          break
        case 503:
          message = '服务不可用'
          break
        case 504:
          message = '网关超时'
          break
        default:
          message = `请求失败 (${status})`
      }

      // 如果服务器返回了错误信息，使用服务器的信息
      if (data && (data as any).message) {
        message = (data as any).message
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      message = '网络错误，请检查网络连接'
    } else {
      // 其他错误
      message = error.message || '请求配置错误'
    }

    return Promise.reject({
      message,
      error,
      response: error.response,
    })
  }

  /**
   * 处理未授权（401）
   */
  private handleUnauthorized() {
    // 清除 token
    this.removeToken()
    
    // 可以在这里添加跳转到登录页的逻辑
    // 例如：window.location.href = '/login'
    console.warn('⚠️ 未授权，请重新登录')
  }

  /**
   * 获取 token
   */
  private getToken(): string | null {
    // 从 localStorage 获取 token
    return localStorage.getItem('metaid_access_token')
  }

  /**
   * 移除 token
   */
  private removeToken() {
    localStorage.removeItem('metaid_access_token')
  }

  /**
   * GET 请求
   */
  async get<T = any>(url: string, params?: any, config?: HttpRequestConfig): Promise<T> {
    return this.instance.get(url, { params, ...config })
  }

  /**
   * POST 请求
   */
  async post<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<T> {
    return this.instance.post(url, data, config)
  }

  /**
   * PUT 请求
   */
  async put<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<T> {
    return this.instance.put(url, data, config)
  }

  /**
   * DELETE 请求
   */
  async delete<T = any>(url: string, params?: any, config?: HttpRequestConfig): Promise<T> {
    return this.instance.delete(url, { params, ...config })
  }

  /**
   * PATCH 请求
   */
  async patch<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<T> {
    return this.instance.patch(url, data, config)
  }

  /**
   * 上传文件
   */
  async upload<T = any>(url: string, file: File | Blob, config?: HttpRequestConfig): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    return this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    })
  }

  /**
   * 下载文件
   */
  async download(url: string, filename?: string, config?: HttpRequestConfig): Promise<void> {
    const response = await this.instance.get(url, {
      responseType: 'blob',
      ...config,
    })

    // 创建下载链接
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || this.getFilenameFromResponse(response) || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }

  /**
   * 从响应头中获取文件名
   */
  private getFilenameFromResponse(response: AxiosResponse): string | null {
    const contentDisposition = response.headers['content-disposition']
    if (contentDisposition) {
      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (match && match[1]) {
        return match[1].replace(/['"]/g, '')
      }
    }
    return null
  }

  /**
   * 获取原始 axios 实例（用于更高级的定制）
   */
  getAxiosInstance(): AxiosInstance {
    return this.instance
  }
}

/**
 * 创建 HTTP 请求实例的工厂函数
 */
export function createHttpRequest(baseURL: string, config?: HttpRequestConfig): HttpRequest {
  return new HttpRequest(baseURL, config)
}

/**
 * 默认导出
 */
export default HttpRequest

