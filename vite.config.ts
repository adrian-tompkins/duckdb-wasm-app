import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [basicSsl()],
  server: {
    https: false,
    port: 3000
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
}); 