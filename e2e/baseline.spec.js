import { test, expect } from '@playwright/test';

const pages = [
	{ name: 'login', path: '/login', skipAuth: true },
	{ name: 'dashboard', path: '/dashboard' },
	{ name: 'ranking', path: '/ranking' },
	{ name: 'myinfo', path: '/myinfo' },
	{ name: 'match-history', path: '/match-history' },
	{ name: 'honor-ranking', path: '/honor-ranking' },
	{ name: 'group-settings', path: '/group-settings' },
	{ name: 'achievement', path: '/achievement' },
	{ name: 'challenge', path: '/challenge' },
	{ name: 'balance-report', path: '/balance-report' },
	{ name: 'release-notes', path: '/release-notes' },
	{ name: 'maintenance', path: '/maintenance' }
];

test.describe('Baseline 스크린샷', () => {
	test('전체 페이지 캡처', async ({ browser }, testInfo) => {
		testInfo.setTimeout(120000);
		const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
		const page = await context.newPage();

		// 1) 로그인 페이지 스크린샷 (로그인 전)
		await page.goto('/login');
		await page.waitForLoadState('networkidle');
		try {
			await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 10000 });
		} catch { /* ignore */ }
		await page.screenshot({ path: 'e2e/screenshots/baseline-login.png', fullPage: true });

		// 2) 로그인: riotId 필드에 ZeroBoom#KR1 입력
		try {
			await page.fill('input[name="riotId"]', 'ZeroBoom#KR1', { timeout: 5000 });
			await page.click('button[type="submit"]');
			await page.waitForLoadState('networkidle');
			await page.waitForTimeout(3000);
		} catch {
			// 로그인 실패 시 (백엔드 미연결 등) 로그인 없이 진행
		}

		// 3) 나머지 페이지 스크린샷
		for (const p of pages) {
			if (p.skipAuth) continue;

			await page.goto(p.path, { waitUntil: 'domcontentloaded' });
			await page.waitForLoadState('networkidle');

			try {
				await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 10000 });
			} catch { /* ignore */ }

			await page.waitForTimeout(2000);

			await page.screenshot({
				path: `e2e/screenshots/baseline-${p.name}.png`,
				fullPage: true
			});
		}

		await context.close();
	});
});
