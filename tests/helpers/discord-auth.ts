import { Page } from '@playwright/test';

/**
 * Discord OAuth 페이지에서 "인증" 버튼을 클릭하는 헬퍼.
 *
 * codegen으로 auth.json을 만들 때는 수동으로 진행하지만,
 * 이미 Discord 세션이 남아있는 경우(쿠키 유효) 자동으로 인증 버튼을 눌러준다.
 */
export async function handleDiscordOAuth(page: Page, { timeout = 10000 } = {}) {
	// Discord OAuth 페이지로 리다이렉트 대기
	await page.waitForURL(/discord\.com\/oauth2\/authorize/, { timeout });

	// "인증" 버튼 클릭 (한국어/영어 모두 대응)
	const authorizeBtn = page.locator('button:has-text("인증"), button:has-text("Authorize")');
	await authorizeBtn.waitFor({ state: 'visible', timeout });
	await authorizeBtn.click();

	// 콜백 리다이렉트 완료 대기 (/auth/callback?token=...)
	await page.waitForURL(/\/auth\/callback/, { timeout: 15000 });

	// 콜백 처리 후 최종 페이지 로딩 대기
	await page.waitForURL(url => {
		const path = new URL(url).pathname;
		return path !== '/auth/callback' && path !== '/login';
	}, { timeout: 15000 });
}

/**
 * 로그인 페이지에서 Discord 로그인 버튼을 클릭한다.
 */
export async function clickDiscordLogin(page: Page) {
	await page.goto('/login');
	await page.waitForLoadState('networkidle');

	// 스플래시 스크린 대기
	try {
		await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 10000 });
	} catch { /* ignore */ }

	// Discord 로그인 버튼 클릭
	await page.locator('button:has-text("Discord")').click();
}
