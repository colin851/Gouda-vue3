import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 构建配置只启用 Vue 单文件组件支持；Three.js 场景由业务组件按需异步加载。
export default defineConfig({
  plugins: [vue()],
})
