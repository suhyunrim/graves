import { test, expect } from '@playwright/test';

test.describe('랭킹 페이지', () => {
	test('랭킹 테이블 데이터 로딩', async ({ page }) => {
		await page.goto('/ranking');
		await page.waitForLoadState('networkidle');

		// 스플래시 스크린 대기
		try {
			await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 15000 });
		} catch { /* ignore */ }

		// 랭킹 테이블이 렌더링되었는지 확인
		const table = page.locator('table');
		await expect(table.first()).toBeVisible({ timeout: 15000 });

		// 테이블에 데이터 행이 1개 이상 존재하는지
		const rows = table.first().locator('tbody tr');
		await expect(rows.first()).toBeVisible({ timeout: 10000 });
		const rowCount = await rows.count();
		expect(rowCount).toBeGreaterThan(0);
	});

	test('랭킹 헤더에 그룹 정보 표시', async ({ page }) => {
		await page.goto('/ranking');
		await page.waitForLoadState('networkidle');

		try {
			await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 15000 });
		} catch { /* ignore */ }

		// "내전 레이팅 순위" 텍스트가 보여야 함
		await expect(page.locator('text=내전 레이팅 순위')).toBeVisible({ timeout: 10000 });
	});

	test('내 랭킹이 표시됨', async ({ page }) => {
		await page.goto('/ranking');
		await page.waitForLoadState('networkidle');

		try {
			await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 15000 });
		} catch { /* ignore */ }

		// 테이블 렌더링 대기
		await expect(page.locator('table').first()).toBeVisible({ timeout: 15000 });

		// ZeroBoom 닉네임이 테이블에 존재하는지
		await expect(page.locator('text=ZeroBoom')).toBeVisible({ timeout: 10000 });
	});
});
