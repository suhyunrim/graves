import { defineConfig } from '@playwright/test';

export default defineConfig({
	globalSetup: './tests/global-setup.ts',
	testDir: './tests',
	timeout: 30000,
	expect: {
		timeout: 10000
	},
	fullyParallel: false,
	retries: 0,
	reporter: 'html',
	use: {
		baseURL: 'http://localhost:5173',
		screenshot: 'on',
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'smoke',
			testDir: './tests/smoke',
			use: {
				viewport: { width: 1280, height: 720 }
			}
		},
		{
			name: 'content',
			testDir: './tests/content',
			use: {
				viewport: { width: 1280, height: 720 }
			}
		},
		{
			name: 'setup',
			testMatch: /auth\.setup\.ts/
		},
		{
			name: 'e2e',
			testDir: './tests/e2e',
			dependencies: ['setup'],
			use: {
				storageState: 'tests/auth.json',
				viewport: { width: 1280, height: 720 }
			}
		},
		{
			name: 'visual',
			testDir: './tests/visual',
			use: {
				viewport: { width: 1280, height: 720 }
			}
		}
	],
	webServer: {
		command: 'yarn dev',
		url: 'http://localhost:5173',
		reuseExistingServer: true,
		timeout: 60000
	}
});
