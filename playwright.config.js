import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	timeout: 30000,
	expect: {
		timeout: 10000
	},
	fullyParallel: false,
	retries: 0,
	reporter: 'html',
	use: {
		baseURL: 'http://localhost:3001',
		screenshot: 'on',
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'chromium',
			use: { browserName: 'chromium', viewport: { width: 1280, height: 720 } }
		}
	],
	webServer: {
		command: 'yarn dev',
		url: 'http://localhost:3001',
		reuseExistingServer: true,
		timeout: 60000
	}
});
