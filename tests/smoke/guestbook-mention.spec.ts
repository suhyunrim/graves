import { test, expect } from '@playwright/test';

const IGNORED = [
	'net::ERR_',
	'Failed to load resource',
	'favicon.ico',
	'Download the React DevTools',
	'API 호출 실패',
	'AxiosError',
	'401',
	'403',
	'ResizeObserver loop',
	'Functions that are interpolated in css calls',
	'non-boolean attribute',
	'nth-child'
];

test('[방명록] /myinfo 방명록 탭 진입 시 크래시 없음', async ({ page }) => {
	const crashes: string[] = [];
	const consoleErrors: string[] = [];

	page.on('pageerror', err => crashes.push(err.message));
	page.on('console', msg => {
		if (msg.type() !== 'error') return;
		const text = msg.text();
		if (!IGNORED.some(p => text.includes(p))) consoleErrors.push(text);
	});

	await page.goto('/login');
	await page.waitForSelector('input[name="riotId"]', { state: 'visible', timeout: 20000 });
	await page.fill('input[name="riotId"]', 'ZeroBoom#KR1');
	await page.click('button[type="submit"]');
	await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });

	await page.goto('/myinfo', { waitUntil: 'domcontentloaded' });
	try {
		await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 15000 });
	} catch {
		/* no splash on /myinfo after first load */
	}

	const guestbookTab = page.getByRole('tab', { name: '방명록' });
	await expect(guestbookTab).toBeVisible({ timeout: 10000 });
	await guestbookTab.click();

	// Guestbook 섹션 마운트 대기 — title 텍스트 "방명록"이 들어있는 div
	await page.waitForTimeout(1500);

	expect(crashes, `pageerror: ${crashes.join(' | ')}`).toEqual([]);
	expect(consoleErrors, `console.error: ${consoleErrors.join(' | ')}`).toEqual([]);
});
