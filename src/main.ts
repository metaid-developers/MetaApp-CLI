import { createApp } from 'vue'
import { pinia } from './stores'
import './style.css'
import App from './App.vue'
import Image from '@/components/Image/Image.vue'
import UserAvatar from '@/components/UserAvatar/UserAvatar.vue'
import './index.scss'
import { configManager } from './utils/config'

// 异步启动应用
async function startApp() {
  // 加载外部配置
  await configManager.loadConfig();
  
  const app = createApp(App)
  app.component('UserAvatar', UserAvatar)
  app.component('Image', Image)
  app.use(pinia)
  
  // 将配置管理器注入到全局属性
  app.config.globalProperties.$config = configManager;
  
  app.mount('#app')
  
  console.log('🚀 应用启动完成');
}

// 启动应用
startApp().catch(console.error);
