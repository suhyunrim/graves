import { test, expect } from '@playwright/test';

// JS 런타임 에러(크래시)만 수집, 네트워크/API 에러는 무시
function collectCrashErrors(page) {
	const errors = [];
	page.on('pageerror', err => {
		errors.push(err.message);
	});
	return errors;
}

// ────────────────────────────────────────────
// 모든 페이지 스모크 테스트
// 기준: JS 크래시 없이 렌더링되고, #root 안에 콘텐츠가 있는가
// ────────────────────────────────────────────

const pages = [
	{ name: '로그인', path: '/login' },
	{ name: '대시보드', path: '/dashboard' },
	{ name: '랭킹', path: '/ranking' },
	{ name: '내 정보', path: '/myinfo' },
	{ name: '매치 히스토리', path: '/match-history' },
	{ name: '명예 랭킹', path: '/honor-ranking' },
	{ name: '그룹 설정', path: '/group-settings' },
	{ name: '업적', path: '/achievement' },
	{ name: '챌린지 목록', path: '/challenge' },
	{ name: '밸런스 리포트', path: '/balance-report' },
	{ name: '릴리즈 노트', path: '/release-notes' },
	{ name: '점검 페이지', path: '/maintenance' }
];

for (const { name, path } of pages) {
	test(`${name} (${path}) - 크래시 없이 렌더링`, async ({ page }) => {
		const crashes = collectCrashErrors(page);

		await page.goto(path, { waitUntil: 'domcontentloaded' });

		// 스플래시 스크린이 사라지고 실제 콘텐츠가 보일 때까지 대기 (최대 15초)
		try {
			await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 15000 });
		} catch {
			// 스플래시가 없는 페이지도 있으므로 무시
		}

		// 스크린샷 저장
		const fileName = path.replace(/\//g, '_').replace(/^_/, '') || 'root';
		await page.screenshot({ path: `e2e/screenshots/${fileName}.png`, fullPage: true });

		// #root 안에 콘텐츠가 있는지 (빈 페이지가 아닌지)
		const rootContent = await page.$eval('#root', el => el.children.length);
		expect(rootContent).toBeGreaterThan(0);

		// JS 런타임 크래시가 없어야 함
		expect(crashes).toEqual([]);
	});
}

// ────────────────────────────────────────────
// 404 페이지
// ────────────────────────────────────────────

test('404 - 존재하지 않는 경로', async ({ page }) => {
	const crashes = collectCrashErrors(page);
	await page.goto('/this-does-not-exist', { waitUntil: 'domcontentloaded' });
	try {
		await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 15000 });
	} catch {
		// ignore
	}
	await page.screenshot({ path: 'e2e/screenshots/404.png', fullPage: true });
	expect(crashes).toEqual([]);
});
