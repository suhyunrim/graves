/**
 * 밸런스 리포트 E2E 테스트
 * 차트 렌더링 및 날짜 필터 동작 확인.
 * auth.json 인증 상태 기반.
 */
import { test, expect } from '@playwright/test';

test.describe('밸런스 리포트', () => {
	test('차트 canvas 렌더링 확인', async ({ page }) => {
		await page.goto('/balance-report');
		await page.waitForLoadState('networkidle');

		try {
			await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 15000 });
		} catch { /* ignore */ }

		// canvas 요소가 1개 이상 렌더링되어야 함 (Chart.js)
		const canvases = page.locator('canvas');
		await expect(canvases.first()).toBeVisible({ timeout: 15000 });
		const canvasCount = await canvases.count();
		expect(canvasCount, '차트 canvas가 최소 1개 존재해야 함').toBeGreaterThan(0);
	});

	test('날짜 필터 변경 -> 크래시 없이 갱신', async ({ page }) => {
		await page.goto('/balance-report');
		await page.waitForLoadState('networkidle');

		try {
			await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 15000 });
		} catch { /* ignore */ }

		// canvas 렌더링 대기
		await expect(page.locator('canvas').first()).toBeVisible({ timeout: 15000 });

		const crashes: string[] = [];
		page.on('pageerror', (err: Error) => crashes.push(err.message));

		// 날짜 관련 UI 요소 찾기 (select, input[type=date], DatePicker 등)
		const dateInputs = page.locator('input[type="date"], input[type="month"], [class*="DatePicker"], [class*="MuiSelect"]');
		const dateButtons = page.locator('button').filter({ hasText: /이전|다음|prev|next|<|>/i });

		const dateInputCount = await dateInputs.count();
		const dateButtonCount = await dateButtons.count();

		if (dateButtonCount > 0) {
			// 날짜 네비게이션 버튼 클릭
			await dateButtons.first().click();
			await page.waitForTimeout(2000);

			// 크래시 없이 canvas 여전히 존재
			await expect(page.locator('canvas').first()).toBeVisible({ timeout: 10000 });
		} else if (dateInputCount > 0) {
			// 날짜 입력 필드 변경
			await dateInputs.first().click();
			await page.waitForTimeout(1000);
		}

		// 크래시가 없어야 함
		expect(crashes, `pageerror 발생: ${crashes.join(' | ')}`).toEqual([]);
	});
});
