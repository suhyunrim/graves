import { test, expect, Page } from '@playwright/test';

// 대시보드 유저 검색(자동완성) + 즐겨찾기(최대 10명) 스모크.
// - 검색: active-members 클라이언트 필터링, 선택 시 /userinfo/:puuid 이동
// - 즐겨찾기: 서버 저장 mock(상태 유지)으로 추가/제거/400 토스트 검증

const FAKE_PUUID = 'test-puuid-1234';
const GROUP_ID = 1;

const FAKE_GROUP = {
	groupId: GROUP_ID,
	groupName: 'TestGroup',
	isAdmin: false
};

const FAKE_AUTH_ME = {
	result: {
		discordId: '999000111',
		username: 'testuser',
		globalName: 'Test User',
		avatar: null,
		puuid: FAKE_PUUID,
		groups: [FAKE_GROUP]
	}
};

const FAKE_MEMBERS = {
	result: [
		{ puuid: 'puuid-alice', name: 'Alice', profileIconId: 1234, rankTier: 'GOLD II', rating: 520 },
		{ puuid: 'puuid-bob', name: 'Bob', profileIconId: 5678, rankTier: 'SILVER I', rating: 430 },
		{ puuid: 'puuid-charlie', name: 'Charlie', profileIconId: 9012, rankTier: 'IRON IV', rating: 210 }
	]
};

const FAKE_GET_INFO = {
	result: {
		userInfo: { defaultRating: 500, additionalRating: 0, win: 0, lose: 0, primaryPuuid: null },
		summonerInfo: {
			name: 'Alice#KR1',
			profileIconId: 1234,
			summonerLevel: 100,
			rankTier: 'GOLD II',
			rankWin: 0,
			rankLose: 0
		},
		detailedStats: {
			topTeammates: [],
			topOpponents: [],
			bestTeammates: [],
			recentGames: 10,
			recentWins: 6,
			recentWinRate: 60,
			// 시간순 — 마지막 원소가 가장 최근. 화면에는 reverse되어 최신이 왼쪽.
			recentResults: [true, false, true, false, true, true, false, true, true, false],
			maxWinStreak: 4,
			maxLoseStreak: 3,
			bestOpponents: [],
			worstOpponents: [],
			ratingHistory: []
		},
		honorStats: null,
		subAccount: null,
		statusMessage: null
	}
};

const FAKE_DASHBOARD = { month: '2026-07', totalMatches: 0 };

type FavoriteRow = { puuid: string; name: string; profileIconId: number; rankTier: string; rating: number; leftGuildAt: string | null };

// 즐겨찾기 서버 mock — favState를 테스트 안에서 공유해 추가/제거가 목록 GET에 반영되게 한다.
async function setupRoutes(page: Page, favState: FavoriteRow[], opts: { rejectAdd?: string } = {}) {
	const json = (body: unknown, status = 200) => ({
		status,
		contentType: 'application/json',
		body: JSON.stringify(body)
	});

	await page.route(/\/api\/.*/, async route => {
		const req = route.request();
		const url = req.url();
		if (url.includes('/api/auth/me')) return route.fulfill(json(FAKE_AUTH_ME));
		if (url.includes('/api/user/getGroupList')) return route.fulfill(json({ result: [FAKE_GROUP] }));
		if (url.includes('/api/user/getInfo')) return route.fulfill(json(FAKE_GET_INFO));
		if (url.includes(`/api/dashboard/${GROUP_ID}`)) return route.fulfill(json(FAKE_DASHBOARD));
		if (url.includes(`/api/group/${GROUP_ID}/active-members`)) return route.fulfill(json(FAKE_MEMBERS));
		if (url.includes('/api/favorites')) {
			if (req.method() === 'GET') return route.fulfill(json({ result: favState }));
			if (req.method() === 'POST') {
				if (opts.rejectAdd) return route.fulfill(json({ result: opts.rejectAdd }, 400));
				const { puuid } = req.postDataJSON();
				const member = FAKE_MEMBERS.result.find(m => m.puuid === puuid);
				if (member) favState.push({ ...member, leftGuildAt: null });
				return route.fulfill(json({ result: 'ok' }));
			}
			if (req.method() === 'DELETE') {
				const puuid = url.split('/api/favorites/')[1].split('?')[0];
				const idx = favState.findIndex(f => f.puuid === puuid);
				if (idx >= 0) favState.splice(idx, 1);
				return route.fulfill(json({ result: 'ok' }));
			}
		}
		return route.fulfill(json({ result: null }));
	});

	await page.route('https://ddragon.leagueoflegends.com/**', async route => {
		const url = route.request().url();
		if (url.endsWith('/api/versions.json')) return route.fulfill(json(['14.10.1']));
		return route.fulfill({
			status: 200,
			contentType: 'image/png',
			body: Buffer.from(
				'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
				'base64'
			)
		});
	});

	await page.addInitScript(({ token, puuid }) => {
		localStorage.setItem('camille_discord_token', token);
		localStorage.setItem('camille_riot_puuid', puuid);
	}, { token: 'fake.jwt.token', puuid: FAKE_PUUID });
}

async function gotoDashboard(page: Page) {
	await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
	try {
		await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 15000 });
	} catch {
		/* no splash */
	}
	await expect(page.getByPlaceholder('유저 검색')).toBeVisible({ timeout: 15000 });
}

test('[대시보드] 검색 자동완성 — 부분 문자열 매칭 + 선택 시 프로필 이동', async ({ page }) => {
	await setupRoutes(page, []);
	await gotoDashboard(page);

	const search = page.getByPlaceholder('유저 검색');
	await search.click();
	await search.fill('al');

	// 부분 문자열/대소문자 무시 매칭 — Alice만 떠야 함
	await expect(page.getByRole('option', { name: /Alice/ })).toBeVisible({ timeout: 5000 });
	await expect(page.getByRole('option', { name: /Bob/ })).toHaveCount(0);

	await page.screenshot({ path: 'test-results/dashboard-search-dropdown.png' });

	await page.getByRole('option', { name: /Alice/ }).click();
	await page.waitForURL(/\/userinfo\/puuid-alice/, { timeout: 10000 });

	// 타인 프로필 헤더의 별(★) 토글 — 클릭 시 즐겨찾기 추가
	const profileStar = page.getByLabel('즐겨찾기 토글');
	await expect(profileStar).toBeVisible({ timeout: 10000 });
	await page.screenshot({ path: 'test-results/profile-favorite-star.png' });
	await profileStar.click();
	await expect(page.getByText('즐겨찾기에 추가했습니다.')).toBeVisible({ timeout: 5000 });

	// 최근 10경기 OX 시퀀스 — recentResults를 reverse해 최신이 왼쪽
	const oxRow = page.getByLabel('최근 10경기 승패 (최신순)');
	await expect(oxRow).toBeVisible({ timeout: 10000 });
	await expect(oxRow).toHaveText('XOOXOOXOXO');
});

test('[대시보드] 즐겨찾기 추가/제거 — 목록 즉시 반영', async ({ page }) => {
	const favState: FavoriteRow[] = [];
	await setupRoutes(page, favState);
	await gotoDashboard(page);

	// 빈 즐겨찾기 안내 노출
	await expect(page.getByText('자주 보는 유저를 등록해 보세요', { exact: false })).toBeVisible();

	// 검색 드롭다운에서 별 클릭 → 추가
	const search = page.getByPlaceholder('유저 검색');
	await search.click();
	await search.fill('bo');
	const bobOption = page.getByRole('option', { name: /Bob/ });
	await expect(bobOption).toBeVisible({ timeout: 5000 });
	await bobOption.getByLabel('즐겨찾기 토글').click();

	await expect(page.getByText('즐겨찾기에 추가했습니다.')).toBeVisible({ timeout: 5000 });

	// 즐겨찾기 섹션에 Bob 카드(프로필 링크) 등장 — 드롭다운 닫고 확인
	await page.keyboard.press('Escape');
	await expect(page.locator('a[href="/userinfo/puuid-bob"]')).toBeVisible({ timeout: 5000 });

	await page.screenshot({ path: 'test-results/dashboard-favorites-added.png' });

	// 새로고침 후에도 유지 (서버 저장 mock)
	await page.reload({ waitUntil: 'domcontentloaded' });
	await expect(page.getByPlaceholder('유저 검색')).toBeVisible({ timeout: 15000 });
	await expect(page.locator('a[href="/userinfo/puuid-bob"]')).toBeVisible({ timeout: 5000 });

	// 카드의 별 클릭 → 제거
	await page.getByLabel('즐겨찾기 제거').click();
	await expect(page.getByText('즐겨찾기에서 제거했습니다.')).toBeVisible({ timeout: 5000 });
	await expect(page.getByText('자주 보는 유저를 등록해 보세요', { exact: false })).toBeVisible({ timeout: 5000 });
});

test('[대시보드] 즐겨찾기 초과 시 서버 400 메시지 토스트', async ({ page }) => {
	const LIMIT_MSG = '즐겨찾기는 최대 10명까지 등록할 수 있습니다.';
	await setupRoutes(page, [], { rejectAdd: LIMIT_MSG });
	await gotoDashboard(page);

	const search = page.getByPlaceholder('유저 검색');
	await search.click();
	await search.fill('char');
	const option = page.getByRole('option', { name: /Charlie/ });
	await expect(option).toBeVisible({ timeout: 5000 });
	await option.getByLabel('즐겨찾기 토글').click();

	await expect(page.getByText(LIMIT_MSG)).toBeVisible({ timeout: 5000 });
});
