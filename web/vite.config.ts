import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [react()],
	build: {
		outDir: 'dist',
		rollupOptions: {
			input: './index.html',
			output: {
				entryFileNames: 'app.js',
				assetFileNames: 'app.[ext]',
				// No code splitting - everything inline for ChatGPT iframe
				manualChunks: undefined,
				inlineDynamicImports: true,
			},
		},
		// Optimize bundle size
		minify: 'esbuild',
		target: 'es2015',
	},
	server: {
		port: 5173,
	},
})
