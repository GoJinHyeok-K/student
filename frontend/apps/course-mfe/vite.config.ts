import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 단독 실행용 개발 서버 (3회차 Step 7). Module Federation은 6주차에 붙인다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: true,
    // CORS 대신 개발 서버 프록시: 브라우저는 3001만 부르고, /api 요청은 백엔드(8080)로 넘긴다
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
});
