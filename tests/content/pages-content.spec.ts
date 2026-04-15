/**
 * 페이지별 컨텐츠 검증 테스트
 * 단순 크래시 없음이 아니라 각 페이지의 핵심 UI 요소가 존재하는지 확인.
 * riotId 로그인 후 인증 페이지를 순회하고, 공개 페이지도 검증한다.
 *
 * 주의: 사이드바 nav에도 메뉴 텍스트가 있으므로 .first() 사용 필수.
 */
import { test, expect, Page } from '@playwright/test';

interface PageCheck {
	name: string;
	path: string;
	checks: Array<{
		description: string;
		verify: (page: Page) => Promise<void>;
	}>;
}

const publicPages: PageCheck[] = [
	{
		name: '챌린지',
		path: '/challenge',
		checks: [
			{
				description: '"Challenge" 텍스트',
				verify: async (page) => {
					await expect(page.getByText('Challenge').first()).toBeVisible({ timeout: 10000 });
				}
			}
		]
	},
	{
		name: '밸런스 리포트',
		path: '/balance-report',
		checks: [
			{
				description: '"Balancing Report" 텍스트',
				verify: async (page) => {
					await expect(page.getByText('Balancing Report').first()).toBeVisible({ timeout: 10000 });
				}
			},
			{
				description: 'canvas (차트) 또는 "데이터가 없습니다" 메시지',
				verify: async (page) => {
					// 차트 데이터 로딩이 필요하므로 networkidle 대기
					await page.waitForLoadState('networkidle');
					// 데이터가 있으면 canvas, 없으면 안내 메시지
					const canvas = page.locator('canvas').first();
					const noData = page.getByText('데이터가 없습니다').first();
					const hasCanvas = await canvas.isVisible().catch(() => false);
					const hasNoData = await noData.isVisible().catch(() => false);
					expect(hasCanvas || hasNoData, '차트 canvas 또는 "데이터가 없습니다" 메시지가 있어야 함').toBeTruthy();
				}
			}
		]
	},
	{
		name: '릴리즈 노트',
		path: '/release-notes',
		checks: [
			{
				description: '"Release Notes" 텍스트',
				verify: async (page) => {
					await expect(page.getByText('Release Notes').first()).toBeVisible({ timeout: 10000 });
				}
			}
		]
	}
];

const authPages: PageCheck[] = [
	{
		name: '대시보드',
		path: '/dashboard',
		checks: [
			{
				description: '"Dashboard" 텍스트',
				verify: async (page) => {
					await expect(page.getByText('Dashboard').first()).toBeVisible({ timeout: 10000 });
				}
			},
			{
				description: '월 네비게이션 버튼',
				verify: async (page) => {
					// 이전/다음 월 네비게이션: 버튼 또는 SVG 아이콘
					const navButtons = page.locator('button').filter({ hasText: /[<>]|chevron|arrow|navigate/i });
					const iconButtons = page.locator('[class*="navigate"], [aria-label*="이전"], [aria-label*="다음"], svg[data-testid*="Navigate"], svg[data-testid*="Arrow"], svg[data-testid*="Chevron"]');
					const count = await navButtons.count() + await iconButtons.count();
					expect(count, '월 네비게이션 버튼이 존재해야 함').toBeGreaterThan(0);
				}
			}
		]
	},
	{
		name: '랭킹',
		path: '/ranking',
		checks: [
			{
				description: '"Ranking" 텍스트',
				verify: async (page) => {
					await expect(page.getByText('Ranking').first()).toBeVisible({ timeout: 10000 });
				}
			},
			{
				description: 'table 존재',
				verify: async (page) => {
					await expect(page.locator('table').first()).toBeVisible({ timeout: 15000 });
				}
			},
			{
				description: 'table tbody tr 1개 이상',
				verify: async (page) => {
					const rows = page.locator('table').first().locator('tbody tr');
					await expect(rows.first()).toBeVisible({ timeout: 10000 });
					const count = await rows.count();
					expect(count, '랭킹 테이블에 데이터 행이 있어야 함').toBeGreaterThan(0);
				}
			}
		]
	},
	{
		name: '내 정보',
		path: '/myinfo',
		checks: [
			{
				description: '"MyInfo" 텍스트',
				verify: async (page) => {
					await expect(page.getByText('MyInfo').first()).toBeVisible({ timeout: 10000 });
				}
			},
			{
				description: '유저 닉네임 (ZeroBoom) 존재',
				verify: async (page) => {
					await expect(page.getByText('ZeroBoom').first()).toBeVisible({ timeout: 10000 });
				}
			}
		]
	},
	{
		name: '매치 히스토리',
		path: '/match-history',
		checks: [
			{
				description: '"Match History" 텍스트',
				verify: async (page) => {
					await expect(page.getByText('Match History').first()).toBeVisible({ timeout: 10000 });
				}
			},
			{
				description: '매치 목록 존재',
				verify: async (page) => {
					await page.waitForLoadState('networkidle');
					// 테이블, 카드, 리스트 아이템, div row 등 다양한 형태
					const table = page.locator('table');
					const cards = page.locator('[class*="match"], [class*="card"], [class*="MuiCard"], [class*="MuiPaper"]');
					const listItems = page.locator('[class*="MuiList"] [class*="MuiListItem"], [role="listitem"]');
					const tableCount = await table.count();
					const cardCount = await cards.count();
					const listCount = await listItems.count();
					expect(tableCount + cardCount + listCount, '매치 히스토리 목록이 있어야 함').toBeGreaterThan(0);
				}
			}
		]
	},
	{
		name: '명예 랭킹',
		path: '/honor-ranking',
		checks: [
			{
				description: '"Honor" 텍스트',
				verify: async (page) => {
					await expect(page.getByText('Honor').first()).toBeVisible({ timeout: 10000 });
				}
			},
			{
				description: 'table 존재',
				verify: async (page) => {
					await expect(page.locator('table').first()).toBeVisible({ timeout: 15000 });
				}
			}
		]
	},
	{
		name: '업적',
		path: '/achievement',
		checks: [
			{
				description: '"업적" 텍스트',
				verify: async (page) => {
					await expect(page.getByText('업적').first()).toBeVisible({ timeout: 10000 });
				}
			},
			{
				description: '업적 항목 존재',
				verify: async (page) => {
					const items = page.locator('[class*="achievement"], [class*="MuiCard"], [class*="MuiPaper"]');
					await expect(items.first()).toBeVisible({ timeout: 10000 });
				}
			}
		]
	}
];

// ── 공개 페이지 컨텐츠 검증 ──

for (const pageInfo of publicPages) {
	test(`[공개] ${pageInfo.name} - 핵심 UI 요소 확인`, async ({ page }) => {
		await page.goto(pageInfo.path, { waitUntil: 'domcontentloaded' });
		try {
			await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 15000 });
		} catch { /* splash 없는 페이지도 있음 */ }

		const failures: string[] = [];
		for (const check of pageInfo.checks) {
			try {
				await check.verify(page);
			} catch (err) {
				failures.push(`${check.description}: ${(err as Error).message}`);
			}
		}
		expect(failures, `[${pageInfo.name}] 실패 항목:\n${failures.join('\n')}`).toEqual([]);
	});
}

// ── 인증 페이지 컨텐츠 검증 (riotId 로그인 후 순회) ──

test('[인증] riotId 로그인 -> 인증 페이지 핵심 UI 요소 순회', async ({ page }) => {
	// 1) riotId 로그인
	await page.goto('/login');
	await page.waitForSelector('input[name="riotId"]', { state: 'visible', timeout: 20000 });
	await page.fill('input[name="riotId"]', 'ZeroBoom#KR1');
	await page.click('button[type="submit"]');
	await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });

	// 2) 각 인증 페이지 순회하며 핵심 UI 검증
	const pageFailures: string[] = [];

	for (const pageInfo of authPages) {
		await page.goto(pageInfo.path, { waitUntil: 'domcontentloaded' });
		try {
			await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 15000 });
		} catch { /* ignore */ }

		// 리다이렉트 확인
		if (!page.url().includes(pageInfo.path)) {
			pageFailures.push(`${pageInfo.name} (${pageInfo.path}): /login으로 리다이렉트됨`);
			continue;
		}

		for (const check of pageInfo.checks) {
			try {
				await check.verify(page);
			} catch (err) {
				pageFailures.push(`${pageInfo.name} (${pageInfo.path}) - ${check.description}: ${(err as Error).message}`);
			}
		}
	}

	expect(
		pageFailures,
		`인증 페이지 컨텐츠 실패:\n${pageFailures.join('\n')}`
	).toEqual([]);
});
