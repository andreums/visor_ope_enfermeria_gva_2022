import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: process.env.NODE_ENV === 'production'
    ? '/visor_ope_enfermeria_gva_2022/'
    : './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@primeuix': fileURLToPath(new URL('./node_modules/@primeuix', import.meta.url))
    }
  },
  css: {
    postcss: './postcss.config.cjs' // Note the .cjs extension
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      input: './index.html',
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.geojson')) {
            return 'assets/[name][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  }
})