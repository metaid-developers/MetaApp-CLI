// utils/config.ts
import type { AppConfig, ConfigManager } from '@/types/app-config';

class ConfigManagerImpl implements ConfigManager {
  public config: AppConfig;
  private defaultConfig: AppConfig;

  constructor() {
    // 默认配置
    this.defaultConfig = {
      app: {
        name: 'MetaID Demo App',
        version: '1.0.0',
        environment: 'production',
        debug: false
      },
      api: {

        MAN_BASE_URL:"https://man.metaid.io",
        timeout: 10000,
        retryAttempts: 3
      },
      wallet: {
        network: 'mainnet',
        autoConnect: true,
        showBalance: true
      },
      features: {
        enableUpload: true,
        enableProfileEdit: true,
        enableNotifications: true,
        enableAnalytics: false
      },
      ui: {
        theme: 'light',
        language: 'zh-CN',
        showWelcomeMessage: true,
        maxFileSize: '10MB'
      },
      security: {
        enableCSP: true,
        enableHSTS: true,
        
      }
    };

    // 初始化为默认配置
    this.config = JSON.parse(JSON.stringify(this.defaultConfig));
  }

  /**
   * 从 public/app-config.json 加载配置
   */
  async loadConfig(): Promise<void> {
    try {
      const response = await fetch('/app-config.json');
      
      if (!response.ok) {
        console.warn('⚠️ 无法加载 app-config.json，使用默认配置');
        return;
      }

      const externalConfig = await response.json();
      
      // 深度合并配置
      this.config = this.deepMerge(this.defaultConfig, externalConfig);
      
      console.log('✅ 配置加载成功:', this.config);
      
      // 应用配置到全局
      this.applyConfig();
      
    } catch (error) {
      console.error('❌ 配置加载失败，使用默认配置:', error);
    }
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<AppConfig>): void {
    this.config = this.deepMerge(this.config, updates);
    this.applyConfig();
  }

  /**
   * 根据路径获取配置值
   * @param path 配置路径，如 'api.baseUrl' 或 'features.enableUpload'
   */
  getConfigValue<T>(path: string): T | undefined {
    const keys = path.split('.');
    let value: any = this.config;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    
    return value as T;
  }

  /**
   * 检查功能是否启用
   */
  isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.config.features[feature];
  }

  /**
   * 深度合并对象
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * 应用配置到应用环境
   */
  private applyConfig(): void {
    // 设置全局调试模式
    if (this.config.app.debug) {
      (window as any).__DEBUG__ = true;
    }

    // 设置主题
    if (this.config.ui.theme !== 'auto') {
      document.documentElement.setAttribute('data-theme', this.config.ui.theme);
    }

    // 设置语言
    document.documentElement.lang = this.config.ui.language;

    // 应用安全配置
    if (this.config.security.enableCSP) {
      this.applyCSP();
    }

    console.log('🔧 配置已应用到应用环境');
  }

  /**
   * 应用内容安全策略
   */
  private applyCSP(): void {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    // meta.content = `
    //   default-src 'self';
    //   script-src 'self' 'unsafe-inline' 'unsafe-eval';
    //   style-src 'self' 'unsafe-inline';
    //   img-src 'self' data: https:;
    // `.replace(/\s+/g, ' ').trim();
    
    document.head.appendChild(meta);
  }

  /**
   * 获取文件大小限制（字节）
   */
  getMaxFileSizeBytes(): number {
    const sizeStr = this.config.ui.maxFileSize;
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)(MB|KB|GB)$/i);
    
    if (!match) return 10 * 1024 * 1024; // 默认 10MB
    
    const [, size, unit] = match;
    const sizeNum = parseFloat(size);
    
    switch (unit.toUpperCase()) {
      case 'KB': return sizeNum * 1024;
      case 'MB': return sizeNum * 1024 * 1024;
      case 'GB': return sizeNum * 1024 * 1024 * 1024;
      default: return 10 * 1024 * 1024;
    }
  }
}

// 创建全局配置管理器实例
export const configManager = new ConfigManagerImpl();

// 导出类型和实例
export type { AppConfig, ConfigManager };
export default configManager;
