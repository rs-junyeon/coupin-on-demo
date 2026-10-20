/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': decodeURIComponent(new URL('./src', import.meta.url).pathname) } },
  server: { port: 5173, strictPort: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/app/tests/setup.ts'],
    // tokens.css는 adminTheme.test.ts가 ?raw로 읽는다. 나머지 CSS는 테스트에서 처리하지 않는다
    css: { include: [/tokens\.css/], modules: { classNameStrategy: 'non-scoped' } },
  },
});
