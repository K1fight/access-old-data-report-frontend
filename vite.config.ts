import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://rt-access-data-report-service.icysand-9477e6ec.germanywestcentral.azurecontainerapps.io',
        changeOrigin: true,
      },
    },
  },
});