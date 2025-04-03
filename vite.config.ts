import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    server: {
        open: false, // 自动启动浏览器
        host: "0.0.0.0", // localhost
        port: 7777, // 端口号
        hmr: { overlay: false }
        // the proxy setting: to solve CORS
        // proxy: {
        //     '/api': {
        //         target: 'http://127.0.0.1:7777', // 确保端口与后端一致
        //         changeOrigin: true,
        //         rewrite: (path) => path.replace(/^\/api/, '') // Vite 的 pathRewrite 语法
        //     }
        // }
    }
})
