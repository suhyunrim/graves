/**
 * 시각 회귀 테스트
 * Playwright toHaveScreenshot() API로 기준선 스크린샷을 생성하고 이후 비교.
 * 데이터가 매번 바뀌므로 동적 영역(테이블 내용, 차트 데이터)을 마스킹하고
 * 레이아웃/구조만 비교한다.
 *
 * 기준선 생성: yarn test:visual:update
 * 비교 실행: yarn test:visual
 */
import { test, expect, Page } from '@playwright/test';

/** 스플래시 스크린 대기 헬퍼 */
async function waitForSplash(page: Page) {
	try {
		await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 15000 });
	} catch { /* splash 없는 페이지도 있음 */ }
}

/** riotId 로그인 수행 */
async function loginWithRiotId(page: Page) {
	await page.goto('/login');
	await page.waitForSelector('input[name="riotId"]', { state: 'visible', timeout: 20000 });
	await page.fill('input[name="riotId"]', 'ZeroBoom#KR1');
	await page.click('button[type="submit"]');
	await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
}

// ── 공개 페이지 (로그인 불필요) ──

test('로그인 페이지 시각 회귀', async ({ page }) => {
	await page.goto('/login');
	await page.waitForSelector('input[name="riotId"]', { state: 'visible', timeout: 20000 });

	await expect(page).toHaveScreenshot('login.png', {
		maxDiffPixelRatio: 0.05
	});
});

test('점검 페이지 시각 회귀', async ({ page }) => {
	await page.goto('/maintenance');
	await waitForSplash(page);
	await page.waitForTimeout(1000);

	await expect(page).toHaveScreenshot('maintenance.png', {
		maxDiffPixelRatio: 0.05
	});
});

// ── 인증 필요 페이지 (하나의 테스트에서 로그인 후 순회) ──

test('인증 페이지 시각 회귀 (대시보드, 랭킹, 밸런스 리포트)', async ({ page }) => {
	await loginWithRiotId(page);

	// 대시보드
	await page.goto('/dashboard');
	await waitForSplash(page);
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(1000);

	await expect(page).toHaveScreenshot('dashboard.png', {
		maxDiffPixelRatio: 0.05,
		mask: [
			// 동적 데이터 마스킹: 테이블, 숫자 값, 날짜 등
			page.locator('table tbody'),
			page.locator('canvas'),
			page.locator('[class*="MuiTypography"]').filter({ hasText: /\d+/ })
		]
	});

	// 랭킹
	await page.goto('/ranking');
	await waitForSplash(page);
	await page.waitForLoadState('networkidle');
	await expect(page.locator('table').first()).toBeVisible({ timeout: 15000 });
	await page.waitForTimeout(1000);

	await expect(page).toHaveScreenshot('ranking.png', {
		maxDiffPixelRatio: 0.05,
		mask: [
			// 테이블 내용은 동적이므로 마스킹
			page.locator('table tbody')
		]
	});

	// 밸런스 리포트
	await page.goto('/balance-report');
	await waitForSplash(page);
	await page.waitForLoadState('networkidle');
	await expect(page.locator('canvas').first()).toBeVisible({ timeout: 15000 });
	await page.waitForTimeout(1000);

	await expect(page).toHaveScreenshot('balance-report.png', {
		maxDiffPixelRatio: 0.05,
		mask: [
			// 차트 canvas는 데이터에 따라 매번 다르므로 마스킹
			page.locator('canvas')
		]
	});
});
