import { test, expect } from '@playwright/test';

/**
 * 스모크 테스트: 인증 없이 모든 페이지가 JS 크래시 없이 렌더링되는지 확인.
 * 매 Phase 마이그레이션 후 반드시 실행.
 */

function collectCrashErrors(page) {
	const errors: string[] = [];
	page.on('pageerror', (err: Error) => {
		errors.push(err.message);
	});
	return errors;
}

const publicPages = [
	{ name: '로그인', path: '/login' },
	{ name: '챌린지 목록', path: '/challenge' },
	{ name: '밸런스 리포트', path: '/balance-report' },
	{ name: '릴리즈 노트', path: '/release-notes' },
	{ name: '점검 페이지', path: '/maintenance' }
];

const authPages = [
	{ name: '대시보드', path: '/dashboard' },
	{ name: '랭킹', path: '/ranking' },
	{ name: '내 정보', path: '/myinfo' },
	{ name: '매치 히스토리', path: '/match-history' },
	{ name: '명예 랭킹', path: '/honor-ranking' },
	{ name: '그룹 설정', path: '/group-settings' },
	{ name: '업적', path: '/achievement' }
];

const allPages = [...publicPages, ...authPages];

for (const { name, path } of allPages) {
	test(`${name} (${path}) - JS 크래시 없음`, async ({ page }) => {
		const crashes = collectCrashErrors(page);

		await page.goto(path, { waitUntil: 'domcontentloaded' });

		// 콘텐츠 로딩 대기
		try {
			await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 10000 });
		} catch { /* splash가 안 사라져도 크래시만 아니면 OK */ }

		// #root에 콘텐츠가 있는지
		const rootContent = await page.$eval('#root', (el: Element) => el.children.length);
		expect(rootContent).toBeGreaterThan(0);

		// JS 크래시가 없어야 함
		expect(crashes).toEqual([]);
	});
}

test('404 - JS 크래시 없음', async ({ page }) => {
	const crashes = collectCrashErrors(page);
	await page.goto('/this-does-not-exist', { waitUntil: 'domcontentloaded' });
	await page.waitForTimeout(2000);
	expect(crashes).toEqual([]);
});
