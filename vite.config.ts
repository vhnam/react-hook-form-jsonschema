import { resolve } from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import pkg from './package.json'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) =>
        format === 'es' ? 'index.esm.js' : 'index.cjs.js',
    },
    outDir: 'output',
    emptyOutDir: true,
    sourcemap: true,
    minify: true,
    rollupOptions: {
      external: [...Object.keys(pkg.peerDependencies), 'react-hook-form'],
    },
  },
})
