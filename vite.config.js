import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { transformSync } from 'esbuild';
import { readFileSync } from 'fs';

const jsxInJsPlugin = {
	name: 'jsx-in-js',
	enforce: 'pre',
	load(id) {
		if (id.match(/src[/\\].*\.jsx?$/) && !id.includes('node_modules')) {
			const code = readFileSync(id, 'utf-8');
			const result = transformSync(code, {
				loader: 'jsx',
				jsx: 'transform',
				jsxFactory: 'React.createElement',
				jsxFragment: 'React.Fragment',
				sourcefile: id,
				sourcemap: false
			});
			return { code: result.code, map: null };
		}
		return null;
	}
};

export default defineConfig({
	plugins: [jsxInJsPlugin, react({ jsxRuntime: 'classic' })],
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
		port: 3001,
		open: true
	},
	build: {
		outDir: 'build',
		sourcemap: false
	}
});
