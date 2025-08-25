import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 选项写法
      '/api': {
        target: 'http://127.0.0.1:8000', // 你的后端服务地址
        changeOrigin: true, // 需要虚拟主机站点
        rewrite: (path) => path.replace(/^\/api/, '') // 重写请求路径，去掉 '/api'
      },
    }
  }
})
