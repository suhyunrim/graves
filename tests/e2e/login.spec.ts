import { test, expect } from '@playwright/test';

test.describe('로그인', () => {
	test('로그인 상태에서 대시보드 진입 가능', async ({ page }) => {
		await page.goto('/dashboard');

		// 스플래시 스크린이 사라지고 실제 콘텐츠가 보일 때까지 대기
		await expect(page.locator('nav').first()).toBeVisible({ timeout: 20000 });

		// 로그인 페이지로 리다이렉트되지 않아야 함
		expect(page.url()).not.toContain('/login');
	});

	test('로그인 페이지 렌더링', async ({ browser }) => {
		// 인증 없는 깨끗한 컨텍스트
		const context = await browser.newContext();
		const page = await context.newPage();

		await page.goto('/login');

		// 로그인 폼이 나타날 때까지 대기 (스플래시 대신 직접 요소 대기)
		await expect(page.locator('input[name="riotId"]')).toBeVisible({ timeout: 20000 });
		await expect(page.locator('button[type="submit"]')).toBeVisible();
		await expect(page.locator('button:has-text("Discord")')).toBeVisible();

		await context.close();
	});

	test('Discord 로그인 버튼 클릭 시 OAuth 리다이렉트', async ({ browser }) => {
		const context = await browser.newContext();
		const page = await context.newPage();

		await page.goto('/login');
		await expect(page.locator('button:has-text("Discord")')).toBeVisible({ timeout: 20000 });

		// Discord 버튼 클릭 → discord.com으로 이동 확인
		await Promise.all([
			page.waitForURL(/discord\.com|zeroboom/, { timeout: 15000 }),
			page.locator('button:has-text("Discord")').click()
		]);

		const url = page.url();
		expect(url.includes('discord.com') || url.includes('zeroboom')).toBeTruthy();

		await context.close();
	});
});
