import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'
import * as path from 'path'
import stdLibBrowser from 'node-stdlib-browser'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      // 在生产环境也包含文件名信息（开发环境默认启用）
      script: {
        defineModel: true,
        propsDestructure: true,
      },
      // 启用模板源代码映射
      template: {
        compilerOptions: {
          // 在开发环境添加注释，显示组件位置
          comments: true,
        },
      },
    }),
    VueDevTools({
      // 启用组件检查器，可以在页面上 Alt + Click 定位组件
      componentInspector: true,
      // 配置编辑器，支持 vscode、webstorm、atom 等
      // launchEditor: 'code', // 默认会自动检测，也可以手动指定
    }),
  ],
    resolve: {
    alias: {
    '@': path.resolve(__dirname, './src'),
    ...stdLibBrowser,
    },
    },
  server: {
    // 允许从局域网访问
    host: true,
  },
  build: {
    // 生成 sourcemap 以便调试
    sourcemap: true,
  },
})
