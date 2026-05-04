import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { execSync } from 'child_process';
import { transformSync } from 'esbuild';
import { readFileSync } from 'fs';

const commitHash = (() => {
	if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
	try {
		return execSync('git rev-parse --short HEAD').toString().trim();
	} catch (e) {
		return 'unknown';
	}
})();

const jsxInJsPlugin = {
	name: 'jsx-in-js',
	enforce: 'pre',
	load(id) {
		if (id.match(/src[/\\].*\.jsx?$/) && !id.includes('node_modules')) {
			const code = readFileSync(id, 'utf-8');
			const result = transformSync(code, {
				loader: 'jsx',
				jsx: 'automatic',
				sourcefile: id,
				sourcemap: false
			});
			return { code: result.code, map: null };
		}
		return null;
	}
};

export default defineConfig({
	plugins: [jsxInJsPlugin, react()],
	define: {
		__COMMIT_HASH__: JSON.stringify(commitHash)
	},
	optimizeDeps: {
		esbuildOptions: {
			loader: {
				'.js': 'jsx'
			}
		}
	},
	resolve: {
		alias: {
			'@fuse': path.resolve(__dirname, 'src/@fuse'),
			'@history': path.resolve(__dirname, 'src/@history'),
			'@lodash': path.resolve(__dirname, 'src/@lodash'),
			app: path.resolve(__dirname, 'src/app'),
			styles: path.resolve(__dirname, 'src/styles')
		}
	},
	server: {
		port: 5173,
		open: true
	},
	build: {
		outDir: 'build',
		sourcemap: false,
		chunkSizeWarningLimit: 700,
		rollupOptions: {
			output: {
				manualChunks: {
					'react-vendor': [
						'react',
						'react-dom',
						'react-router-dom',
						'react-redux',
						'redux',
						'redux-thunk'
					],
					'mui-vendor': [
						'@mui/material',
						'@mui/icons-material',
						'@mui/lab',
						'@emotion/react',
						'@emotion/styled',
						'tss-react'
					],
					'chart-vendor': ['chart.js', 'react-chartjs-2'],
					'date-vendor': ['@mui/x-date-pickers', 'date-fns'],
					'util-vendor': ['lodash', 'axios', 'clsx', 'mobile-detect', 'perfect-scrollbar']
				}
			}
		}
	}
});
