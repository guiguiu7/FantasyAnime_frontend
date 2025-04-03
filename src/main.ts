import { createApp } from 'vue'
import { createPinia } from "pinia";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import './style.css'
import App from './App.vue'
import './axios/axios_config'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from "./router/router.ts";
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 创建pinia
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.use(pinia).use(router).use(ElementPlus).mount('#app')
