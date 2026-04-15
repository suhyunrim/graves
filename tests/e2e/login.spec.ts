/**
 * 로그인 관련 E2E 테스트
 * auth.json 인증 상태 기반 + 미인증 상태 테스트
 */
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

		// Discord 버튼 클릭 -> discord.com으로 이동 확인
		await Promise.all([
			page.waitForURL(/discord\.com|zeroboom/, { timeout: 15000 }),
			page.locator('button:has-text("Discord")').click()
		]);

		const url = page.url();
		expect(url.includes('discord.com') || url.includes('zeroboom')).toBeTruthy();

		await context.close();
	});

	test('riotId 로그인 -> 대시보드 도착 -> 사이드바 메뉴 보임', async ({ browser }) => {
		const context = await browser.newContext();
		const page = await context.newPage();

		await page.goto('/login');
		await page.waitForSelector('input[name="riotId"]', { state: 'visible', timeout: 20000 });
		await page.fill('input[name="riotId"]', 'ZeroBoom#KR1');
		await page.click('button[type="submit"]');

		// 대시보드 도착 확인
		await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
		expect(page.url()).toContain('/dashboard');

		// 사이드바 메뉴 항목들이 보이는지 확인
		await expect(page.locator('nav').first()).toBeVisible({ timeout: 10000 });
		await expect(page.getByText('Dashboard', { exact: false })).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('Ranking', { exact: false })).toBeVisible({ timeout: 5000 });

		await context.close();
	});

	test('잘못된 riotId로 로그인 시도 -> 크래시 없음', async ({ browser }) => {
		const context = await browser.newContext();
		const page = await context.newPage();

		const crashes: string[] = [];
		page.on('pageerror', (err: Error) => crashes.push(err.message));

		await page.goto('/login');
		await page.waitForSelector('input[name="riotId"]', { state: 'visible', timeout: 20000 });

		// 존재하지 않는 riotId
		await page.fill('input[name="riotId"]', 'InvalidUser#0000');
		await page.click('button[type="submit"]');

		// 3초 대기 - 에러가 발생하더라도 크래시 없어야 함
		await page.waitForTimeout(3000);

		// 페이지가 크래시되지 않아야 함
		expect(crashes, `pageerror 발생: ${crashes.join(' | ')}`).toEqual([]);

		// 여전히 로그인 페이지에 있거나 에러 메시지가 보여야 함 (대시보드로 가면 안 됨)
		const url = page.url();
		expect(url.includes('/login') || url.includes('/error')).toBeTruthy();

		await context.close();
	});
});
