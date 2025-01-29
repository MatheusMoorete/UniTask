import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Carrega as variáveis de ambiente baseado no modo (development/production)
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
          assetFileNames: (assetInfo) => {
            let extType = assetInfo.name.split('.').at(1);
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              extType = 'img';
            }
            return `assets/${extType}/[name]-[hash][extname]`;
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
      },
      sourcemap: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false,
          drop_debugger: true
        }
      }
    },
    css: {
      modules: {
        generateScopedName: '[name]__[local]___[hash:base64:5]'
      },
      postcss: './postcss.config.cjs',
      devSourcemap: true
    },
    define: {
      // Expõe as variáveis VITE_ para o cliente
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_SUPABASE_PUBLIC_BUCKET_URL': JSON.stringify(env.VITE_SUPABASE_PUBLIC_BUCKET_URL),
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true
        }
      }
    },
    base: '/'
  }
})
