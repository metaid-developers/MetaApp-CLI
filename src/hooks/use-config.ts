// hooks/use-config.ts
import { ref, computed } from 'vue';
import { configManager } from '@/utils/config';
import type { AppConfig } from '@/types/app-config';

/**
 * 配置管理组合式函数
 */
export function useConfig() {
  // 响应式配置状态
  const config = ref<AppConfig>(configManager.config);
  
  // 更新配置的响应式状态
  const updateConfig = (updates: Partial<AppConfig>) => {
    configManager.updateConfig(updates);
    config.value = { ...configManager.config };
  };

  // 获取配置值的计算属性
  const getConfigValue = <T>(path: string) => {
    return computed(() => configManager.getConfigValue<T>(path));
  };

  // 功能开关的计算属性
  const isFeatureEnabled = (feature: keyof AppConfig['features']) => {
    return computed(() => configManager.isFeatureEnabled(feature));
  };

  // 常用配置的计算属性

  const manBaseUrl=computed(()=>config.value.api.MAN_BASE_URL)
  const isDebugMode = computed(() => config.value.app.debug);
  const currentTheme = computed(() => config.value.ui.theme);
  const currentLanguage = computed(() => config.value.ui.language);
  const maxFileSize = computed(() => configManager.getMaxFileSizeBytes());

  return {
    config,
    updateConfig,
    getConfigValue,
    isFeatureEnabled,

    manBaseUrl,
    isDebugMode,
    currentTheme,
    currentLanguage,
    maxFileSize
  };
}

/**
 * API 配置组合式函数
 */
export function useApiConfig() {
  const { config } = useConfig();
  
  return {
    baseUrl: computed(() => config.value.api.baseUrl),
    timeout: computed(() => config.value.api.timeout),
    retryAttempts: computed(() => config.value.api.retryAttempts)
  };
}

/**
 * 钱包配置组合式函数
 */
export function useWalletConfig() {
  const { config } = useConfig();
  
  return {
    network: computed(() => config.value.wallet.network),
    autoConnect: computed(() => config.value.wallet.autoConnect),
    showBalance: computed(() => config.value.wallet.showBalance)
  };
}

/**
 * UI 配置组合式函数
 */
export function useUIConfig() {
  const { config } = useConfig();
  
  return {
    theme: computed(() => config.value.ui.theme),
    language: computed(() => config.value.ui.language),
    showWelcomeMessage: computed(() => config.value.ui.showWelcomeMessage),
    maxFileSize: computed(() => configManager.getMaxFileSizeBytes())
  };
}
