import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { ref, onMounted, onUnmounted } from 'vue'

export interface FeeRateApi {
  fastestFee: number
  halfHourFee: number
  hourFee: number
  economyFee: number
  minimumFee: number
}

export interface ChainFeeData {
  fastestFee: number
  halfHourFee: number
  hourFee: number
  economyFee: number
  minimumFee: number
  customizeFee: number
  selectedFeeType:
    | 'fastestFee'
    | 'halfHourFee'
    | 'hourFee'
    | 'economyFee'
    | 'minimumFee'
    | 'customizeFee'
  lastUpdated: number
}

export interface ChainState {
  btc: ChainFeeData
  mvc: ChainFeeData
  currentChain: 'btc' | 'mvc'
}

const BTC_FEE_RATE_URL = 'https://api.mvcscan.com/browser/v1/fees/recommended?chain=btc'
const MVC_FEE_RATE_URL = 'https://api.mvcscan.com/browser/v1/fees/recommended?net=livenet'
const UPDATE_INTERVAL = 5 * 60 * 1000 // 5 minutes

export const useChainStore = defineStore('chain', () => {
  const state = useLocalStorage('chain-fee-rates', {
    btc: {
      fastestFee: 1,
      halfHourFee: 1,
      hourFee: 1,
      economyFee: 1,
      minimumFee: 1,
      customizeFee: 1,
      selectedFeeType: 'economyFee',
      lastUpdated: 0,
    },
    mvc: {
      fastestFee: 1,
      halfHourFee: 1,
      hourFee: 1,
      economyFee: 1,
      minimumFee: 1,
      customizeFee: 1,
      selectedFeeType: 'fastestFee',
      lastUpdated: 0,
    },
    currentChain: 'mvc',
  } as ChainState)

  const updateInterval = ref<NodeJS.Timeout | null>(null)

  const fetchFeeRates = async (url: string): Promise<FeeRateApi> => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: FeeRateApi = await response.json()
      return data
    } catch (error) {
      console.error('Failed to fetch fee rates:', error)
      throw error
    }
  }

  const updateBtcFeeRate = async (): Promise<void> => {
    try {
      const feeRates = await fetchFeeRates(BTC_FEE_RATE_URL)
      state.value.btc.fastestFee = feeRates.fastestFee
      state.value.btc.halfHourFee = feeRates.halfHourFee
      state.value.btc.hourFee = feeRates.hourFee
      state.value.btc.economyFee = feeRates.economyFee
      state.value.btc.minimumFee = feeRates.minimumFee
      state.value.btc.lastUpdated = Date.now()
    } catch (error) {
      console.error('Failed to update BTC fee rates:', error)
    }
  }

  const updateMvcFeeRate = async (): Promise<void> => {
    try {
      const feeRates = await fetchFeeRates(MVC_FEE_RATE_URL)
      state.value.mvc.fastestFee = feeRates.fastestFee
      state.value.mvc.halfHourFee = feeRates.halfHourFee
      state.value.mvc.hourFee = feeRates.hourFee
      state.value.mvc.economyFee = 1
      state.value.mvc.minimumFee = feeRates.minimumFee
      state.value.mvc.lastUpdated = Date.now()
    } catch (error) {
      console.error('Failed to update MVC fee rates:', error)
    }
  }

  const updateAllFeeRates = async (): Promise<void> => {
    await Promise.allSettled([updateBtcFeeRate(), updateMvcFeeRate()])
  }

  const setBtcCustomizeFee = (feeRate: number): void => {
    state.value.btc.customizeFee = feeRate
    state.value.btc.lastUpdated = Date.now()
  }

  const setMvcCustomizeFee = (feeRate: number): void => {
    state.value.mvc.customizeFee = feeRate
    state.value.mvc.lastUpdated = Date.now()
  }

  const setBtcFeeType = (feeType: ChainFeeData['selectedFeeType']): void => {
    state.value.btc.selectedFeeType = feeType
  }

  const setMvcFeeType = (feeType: ChainFeeData['selectedFeeType']): void => {
    state.value.mvc.selectedFeeType = feeType
  }

  const startAutoUpdate = (): void => {
    if (updateInterval.value) {
      clearInterval(updateInterval.value)
    }

    updateInterval.value = setInterval(() => {
      updateAllFeeRates()
    }, UPDATE_INTERVAL)
  }

  const stopAutoUpdate = (): void => {
    if (updateInterval.value) {
      clearInterval(updateInterval.value)
      updateInterval.value = null
    }
  }

  // Initialize on store creation
  onMounted(() => {
    // Update fee rates immediately on store creation
    updateAllFeeRates()
    // Start auto-update
    startAutoUpdate()
  })

  onUnmounted(() => {
    stopAutoUpdate()
  })

  const getCurrentBtcFeeRate = (): number => {
    return state.value.btc[state.value.btc.selectedFeeType]
  }

  const getCurrentMvcFeeRate = (): number => {
    return state.value.mvc[state.value.mvc.selectedFeeType]
  }

  const setCurrentChain = (chain: 'btc' | 'mvc'): void => {
    state.value.currentChain = chain
  }

  return {
    state,
    btcFeeRate: getCurrentBtcFeeRate,
    mvcFeeRate: getCurrentMvcFeeRate,
    lastUpdated: () => ({
      btc: state.value.btc.lastUpdated,
      mvc: state.value.mvc.lastUpdated,
    }),
    updateBtcFeeRate,
    updateMvcFeeRate,
    updateAllFeeRates,
    setBtcCustomizeFee,
    setMvcCustomizeFee,
    setBtcFeeType,
    setMvcFeeType,
    startAutoUpdate,
    stopAutoUpdate,
    setCurrentChain,
  }
})
