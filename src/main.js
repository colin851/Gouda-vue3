// 入口只负责创建 Vue 应用并挂载根组件；页面状态和交互集中在 App.vue 管理。
import { createApp } from 'vue'
import App from './App.vue'
import './styles.css'

createApp(App).mount('#app')
