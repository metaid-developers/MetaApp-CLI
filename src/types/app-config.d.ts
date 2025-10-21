// types/app-config.d.ts
export interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'production' | 'staging';
    debug: boolean;
  };
  api: {
   
    MAN_BASE_URL:string;
    timeout: number;
    retryAttempts: number;
  };
  wallet: {
    network: 'mainnet' | 'testnet';
    autoConnect: boolean;
    showBalance: boolean;
  };
  features: {
    enableUpload: boolean;
    enableProfileEdit: boolean;
    enableNotifications: boolean;
    enableAnalytics: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: 'zh-CN' | 'en-US';
    showWelcomeMessage: boolean;
    maxFileSize: string;
  };
  security: {
    enableCSP: boolean;
    enableHSTS: boolean;

  };
}

export interface ConfigManager {
  config: AppConfig;
  loadConfig: () => Promise<void>;
  updateConfig: (updates: Partial<AppConfig>) => void;
  getConfigValue: <T>(path: string) => T | undefined;
  isFeatureEnabled: (feature: keyof AppConfig['features']) => boolean;
}
