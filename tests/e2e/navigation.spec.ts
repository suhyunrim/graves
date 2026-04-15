/**
 * 네비게이션 E2E 테스트
 * 로그인 상태(auth.json)에서 사이드바 메뉴 클릭으로 각 페이지 이동 확인.
 */
import { test, expect } from '@playwright/test';

const sidebarMenuItems = [
	{ title: 'Dashboard', url: '/dashboard' },
	{ title: 'MyInfo', url: '/myinfo' },
	{ title: 'Ranking', url: '/ranking' },
	{ title: 'Match History', url: '/match-history' },
	{ title: 'Honor', url: '/honor-ranking' },
	{ title: 'Challenge', url: '/challenge' },
	{ title: 'Balancing Report', url: '/balance-report' },
	{ title: 'Release Notes', url: '/release-notes' },
];

test.describe('사이드바 네비게이션', () => {
	test('사이드바 메뉴 클릭으로 각 페이지 이동', async ({ page }) => {
		await page.goto('/dashboard');
		try {
			await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 15000 });
		} catch { /* ignore */ }
		await expect(page.locator('nav').first()).toBeVisible({ timeout: 15000 });

		const failures: string[] = [];

		for (const item of sidebarMenuItems) {
			try {
				// 사이드바 메뉴 텍스트 클릭
				const menuLink = page.locator(`nav a[href="${item.url}"], nav a[href*="${item.url}"]`).first();
				const textLink = page.getByRole('link', { name: item.title }).first();

				// nav 링크 먼저 시도, 없으면 텍스트 기반
				const link = await menuLink.count() > 0 ? menuLink : textLink;
				await link.click();

				// URL 변경 확인
				await page.waitForURL((url) => url.pathname.includes(item.url), { timeout: 10000 });
				expect(page.url()).toContain(item.url);

				// 스플래시 스크린 대기
				try {
					await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 10000 });
				} catch { /* ignore */ }
			} catch (err) {
				failures.push(`${item.title} (${item.url}): ${(err as Error).message}`);
			}
		}

		expect(failures, `네비게이션 실패:\n${failures.join('\n')}`).toEqual([]);
	});

	test('뒤로가기 동작 확인', async ({ page }) => {
		// 1) 대시보드 이동
		await page.goto('/dashboard');
		try {
			await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 15000 });
		} catch { /* ignore */ }

		// 2) 랭킹 페이지로 이동
		await page.goto('/ranking');
		try {
			await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 15000 });
		} catch { /* ignore */ }
		expect(page.url()).toContain('/ranking');

		// 3) 뒤로가기
		await page.goBack();
		await page.waitForURL((url) => url.pathname.includes('/dashboard'), { timeout: 10000 });
		expect(page.url()).toContain('/dashboard');
	});
});
