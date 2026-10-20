import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart({
      importProtection: {
        client: { specifiers: ['pg', '@prisma/adapter-pg', 'bcryptjs', 'cloudinary'] },
      },
    }),
    // Same region as the Neon database; every uncached query would otherwise cross the world
    nitro({ vercel: { functions: { regions: ['sin1'] } } }),
    viteReact(),
  ],
})
