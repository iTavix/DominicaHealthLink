import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    // Keep output compatible with the older mobile Safari versions the operators use.
    target: 'es2018',
    // Split the two big vendors into their own hashed chunks: they download in parallel
    // and stay cached across app-code updates.
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/compat/app', 'firebase/compat/auth', 'firebase/compat/firestore', 'firebase/compat/storage'],
          lucide: ['lucide'],
        },
      },
    },
  },
});
