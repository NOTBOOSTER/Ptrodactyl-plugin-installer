import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    lib: {
      entry: 'src/client/index.tsx',
      name: 'MinecraftPluginInstaller',
      fileName: () => 'client.js',
      formats: ['es'],
    },
    outDir: 'dist',
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@pterodactyl/sdk',
        '@tanstack/react-query',
      ],
    },
  },
});
