import { test, expect, Page } from '@playwright/test';

// 토너먼트 멤버 드롭다운 풀 — 개최일(heldAt) 기준 API 분기 검증.
// heldAt < 오늘(날짜 단위) → all-members (과거 기록 소급 입력, 탈퇴자 포함)
// heldAt >= 오늘 / null   → active-members (현역만)

const FAKE_PUUID = 'test-puuid-1234';
const GROUP_ID = 1;
const TOURNAMENT_ID = 777;

const FAKE_GROUP = {
	groupId: GROUP_ID,
	groupName: 'TestGroup',
	isAdmin: true
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

const FAKE_GROUP_LIST = {
	result: [FAKE_GROUP]
};

const FAKE_MEMBERS = {
	result: [
		{ puuid: 'puuid-alice', name: 'Alice', profileIconId: 1234, rankTier: 'GOLD', rating: 1500 },
		{ puuid: 'puuid-bob', name: 'Bob', profileIconId: 5678, rankTier: 'SILVER', rating: 1400 }
	]
};

function fakeDetail(heldAt: string | null) {
	return {
		result: 'ok',
		tournament: {
			id: TOURNAMENT_ID,
			groupId: GROUP_ID,
			name: '분기 테스트 토너먼트',
			status: 'preparing',
			type: 'normal',
			predictionMode: 'bracket',
			defaultBestOf: 3,
			finalBestOf: 5,
			trophyType: null,
			heldAt,
			championTeamId: null,
			bracketSize: null,
			teamCount: 0,
			allowSingleTeam: false,
			auctionConfig: null,
			currentAuctionPuuid: null,
			currentAuctionDeadline: null
		},
		teams: [],
		matches: [],
		scrims: [],
		roundLabels: {},
		predictionsLocked: false,
		leaderboard: [],
		currentCandidate: null
	};
}

// 상세 진입 → "팀 등록" 클릭 → TeamFormDialog가 부르는 멤버 풀 endpoint 수집
async function collectMemberPoolCalls(page: Page, heldAt: string | null): Promise<string[]> {
	const memberPoolCalls: string[] = [];

	const json = (body: unknown) => ({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify(body)
	});

	await page.route(/\/api\/.*/, async route => {
		const url = route.request().url();
		if (url.includes('/api/auth/me')) return route.fulfill(json(FAKE_AUTH_ME));
		if (url.includes('/api/user/getGroupList')) return route.fulfill(json(FAKE_GROUP_LIST));
		if (url.includes(`/api/tournament/${TOURNAMENT_ID}`)) return route.fulfill(json(fakeDetail(heldAt)));
		if (url.includes(`/api/group/${GROUP_ID}/all-members`)) {
			memberPoolCalls.push('all-members');
			return route.fulfill(json(FAKE_MEMBERS));
		}
		if (url.includes(`/api/group/${GROUP_ID}/active-members`)) {
			memberPoolCalls.push('active-members');
			return route.fulfill(json(FAKE_MEMBERS));
		}
		return route.fulfill(json({ result: null }));
	});

	await page.route('https://ddragon.leagueoflegends.com/**', async route => {
		const url = route.request().url();
		if (url.endsWith('/api/versions.json')) {
			return route.fulfill(json(['14.10.1']));
		}
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

	await page.goto(`/tournament/${TOURNAMENT_ID}`, { waitUntil: 'domcontentloaded' });
	try {
		await page.waitForSelector('#fuse-splash-screen', { state: 'hidden', timeout: 15000 });
	} catch {
		/* no splash */
	}

	const teamCreateBtn = page.getByRole('button', { name: '팀 등록' });
	await expect(teamCreateBtn).toBeVisible({ timeout: 10000 });

	const memberPoolRequest = page.waitForRequest(/\/(all-members|active-members)/, { timeout: 10000 });
	await teamCreateBtn.click();
	await memberPoolRequest;

	// 드롭다운 옵션 소스가 정상 렌더되는지 (다이얼로그 오픈 확인)
	await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

	return memberPoolCalls;
}

const DAY_MS = 24 * 60 * 60 * 1000;

test('[토너먼트] 개최일 과거 → 팀원 선택 풀은 all-members (탈퇴자 포함 전원)', async ({ page }) => {
	const yesterday = new Date(Date.now() - DAY_MS).toISOString();
	const calls = await collectMemberPoolCalls(page, yesterday);
	expect(calls).toContain('all-members');
	expect(calls).not.toContain('active-members');
});

test('[토너먼트] 개최일 오늘/미래 → 팀원 선택 풀은 active-members (현역만)', async ({ page }) => {
	const tomorrow = new Date(Date.now() + DAY_MS).toISOString();
	const calls = await collectMemberPoolCalls(page, tomorrow);
	expect(calls).toContain('active-members');
	expect(calls).not.toContain('all-members');
});

test('[토너먼트] 개최일 null(레거시) → 예정 토너먼트로 간주, active-members', async ({ page }) => {
	const calls = await collectMemberPoolCalls(page, null);
	expect(calls).toContain('active-members');
	expect(calls).not.toContain('all-members');
});
