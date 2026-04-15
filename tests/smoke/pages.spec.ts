import { test, expect, Page } from '@playwright/test';

/**
 * 스모크 테스트: 모든 페이지가 JS 크래시 없이 렌더링되는지 확인.
 * riotId 로그인(ZeroBoom#KR1)으로 인증 필요 페이지도 검증.
 * 매 Phase 마이그레이션 후 반드시 실행.
 *
 * 감지 항목:
 * 1. pageerror - 잡히지 않은 JS 예외
 * 2. console.error - React ErrorBoundary가 잡은 에러 포함
 * 3. ErrorBoundary fallback UI 렌더링 여부
 */

// console.error 중 무시할 패턴 (네트워크 에러, 개발 모드 경고 등)
const IGNORED_CONSOLE_ERRORS = [
	'net::ERR_',
	'Failed to load resource',
	'favicon.ico',
	'Download the React DevTools',
	'API 호출 실패',
	'AxiosError',
	'401',
	'403',
	'ResizeObserver loop',
	// MUI/tss-react 개발 경고 (크래시 아님, 추후 정리 대상)
	'Functions that are interpolated in css calls',
	'non-boolean attribute',
];

function shouldIgnoreConsoleError(text: string): boolean {
	return IGNORED_CONSOLE_ERRORS.some(pattern => text.includes(pattern));
}

function collectErrors(page: Page) {
	const crashes: string[] = [];
	const consoleErrors: string[] = [];

	page.on('pageerror', (err: Error) => {
		crashes.push(err.message);
	});

	page.on('console', (msg) => {
		if (msg.type() === 'error') {
			const text = msg.text();
			if (!shouldIgnoreConsoleError(text)) {
				consoleErrors.push(text);
			}
		}
	});

	return { crashes, consoleErrors };
}

/** 페이지 이동 후 공통 검증 수행 */
async function visitAndVerify(page: Page, path: string) {
	const { crashes, consoleErrors } = collectErrors(page);

	await page.goto(path, { waitUntil: 'domcontentloaded' });
	try {
		await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 15000 });
	} catch { /* splash가 없는 페이지도 있음 */ }

	// 기본 렌더링 확인
	const rootContent = await page.$eval('#root', (el: Element) => el.children.length);
	expect(rootContent, `${path}: #root에 컨텐츠가 없음`).toBeGreaterThan(0);

	// ErrorBoundary fallback 감지
	const fallback = await page.$('text=문제가 발생했습니다');
	expect(fallback, `${path}: ErrorBoundary fallback이 렌더링됨`).toBeNull();

	// JS 에러 확인
	expect(crashes, `${path}: pageerror 발생 - ${crashes.join(' | ')}`).toEqual([]);
	expect(consoleErrors, `${path}: console.error 감지됨 - ${consoleErrors.join(' | ')}`).toEqual([]);
}

// ── 공개 페이지 (로그인 불필요) ──

const publicPages = [
	{ name: '로그인', path: '/login' },
	{ name: '챌린지 목록', path: '/challenge' },
	{ name: '밸런스 리포트', path: '/balance-report' },
	{ name: '릴리즈 노트', path: '/release-notes' },
	{ name: '점검 페이지', path: '/maintenance' },
];

for (const { name, path } of publicPages) {
	test(`[공개] ${name} (${path}) - 크래시 없음`, async ({ page }) => {
		await visitAndVerify(page, path);
	});
}

// ── 인증 필요 페이지 (riotId 로그인 후 순회) ──

const authPages = [
	{ name: '대시보드', path: '/dashboard' },
	{ name: '랭킹', path: '/ranking' },
	{ name: '내 정보', path: '/myinfo' },
	{ name: '매치 히스토리', path: '/match-history' },
	{ name: '명예 랭킹', path: '/honor-ranking' },
	{ name: '업적', path: '/achievement' },
];

test('[인증] riotId 로그인 → 인증 페이지 순회', async ({ page }) => {
	// 1) riotId 로그인
	await page.goto('/login');
	await page.waitForSelector('input[name="riotId"]', { state: 'visible', timeout: 20000 });
	await page.fill('input[name="riotId"]', 'ZeroBoom#KR1');
	await page.click('button[type="submit"]');
	await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });

	// 2) 각 인증 페이지 순회
	const failures: string[] = [];

	for (const { name, path } of authPages) {
		const crashes: string[] = [];
		const consoleErrors: string[] = [];

		// 페이지별 에러 수집 (이전 리스너 제거를 위해 새로 등록)
		const onPageError = (err: Error) => crashes.push(err.message);
		const onConsole = (msg: { type: () => string; text: () => string }) => {
			if (msg.type() === 'error') {
				const text = msg.text();
				if (!shouldIgnoreConsoleError(text)) {
					consoleErrors.push(text);
				}
			}
		};

		page.on('pageerror', onPageError);
		page.on('console', onConsole);

		try {
			await page.goto(path, { waitUntil: 'domcontentloaded' });
			try {
				await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 15000 });
			} catch { /* ignore */ }

			// 해당 페이지에 실제로 있는지 (리다이렉트 안 됐는지)
			if (!page.url().includes(path)) {
				failures.push(`${name} (${path}): /login으로 리다이렉트됨`);
				continue;
			}

			// ErrorBoundary fallback 감지
			const fallback = await page.$('text=문제가 발생했습니다');
			if (fallback) {
				failures.push(`${name} (${path}): ErrorBoundary fallback 렌더링됨`);
			}

			if (crashes.length > 0) {
				failures.push(`${name} (${path}): pageerror - ${crashes.join(' | ')}`);
			}

			if (consoleErrors.length > 0) {
				failures.push(`${name} (${path}): console.error - ${consoleErrors.join(' | ')}`);
			}
		} finally {
			page.removeListener('pageerror', onPageError);
			page.removeListener('console', onConsole);
		}
	}

	expect(failures, `인증 페이지 실패:\n${failures.join('\n')}`).toEqual([]);
});

// ── 404 ──

test('404 - 크래시 없음', async ({ page }) => {
	await visitAndVerify(page, '/this-does-not-exist');
});
