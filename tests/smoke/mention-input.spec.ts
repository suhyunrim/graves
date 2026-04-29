import { test, expect } from '@playwright/test';

const IGNORED = [
	'net::ERR_',
	'Failed to load resource',
	'favicon.ico',
	'Download the React DevTools',
	'API 호출 실패',
	'AxiosError',
	'401',
	'403',
	'ResizeObserver loop',
	'Functions that are interpolated in css calls',
	'non-boolean attribute',
	'nth-child'
];

const FAKE_DDRAGON_VERSION = '14.10.1';

const FAKE_PUUID = 'test-puuid-1234';
const FAKE_DISCORD_ID = '999000111';
const GROUP_ID = 1;

const FAKE_GROUP = {
	groupId: GROUP_ID,
	groupName: 'TestGroup',
	isAdmin: false
};

const FAKE_AUTH_ME = {
	result: {
		discordId: FAKE_DISCORD_ID,
		username: 'testuser',
		globalName: 'Test User',
		avatar: null,
		puuid: FAKE_PUUID,
		groups: [FAKE_GROUP]
	}
};

const FAKE_GROUP_LIST = {
	result: [FAKE_GROUP]
};

const FAKE_GET_INFO = {
	result: {
		userInfo: {
			defaultRating: 500,
			additionalRating: 0,
			win: 0,
			lose: 0,
			primaryPuuid: null
		},
		summonerInfo: {
			name: 'TestUser#KR1',
			profileIconId: 1,
			summonerLevel: 1,
			rankTier: 'UNRANKED',
			rankWin: 0,
			rankLose: 0
		},
		detailedStats: {
			topTeammates: [],
			topOpponents: [],
			bestTeammates: [],
			recentGames: 0,
			recentWins: 0,
			recentWinRate: 0,
			maxWinStreak: 0,
			maxLoseStreak: 0,
			bestOpponents: [],
			worstOpponents: [],
			ratingHistory: []
		},
		honorStats: null,
		subAccount: null,
		statusMessage: null
	}
};

const FAKE_MEMBERS = {
	result: [
		{ puuid: 'puuid-alice', name: 'Alice', profileIconId: 1234 },
		{ puuid: 'puuid-bob', name: 'Bob', profileIconId: 5678 }
	]
};

test('[멘션] Discord 로그인 + 방명록 탭 → MentionsInput 마운트 시 크래시 없음', async ({ page }) => {
	const crashes: string[] = [];
	const consoleErrors: string[] = [];

	page.on('pageerror', err => crashes.push(err.message));
	page.on('console', msg => {
		if (msg.type() !== 'error') return;
		const text = msg.text();
		if (!IGNORED.some(p => text.includes(p))) consoleErrors.push(text);
	});

	// 백엔드 호출 모킹 — 정규식으로 모든 /api/* 경로 잡고 패턴별 분기
	const json = (body: unknown) => ({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify(body)
	});

	await page.route(/\/api\/.*/, async route => {
		const url = route.request().url();
		if (url.includes('/api/auth/me')) return route.fulfill(json(FAKE_AUTH_ME));
		if (url.includes('/api/user/getGroupList')) return route.fulfill(json(FAKE_GROUP_LIST));
		if (url.includes('/api/user/getInfo')) return route.fulfill(json(FAKE_GET_INFO));
		if (url.includes(`/api/group/${GROUP_ID}/members`)) return route.fulfill(json(FAKE_MEMBERS));
		if (url.includes(`/api/profile/${GROUP_ID}/${FAKE_PUUID}/comments`)) {
			return route.fulfill(json({
				result: [
					{
						id: 100,
						parentId: null,
						author: {
							discordId: '111',
							name: 'Alice',
							puuid: 'puuid-alice',
							profileIconId: 1234
						},
						content: 'hello world',
						isSecret: false,
						isDeleted: false,
						likeCount: 0,
						likedByMe: false,
						createdAt: '2026-04-29T10:00:00.000Z',
						replies: []
					}
				]
			}));
		}
		if (url.includes(`/api/profile/${GROUP_ID}/${FAKE_PUUID}/visit`)) return route.fulfill(json({ result: { counted: false } }));
		if (url.includes(`/api/profile/${GROUP_ID}/${FAKE_PUUID}/stats`)) return route.fulfill(json({ result: { today: 0, total: 0 } }));
		if (url.includes('/api/notifications/unread-count')) return route.fulfill(json({ result: { count: 0 } }));
		if (url.includes('/api/notifications')) return route.fulfill(json({ result: [] }));
		// 그 외는 빈 result로 응답해서 에러 인터셉터 안 타게
		return route.fulfill(json({ result: null }));
	});

	// ddragon 버전 API 모킹 — Playwright route는 역순 매칭이므로 /api/.* 라우트보다 나중에 등록해야
	// ddragon의 api/versions.json이 이 핸들러로 먼저 들어옴. getLatesetRiotDataVersion이 응답의 첫 요소를
	// 꺼내므로 배열 응답이 필요.
	await page.route('https://ddragon.leagueoflegends.com/**', async route => {
		const url = route.request().url();
		if (url.endsWith('/api/versions.json')) {
			return route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify([FAKE_DDRAGON_VERSION])
			});
		}
		// profileicon 등 정적 자산은 1x1 투명 PNG로 응답 — 잘못된 PNG면 MUI Avatar가 fallback으로 전환되며
		// img 태그 자체가 사라져 alt 셀렉터로 잡을 수 없게 됨.
		return route.fulfill({
			status: 200,
			contentType: 'image/png',
			body: Buffer.from(
				'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
				'base64'
			)
		});
	});

	// localStorage에 가짜 Discord JWT + puuid 주입
	await page.addInitScript(({ token, puuid }) => {
		localStorage.setItem('camille_discord_token', token);
		localStorage.setItem('camille_riot_puuid', puuid);
	}, { token: 'fake.jwt.token', puuid: FAKE_PUUID });

	await page.goto('/myinfo', { waitUntil: 'domcontentloaded' });
	try {
		await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 15000 });
	} catch {
		/* no splash */
	}

	const guestbookTab = page.getByRole('tab', { name: '방명록' });
	await expect(guestbookTab).toBeVisible({ timeout: 10000 });
	await guestbookTab.click();

	// 기존 댓글의 작성자 닉네임 + 아바타가 렌더링되어야 함
	await expect(page.getByText('hello world')).toBeVisible({ timeout: 10000 });
	await expect(page.getByText('Alice', { exact: true }).first()).toBeVisible();
	const avatarImg = page.locator('img[alt="Alice"]').first();
	await expect(avatarImg).toBeVisible();
	const avatarSrc = await avatarImg.getAttribute('src');
	expect(avatarSrc).toContain('ddragon.leagueoflegends.com');
	expect(avatarSrc).toContain('/profileicon/1234.png');

	const commentBox = page.getByText('hello world').locator('xpath=ancestor::*[1]/ancestor::*[1]');
	await commentBox.screenshot({ path: 'test-results/comment-avatar.png' });

	// MentionsInput의 textarea가 떠야 함 (Discord 로그인 상태에서만)
	const textarea = page.locator('textarea').first();
	await expect(textarea).toBeVisible({ timeout: 10000 });

	// @ 입력 → 드롭다운 표시
	await textarea.click();
	await textarea.type('@al');
	const suggestion = page.getByText('@Alice', { exact: true });
	await expect(suggestion).toBeVisible({ timeout: 5000 });

	// 드롭다운 항목 클릭 → @Alice로 표시되어야 함 (puuid 노출 X)
	await suggestion.click();
	await page.waitForTimeout(300);

	const text = await textarea.inputValue();
	expect(text, '입력창에 @닉네임 표시되어야 함').toContain('@Alice');
	expect(text, '입력창에 puuid가 그대로 노출되면 안 됨').not.toContain('puuid-alice');
	expect(text.trim(), '쿼리 잔여물 없이 정확히 @Alice + 공백').toBe('@Alice');

	// 평문 추가 입력 후 textarea 값에 잔여물 없는지 (정렬 깨짐 회귀 방지)
	await textarea.type('hello there');
	const finalText = await textarea.inputValue();
	expect(finalText).toBe('@Alice hello there');

	expect(crashes, `pageerror: ${crashes.join(' | ')}`).toEqual([]);
	expect(consoleErrors, `console.error: ${consoleErrors.join(' | ')}`).toEqual([]);
});
