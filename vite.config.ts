import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/ai-colleague-app/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.svg', 'icons/*.png'],
      manifest: {
        name: 'AI秘書ちゃん',
        short_name: 'AI秘書',
        description: 'パーソナルタスク・スケジュール管理PWA',
        theme_color: '#0F0F13',
        background_color: '#0F0F13',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/ai-colleague-app/',
        start_url: '/ai-colleague-app/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
})
