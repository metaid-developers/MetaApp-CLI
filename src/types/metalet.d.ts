// Metalet 钱包 TypeScript 类型定义
// 参考：https://github.com/metalet-labs/metalet-extension-next

export interface MetaletAccount {
  address: string
  mvcAddress?: string
  btcAddress?: string
}

export interface BalanceInfo {
  address: string
  confirmed: number
  unconfirmed: number
  total: number
}

export interface NetworkType {
  network: 'mainnet' | 'testnet'
}

export interface SignedTransaction {
  txid: string
  txHex: string
}

export interface TokenInfo {
  codehash: string
  genesis: string
  name: string
  symbol: string
  decimal: number
  utxoCount: number
  confirmed: number
  confirmedString: string
  unconfirmed: number
  unconfirmedString: string
}

// UTXO 接口
export interface UTXO {
  txId: string
  outputIndex: number
  satoshis: number
  value: number
  address: string
  height: number
  confirmations: number
}

// 签名结果接口
export interface SignatureResult {
  signature: string
  publicKey?: string
}

// 网络切换结果
export interface SwitchNetworkResult {
  status: string
  network: 'mainnet' | 'testnet'
  address: string
}

// ECDH 结果
export interface ECDHResult {
  externalPubKey: string
  sharedSecret: string
  ecdhPubKey: string
  creatorPubkey: string
}

// 支付结果
export interface PayResult {
  status?: string
  message?: string
  txId?: string
  txHex?: string
  payedTransactions?: string[] // 已支付的交易序列化数组
}

// 自动支付状态
export interface AutoPaymentStatus {
  isEnabled: boolean
  isApproved: boolean
  autoPaymentAmount: number
}

export interface MetaletWallet {
  // 账户管理
  connect: () => Promise<MetaletAccount>
  disconnect: () => Promise<{ status: string }>
  getAddress: () => Promise<string>
  
  // 余额
  getBalance: () => Promise<BalanceInfo>
  getMvcBalance: () => Promise<BalanceInfo>
  
  // 网络
  getNetwork: () => Promise<{ network: 'mainnet' | 'testnet' }>
  switchNetwork: (network: 'mainnet' | 'testnet') => Promise<SwitchNetworkResult>
  
  // 公钥
  getPublicKey: () => Promise<string>
  
  // UTXO 管理
  getUtxos: () => Promise<UTXO[]>
  
  // 签名
  signMessage: (params: { message: string } | string, encoding?: 'utf-8' | 'hex') => Promise<{ signature: SignatureResult }>
  signTransactions: (params: {
    transactions: Array<{
      txHex: string
      address: string
      inputIndex: number
      scriptHex: string
      satoshis: number
      sigtype?: number
      path?: string
      hasMetaId?: boolean
      dataDependsOn?: number
    }>
  }) => Promise<{ signedTransactions: SignedTransaction[] }>
  
  // 支付
  pay: (params: {
    transactions?: Array<{
      txComposer: string
      message?: string
    }>
    hasMetaid?: boolean
    feeb?: number
    feeRate?: number // BTC 使用
    useChunk?: boolean // 使用分片存储
    chunkKey?: string // 分片存储 key
  }) => Promise<PayResult>
  
  smallPay?: (params: {
    transactions: Array<{
      txComposer: string
      message?: string
    }>
    hasMetaid: boolean
    feeb?: number
  }) => Promise<PayResult>
  
  // 自动支付
  autoPaymentStatus?: () => Promise<AutoPaymentStatus>
  autoPayment?: () => Promise<{ message: string }>
  
  // Web 刷新控制
  needWebRefresh?: (params: { isNeed: boolean }) => Promise<void>
  
  // BTC 相关
  btc: {
    getAddress: () => Promise<{ address: string }>
    signMessage: (message: string) => Promise<string>
    getPublicKey?: () => Promise<string>
  }
  
  // 通用功能
  common: {
    ecdh: (params: { externalPubKey: string }) => Promise<ECDHResult>
  }
  
  // Token
  token: {
    getBalance: (genesis?: string, codehash?: string) => Promise<TokenInfo[]>
  }
  
  // 大数据分片存储
  storageChunk?: (params: {
    key: string
    index: number
    total: number
    chunk: string
  }) => Promise<void>
  
  // 解锁 P2PKH 输入
  unlockP2PKHInput?: (params: {
    transaction: Array<{
      txComposer: string
      toSignInputs: number[]
    }>
  }) => Promise<string[]>
  
  // 事件监听
  on: (event: string, callback: (data: any) => void) => void
  removeListener: (event: string, callback?: (data: any) => void) => void
  
  // 已弃用但仍可用的 API
  requestAccount: () => Promise<{ address: string }>
  getAccount: () => Promise<{ address: string }>
  exitAccount: () => Promise<{ status: string }>
}

declare global {
  interface Window {
    metaidwallet?: MetaletWallet
  }
}



export {}

