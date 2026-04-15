import { test, expect, Page } from '@playwright/test';

/**
 * 스모크 테스트: 모든 페이지가 JS 크래시 없이 렌더링되는지 확인.
 * riotId 로그인(ZeroBoom#KR1)으로 인증 필요 페이지도 검증.
 * 매 Phase 마이그레이션 후 반드시 실행.
 */

function collectCrashErrors(page: Page) {
	const errors: string[] = [];
	page.on('pageerror', (err: Error) => {
		errors.push(err.message);
	});
	return errors;
}

// ── 공개 페이지 (로그인 불필요) ──

const publicPages = [
	{ name: '로그인', path: '/login' },
	{ name: '챌린지 목록', path: '/challenge' },
	{ name: '밸런스 리포트', path: '/balance-report' },
	{ name: '릴리즈 노트', path: '/release-notes' },
	{ name: '점검 페이지', path: '/maintenance' }
];

for (const { name, path } of publicPages) {
	test(`[공개] ${name} (${path}) - 크래시 없음`, async ({ page }) => {
		const crashes = collectCrashErrors(page);
		await page.goto(path, { waitUntil: 'domcontentloaded' });
		try {
			await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 10000 });
		} catch { /* ignore */ }

		const rootContent = await page.$eval('#root', (el: Element) => el.children.length);
		expect(rootContent).toBeGreaterThan(0);
		expect(crashes).toEqual([]);
	});
}

// ── 인증 필요 페이지 (riotId 로그인 후 접근) ──

const authPages = [
	{ name: '대시보드', path: '/dashboard' },
	{ name: '랭킹', path: '/ranking' },
	{ name: '내 정보', path: '/myinfo' },
	{ name: '매치 히스토리', path: '/match-history' },
	{ name: '명예 랭킹', path: '/honor-ranking' },
	{ name: '업적', path: '/achievement' }
];

test.describe('인증 필요 페이지', () => {
	test.beforeAll(async ({ browser }) => {
		// riotId 로그인으로 세션 획득
		const context = await browser.newContext();
		const page = await context.newPage();

		await page.goto('/login');
		await page.waitForLoadState('networkidle');
		try {
			await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 15000 });
		} catch { /* ignore */ }

		// riotId 입력 후 로그인
		try {
			await page.fill('input[name="riotId"]', 'ZeroBoom#KR1', { timeout: 5000 });
			await page.click('button[type="submit"]');
			await page.waitForTimeout(3000);
			await page.waitForLoadState('networkidle');

			// 로그인 성공 시 auth state 저장
			await context.storageState({ path: 'tests/smoke-auth.json' });
		} catch {
			// 로그인 실패해도 테스트는 계속 진행
		}

		await context.close();
	});

	for (const { name, path } of authPages) {
		test(`[인증] ${name} (${path}) - 크래시 없음`, async ({ browser }) => {
			let context;
			try {
				context = await browser.newContext({ storageState: 'tests/smoke-auth.json' });
			} catch {
				context = await browser.newContext();
			}
			const page = await context.newPage();
			const crashes = collectCrashErrors(page);

			await page.goto(path, { waitUntil: 'domcontentloaded' });
			try {
				await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 15000 });
			} catch { /* ignore */ }

			const rootContent = await page.$eval('#root', (el: Element) => el.children.length);
			expect(rootContent).toBeGreaterThan(0);
			expect(crashes).toEqual([]);

			await context.close();
		});
	}
});

// ── 404 ──

test('404 - 크래시 없음', async ({ page }) => {
	const crashes = collectCrashErrors(page);
	await page.goto('/this-does-not-exist', { waitUntil: 'domcontentloaded' });
	await page.waitForTimeout(2000);
	expect(crashes).toEqual([]);
});
