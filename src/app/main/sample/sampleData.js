import { getSampleData, SAMPLE_MY_PUUID } from './sampleStorage';

// ============================================================
// 샘플 플레이어 풀 (36명)
// ============================================================
const PLAYERS = [
	{ name: '페이커', puuid: 'sample-puuid-01', riotId: 'Faker#KR1' },
	{ name: '쵸비', puuid: 'sample-puuid-02', riotId: 'Chovy#KR1' },
	{ name: '제우스', puuid: 'sample-puuid-03', riotId: 'Zeus#KR1' },
	{ name: '구마유시', puuid: 'sample-puuid-04', riotId: 'Gumayusi#KR1' },
	{ name: '케리아', puuid: 'sample-puuid-05', riotId: 'Keria#KR1' },
	{ name: '캐니언', puuid: 'sample-puuid-06', riotId: 'Canyon#KR1' },
	{ name: '디플러스', puuid: 'sample-puuid-07', riotId: 'Dplus#KR1' },
	{ name: '바이퍼', puuid: 'sample-puuid-08', riotId: 'Viper#KR1' },
	{ name: '도란', puuid: 'sample-puuid-09', riotId: 'Doran#KR1' },
	{ name: '피넛', puuid: 'sample-puuid-10', riotId: 'Peanut#KR1' },
	{ name: '루키', puuid: 'sample-puuid-11', riotId: 'Rookie#KR1' },
	{ name: '오너', puuid: 'sample-puuid-12', riotId: 'Oner#KR1' },
	{ name: '쇼메이커', puuid: 'sample-puuid-13', riotId: 'ShowMaker#KR1' },
	{ name: '고스트', puuid: 'sample-puuid-14', riotId: 'Ghost#KR1' },
	{ name: '베릴', puuid: 'sample-puuid-15', riotId: 'BeryL#KR1' },
	{ name: '키아나', puuid: 'sample-puuid-16', riotId: 'Kiana#KR1' },
	{ name: '에이밍', puuid: 'sample-puuid-17', riotId: 'Aiming#KR1' },
	{ name: '클리드', puuid: 'sample-puuid-18', riotId: 'Clid#KR1' },
	{ name: '리헨즈', puuid: 'sample-puuid-19', riotId: 'Lehends#KR1' },
	{ name: '데프트', puuid: 'sample-puuid-20', riotId: 'Deft#KR1' },
	{ name: '탑솔', puuid: 'sample-puuid-21', riotId: 'Topsol#KR1' },
	{ name: '모건', puuid: 'sample-puuid-22', riotId: 'Morgan#KR1' },
	{ name: '프린스', puuid: 'sample-puuid-23', riotId: 'Prince#KR1' },
	{ name: '클로저', puuid: 'sample-puuid-24', riotId: 'Closer#KR1' },
	{ name: '비디디', puuid: 'sample-puuid-25', riotId: 'BDD#KR1' },
	{ name: '라이프', puuid: 'sample-puuid-26', riotId: 'Life#KR1' },
	{ name: '헤나', puuid: 'sample-puuid-27', riotId: 'Hena#KR1' },
	{ name: '플레이', puuid: 'sample-puuid-28', riotId: 'Play#KR1' },
	{ name: '브로', puuid: 'sample-puuid-29', riotId: 'Bro#KR1' },
	{ name: '듀스', puuid: 'sample-puuid-30', riotId: 'Deuce#KR1' },
	{ name: '켈린', puuid: 'sample-puuid-31', riotId: 'Kellin#KR1' },
	{ name: '쿠키', puuid: 'sample-puuid-32', riotId: 'Cookie#KR1' },
	{ name: '테디', puuid: 'sample-puuid-33', riotId: 'Teddy#KR1' },
	{ name: '엘림', puuid: 'sample-puuid-34', riotId: 'Ellim#KR1' },
	{ name: '큐베', puuid: 'sample-puuid-35', riotId: 'Kube#KR1' },
	{ name: '윌', puuid: 'sample-puuid-36', riotId: 'Will#KR1' }
];

const MY_PUUID = SAMPLE_MY_PUUID;

// ============================================================
// 유틸리티
// ============================================================
const TIER_BASES = [
	['CHALLENGER', 1150], ['GRANDMASTER', 1000], ['MASTER', 900],
	['DIAMOND', 800], ['EMERALD', 700], ['PLATINUM', 600],
	['GOLD', 500], ['SILVER', 400], ['BRONZE', 300], ['IRON', 200]
];
const DIVISIONS = ['IV', 'III', 'II', 'I'];

function getTierStringFromRating(rating) {
	for (const [name, base] of TIER_BASES) {
		if (rating >= base) {
			if (name === 'MASTER' || name === 'GRANDMASTER' || name === 'CHALLENGER') return name;
			const divIdx = Math.min(Math.floor((rating - base) / 25), 3);
			return `${name} ${DIVISIONS[divIdx]}`;
		}
	}
	return 'IRON IV';
}

function winRate(w, l) {
	if (w + l === 0) return 0;
	return Math.round((w / (w + l)) * 1000) / 10;
}

// ============================================================
// 랭킹 데이터 (36명)
// ============================================================
const RANKING_RATINGS = [
	1200, 1100, 1020, 950, 920, 880, 850, 830, 810, 780,
	750, 720, 700, 680, 660, 640, 620, 600, 580, 560,
	540, 520, 505, 490, 470, 450, 430, 410, 380, 350,
	330, 310, 290, 270, 250, 220
];

const RANKING_WINS = [
	89, 76, 68, 62, 58, 55, 52, 50, 48, 46,
	44, 42, 40, 38, 37, 36, 35, 34, 33, 32,
	31, 30, 29, 28, 27, 26, 25, 24, 22, 20,
	18, 16, 14, 12, 10, 8
];

const RANKING_LOSSES = [
	34, 42, 40, 38, 42, 45, 43, 44, 46, 44,
	46, 48, 45, 47, 43, 44, 40, 41, 42, 43,
	39, 40, 41, 42, 43, 44, 45, 46, 38, 30,
	32, 34, 36, 38, 30, 22
];

function getDefaultRankingData() {
	return PLAYERS.map((p, i) => ({
		name: p.name,
		puuid: p.puuid,
		riotId: p.riotId,
		rating: RANKING_RATINGS[i],
		win: RANKING_WINS[i],
		lose: RANKING_LOSSES[i],
		winRate: winRate(RANKING_WINS[i], RANKING_LOSSES[i]),
		ranking: i + 1
	}));
}

export function getSampleRankingData() {
	return getSampleData('ranking') || getDefaultRankingData();
}

// ============================================================
// 대시보드 데이터
// ============================================================
function getDefaultDashboardData(month) {
	return {
		month: month || '2026-04',
		totalMatches: 387,
		mostGames: { name: '페이커', games: 123, wins: 89, losses: 34, winRate: 72.4 },
		bestWinRate: { name: '쵸비', minGames: 5, winRate: 78.6, games: 42, wins: 33, losses: 9 },
		longestWinStreak: { name: '제우스', streak: 12 },
		bestDuo: { name1: '구마유시', name2: '케리아', minGames: 3, winRate: 78.9, games: 38, wins: 30, losses: 8 },
		mostRivalry: { name1: '캐니언', name2: '오너', games: 54, player1Wins: 29, player2Wins: 25 },
		topNewcomer: { name: '윌', games: 30, firstMatchDate: '2026-03-01' },
		topRatingRiser: { name: '바이퍼', startRating: 450, endRating: 830, games: 95 },
		nightOwl: { name: '도란', games: 75, lateNightGames: 48, lateNightRate: 64 },
		darkHorse: { name: '피넛', games: 90, darkHorseGames: 28, darkHorseWins: 20, darkHorseWinRate: 71 },
		honorKing: { name: '페이커', votes: 67, title: { emoji: '👑', title: '내전의 신' } }
	};
}

export function getSampleDashboardData(month) {
	return getSampleData('dashboard') || getDefaultDashboardData(month);
}

// ============================================================
// 매치 히스토리 데이터 (30경기)
// ============================================================
function makeMatch(index, dayOffset) {
	const gameId = `sample-match-${String(index + 1).padStart(3, '0')}`;
	const d = new Date(2026, 3, 10);
	d.setDate(d.getDate() - dayOffset);
	d.setHours(19 + (index % 5), (index * 17) % 60, 0, 0);
	const createdAt = d.toISOString();
	const winTeam = (index % 3 === 0) ? 2 : 1;

	// 10명 선택 (순환)
	const offset = (index * 7) % PLAYERS.length;
	const selected = [];
	for (let i = 0; i < 10; i++) {
		selected.push(PLAYERS[(offset + i) % PLAYERS.length]);
	}

	const team1Players = selected.slice(0, 5).map((p, pi) => {
		const rating = RANKING_RATINGS[(offset + pi) % RANKING_RATINGS.length];
		return {
			name: p.name,
			puuid: p.puuid,
			rating,
			ratingChange: winTeam === 1 ? 3 + (pi % 3) : -(3 + (pi % 3)),
			tier: getTierStringFromRating(rating)
		};
	});
	const team2Players = selected.slice(5, 10).map((p, pi) => {
		const rating = RANKING_RATINGS[(offset + 5 + pi) % RANKING_RATINGS.length];
		return {
			name: p.name,
			puuid: p.puuid,
			rating,
			ratingChange: winTeam === 2 ? 3 + (pi % 3) : -(3 + (pi % 3)),
			tier: getTierStringFromRating(rating)
		};
	});

	const avg1 = Math.round(team1Players.reduce((s, p) => s + p.rating, 0) / 5);
	const avg2 = Math.round(team2Players.reduce((s, p) => s + p.rating, 0) / 5);

	return {
		gameId,
		createdAt,
		winTeam,
		team1: { avgRating: avg1, ratingChange: winTeam === 1 ? 4 : -4, players: team1Players },
		team2: { avgRating: avg2, ratingChange: winTeam === 2 ? 4 : -4, players: team2Players }
	};
}

function getDefaultMatchHistoryData() {
	const matches = [];
	for (let i = 0; i < 30; i++) {
		matches.push(makeMatch(i, Math.floor(i / 3)));
	}
	return matches;
}

export function getSampleMatchHistoryData(page, limit, puuid) {
	let allMatches = getSampleData('matchHistory') || getDefaultMatchHistoryData();
	if (puuid) {
		allMatches = allMatches.filter(
			m =>
				m.team1.players.some(p => p.puuid === puuid) ||
				m.team2.players.some(p => p.puuid === puuid)
		);
	}
	const p = page || 1;
	const l = limit || 10;
	const start = (p - 1) * l;
	return {
		matches: allMatches.slice(start, start + l),
		total: allMatches.length,
		page: p,
		totalPages: Math.ceil(allMatches.length / l)
	};
}

// ============================================================
// 마이 인포 데이터
// ============================================================
function getDefaultMyInfoData(puuid) {
	const targetPuuid = puuid || MY_PUUID;
	const playerIndex = PLAYERS.findIndex(p => p.puuid === targetPuuid);
	const idx = playerIndex >= 0 ? playerIndex : 0;
	const player = PLAYERS[idx];
	const rating = RANKING_RATINGS[idx] || 500;
	const w = RANKING_WINS[idx] || 30;
	const l = RANKING_LOSSES[idx] || 30;

	// ratingHistory: 30 데이터 포인트
	const ratingHistory = [];
	let currentRating = rating - 150;
	for (let i = 0; i < 30; i++) {
		const d = new Date(2026, 2, 1);
		d.setDate(d.getDate() + i);
		const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
		currentRating += Math.round((Math.sin(i * 0.5) * 15) + 5);
		if (currentRating < 200) currentRating = 200;
		ratingHistory.push({ date: dateStr, rating: currentRating });
	}

	// topTeammates 10명
	const topTeammates = [];
	for (let i = 0; i < 10; i++) {
		const ti = (idx + i + 1) % PLAYERS.length;
		const tWins = 15 - i;
		const tGames = 20 + i * 2;
		topTeammates.push({
			puuid: PLAYERS[ti].puuid,
			name: PLAYERS[ti].name,
			games: tGames,
			wins: tWins,
			winRate: winRate(tWins, tGames - tWins)
		});
	}

	// topOpponents 10명
	const topOpponents = [];
	for (let i = 0; i < 10; i++) {
		const oi = (idx + i + 12) % PLAYERS.length;
		const oMyWins = 12 - i;
		const oMyLosses = 8 + i;
		topOpponents.push({
			puuid: PLAYERS[oi].puuid,
			name: PLAYERS[oi].name,
			games: oMyWins + oMyLosses,
			myWins: oMyWins,
			myLosses: oMyLosses,
			winRate: winRate(oMyWins, oMyLosses)
		});
	}

	const bestTeammate = { ...topTeammates[0], losses: topTeammates[0].games - topTeammates[0].wins };
	const bestOpponent = { ...topOpponents[0] };
	const worstOpponent = { ...topOpponents[9] };

	const defaultRating = Math.round(rating * 0.6);
	const additionalRating = rating - defaultRating;

	return {
		userInfo: {
			name: player.name,
			puuid: player.puuid,
			riotId: player.riotId,
			defaultRating,
			additionalRating,
			rating,
			win: w,
			lose: l,
			winRate: winRate(w, l),
			ranking: idx + 1
		},
		summonerInfo: {
			name: player.name,
			puuid: player.puuid,
			profileIconId: 4646,
			summonerLevel: 350 + idx * 10,
			rankTier: getTierStringFromRating(rating + 50),
			rankWin: w + 50,
			rankLose: l + 30,
			mainPosition: 'UTILITY',
			mainPositionRate: 98.94,
			subPosition: 'TOP',
			subPositionRate: 1.06
		},
		detailedStats: {
			topTeammates,
			topOpponents,
			bestTeammate,
			recentGames: 10,
			recentWins: 7,
			recentWinRate: 70,
			maxWinStreak: 8 - Math.floor(idx / 5),
			maxLoseStreak: 3 + Math.floor(idx / 8),
			bestOpponent,
			worstOpponent,
			ratingHistory,
			positionStats: {
				TOP: { games: 12, wins: 6, losses: 6, winRate: 50 },
				JUNGLE: { games: 0, wins: 0, losses: 0, winRate: 0 },
				MIDDLE: { games: 7, wins: 2, losses: 5, winRate: 29 },
				BOTTOM: { games: 0, wins: 0, losses: 0, winRate: 0 },
				UTILITY: { games: 18, wins: 9, losses: 9, winRate: 50 }
			}
		},
		honorStats: {
			received: 30 - idx,
			title: idx < 5 ? { emoji: ['👑', '⚔️', '🎯', '🛡️', '🔥'][idx], title: ['내전의 신', '킬각장인', '정확한 샷', '든든한 방패', '불꽃캐리'][idx] } : null
		},
		subAccount: null,
		mostChampions: [
			{ championName: 'Thresh', games: 42, winRate: 57 },
			{ championName: 'Leona', games: 31, winRate: 52 },
			{ championName: 'Lux', games: 25, winRate: 48 },
			{ championName: 'Graves', games: 18, winRate: 61 },
			{ championName: 'Jhin', games: 12, winRate: 50 }
		]
	};
}

export function getSampleMyInfoData(puuid) {
	const key = `myinfo_${puuid || MY_PUUID}`;
	return getSampleData(key) || getDefaultMyInfoData(puuid);
}

// ============================================================
// 명예 랭킹 데이터 (36명)
// ============================================================
const HONOR_TITLES = [
	{ emoji: '👑', title: '내전의 신' },
	{ emoji: '⚔️', title: '킬각장인' },
	{ emoji: '🎯', title: '정확한 샷' },
	{ emoji: '🛡️', title: '든든한 방패' },
	{ emoji: '🔥', title: '불꽃캐리' },
	null, null, null, null, null
];

function getDefaultHonorRankingData() {
	return PLAYERS.map((p, i) => ({
		name: p.name,
		puuid: p.puuid,
		totalVotes: Math.max(50 - i * 2, 2),
		givenVotes: Math.max(30 - i, 1),
		title: i < HONOR_TITLES.length ? HONOR_TITLES[i] : null
	}));
}

export function getSampleHonorRankingData() {
	return getSampleData('honorRanking') || getDefaultHonorRankingData();
}

// ============================================================
// 업적 데이터
// ============================================================
function getDefaultAchievementData() {
	return [
		{ id: 'first_match', category: 'match', name: '첫 발걸음', description: '첫 내전 참여', tier: 'BRONZE', achievedAt: '2025-06-15T12:00:00Z', progress: 1, goal: 1 },
		{ id: 'win_10', category: 'match', name: '10승 달성', description: '내전 10승 달성', tier: 'SILVER', achievedAt: '2025-07-20T15:00:00Z', progress: 10, goal: 10 },
		{ id: 'win_50', category: 'match', name: '50승 달성', description: '내전 50승 달성', tier: 'GOLD', achievedAt: '2025-12-01T18:00:00Z', progress: 50, goal: 50 },
		{ id: 'games_100', category: 'games', name: '100판 달성', description: '내전 100판 참여', tier: 'GOLD', achievedAt: '2025-11-10T20:00:00Z', progress: 100, goal: 100 },
		{ id: 'games_200', category: 'games', name: '200판 달성', description: '내전 200판 참여', tier: 'PLATINUM', progress: 123, goal: 200 },
		{ id: 'streak_5', category: 'win_streak', name: '5연승', description: '5연승 달성', tier: 'SILVER', achievedAt: '2025-09-05T21:00:00Z', progress: 5, goal: 5 },
		{ id: 'streak_10', category: 'win_streak', name: '10연승', description: '10연승 달성', tier: 'GOLD', progress: 8, goal: 10 },
		{ id: 'tier_gold', category: 'tier', name: '골드 달성', description: '커스텀 레이팅 골드 도달', tier: 'GOLD', achievedAt: '2025-08-15T19:00:00Z', progress: 1, goal: 1 },
		{ id: 'tier_diamond', category: 'tier', name: '다이아 달성', description: '커스텀 레이팅 다이아몬드 도달', tier: 'DIAMOND', achievedAt: '2026-01-20T22:00:00Z', progress: 1, goal: 1 },
		{ id: 'tier_master', category: 'tier', name: '마스터 달성', description: '커스텀 레이팅 마스터 도달', tier: 'MASTER', progress: 0, goal: 1 },
		{ id: 'underdog_3', category: 'underdog', name: '언더독 3회', description: '팀 최저 레이팅으로 승리 3회', tier: 'SILVER', achievedAt: '2025-10-12T20:00:00Z', progress: 3, goal: 3 },
		{ id: 'late_night_10', category: 'late_night', name: '새벽전사', description: '새벽(00~06시) 경기 10회 참여', tier: 'SILVER', achievedAt: '2026-02-01T03:00:00Z', progress: 10, goal: 10 }
	];
}

export function getSampleAchievementData() {
	return getSampleData('achievement') || getDefaultAchievementData();
}

// ============================================================
// 챌린지 데이터
// ============================================================
const CHAMPION_NAMES = [
	'Ahri', 'Zed', 'Yasuo', 'LeeSin', 'Thresh', 'Jinx', 'Lux', 'Ezreal',
	'KaiSa', 'Akali', 'Garen', 'Darius', 'Vayne', 'Riven', 'Jhin', 'Syndra',
	'Orianna', 'Yone', 'Viego', 'Graves'
];

function getDefaultChallengeListData() {
	return [
		{
			id: 'sample-challenge-1',
			title: '4월 솔랭 챌린지',
			gameType: 'soloRank',
			scoringType: 'points',
			status: 'active',
			startAt: '2026-04-01T00:00:00Z',
			endAt: '2026-04-30T23:59:59Z',
			activePlayerCount: 24,
			description: '4월 한 달간 솔로랭크 포인트를 모아보세요!'
		},
		{
			id: 'sample-challenge-2',
			title: '3월 칼바람 대회',
			gameType: 'aram',
			scoringType: 'wins',
			status: 'ended',
			startAt: '2026-03-01T00:00:00Z',
			endAt: '2026-03-31T23:59:59Z',
			activePlayerCount: 30,
			description: '칼바람 나락에서 가장 많이 승리하세요!'
		},
		{
			id: 'sample-challenge-3',
			title: '5월 승률 챌린지',
			gameType: 'soloRank',
			scoringType: 'winRate',
			status: 'scheduled',
			startAt: '2026-05-01T00:00:00Z',
			endAt: '2026-05-31T23:59:59Z',
			activePlayerCount: 0,
			description: '최소 20판 이상, 최고 승률을 기록하세요!'
		}
	];
}

export function getSampleChallengeListData() {
	return getSampleData('challengeList') || getDefaultChallengeListData();
}

function getDefaultChallengeDetailData(challengeId) {
	const challenges = getDefaultChallengeListData();
	const found = challenges.find(c => c.id === challengeId);
	if (found) {
		return {
			...found,
			syncStatus: 'idle',
			syncProgress: null,
			lastSyncAt: '2026-04-11T18:30:00Z'
		};
	}
	return {
		...challenges[0],
		id: challengeId,
		syncStatus: 'idle',
		syncProgress: null,
		lastSyncAt: '2026-04-11T18:30:00Z'
	};
}

export function getSampleChallengeDetailData(challengeId) {
	return getSampleData(`challengeDetail_${challengeId}`) || getDefaultChallengeDetailData(challengeId);
}

function getDefaultLeaderboardData() {
	return PLAYERS.slice(0, 24).map((p, i) => ({
		puuid: p.puuid,
		name: p.name,
		rank: i + 1,
		totalGames: 30 - i,
		wins: Math.max(20 - i, 3),
		losses: Math.max(10 + Math.floor(i / 2) - 2, 1),
		winRate: winRate(Math.max(20 - i, 3), Math.max(10 + Math.floor(i / 2) - 2, 1)),
		points: Math.max(150 - i * 6, 10)
	}));
}

export function getSampleLeaderboardData() {
	return getSampleData('leaderboard') || getDefaultLeaderboardData();
}

function getDefaultUserMatchesData(puuid) {
	const targetPuuid = puuid || MY_PUUID;
	const matches = [];
	for (let i = 0; i < 15; i++) {
		const d = new Date(2026, 3, 10);
		d.setDate(d.getDate() - i);
		const win = i % 3 !== 0;
		const champIdx = (i * 3) % CHAMPION_NAMES.length;
		const myTeamId = 100;
		const participants = [];
		for (let j = 0; j < 10; j++) {
			const teamId = j < 5 ? 100 : 200;
			const pIdx = (i * 7 + j) % PLAYERS.length;
			const isMe = j === 0;
			participants.push({
				puuid: isMe ? targetPuuid : PLAYERS[pIdx].puuid,
				riotIdGameName: isMe ? PLAYERS.find(p => p.puuid === targetPuuid)?.name || '페이커' : PLAYERS[pIdx].name,
				championName: CHAMPION_NAMES[(champIdx + j) % CHAMPION_NAMES.length],
				teamId,
				win: teamId === myTeamId ? win : !win,
				kills: 5 + (j * 3 + i) % 10,
				deaths: 2 + (j * 2 + i) % 8,
				assists: 3 + (j + i * 2) % 12,
				totalMinionsKilled: 120 + j * 15,
				neutralMinionsKilled: 20 + j * 5,
				timePlayed: 1800 + i * 30,
				goldEarned: 10000 + j * 1000,
				totalDamageDealtToChampions: 15000 + j * 2000,
				item0: 3006, item1: 3031, item2: 3094, item3: 3046, item4: 3036, item5: 3072,
				summoner1Id: 4, summoner2Id: 7,
				perks: { styles: [{ style: 8000 }] },
				doubleKills: j === 0 ? 2 : 0,
				tripleKills: 0,
				quadraKills: 0,
				pentaKills: 0
			});
		}
		matches.push({
			matchId: `sample-cm-${String(i + 1).padStart(3, '0')}`,
			gameCreation: d.getTime(),
			gameDuration: 1800 + i * 30,
			puuid: targetPuuid,
			championName: CHAMPION_NAMES[champIdx],
			win,
			kills: participants[0].kills,
			deaths: participants[0].deaths,
			assists: participants[0].assists,
			participants,
			groupMembers: PLAYERS.slice(0, 5).map(p => ({ puuid: p.puuid, name: p.name }))
		});
	}
	return matches;
}

export function getSampleUserMatchesData(puuid) {
	return getSampleData(`userMatches_${puuid}`) || getDefaultUserMatchesData(puuid);
}

// ============================================================
// 밸런스 리포트 데이터
// ============================================================
function getDefaultBalanceReportData() {
	return {
		summary: { favoredTeamWinRate: 56.3, expectedWinRate: 58.1 },
		setAnalysis: {
			totalSets: 64,
			twoZero: { rate: 54.7, count: 35, favoredWin: 22, underdogWin: 13 },
			twoOne: { rate: 39.1, count: 25, favoredWin: 14, underdogWin: 11 },
			incomplete: 4,
			positionScoreImpact: [
				{ label: '균형', twoZeroRate: 48.2, totalSets: 28 },
				{ label: '약간 불균형', twoZeroRate: 57.5, totalSets: 22 },
				{ label: '불균형', twoZeroRate: 68.4, totalSets: 14 }
			]
		},
		positionAnalysis: {
			avgPositionBalance: '보통',
			mostOverlappedPositions: [
				{ position: 'MID', count: 42, rate: 28.5 },
				{ position: 'JUNGLE', count: 33, rate: 22.4 },
				{ position: 'ADC', count: 27, rate: 18.3 },
				{ position: 'TOP', count: 25, rate: 17.0 },
				{ position: 'SUPPORT', count: 20, rate: 13.6 }
			]
		},
		ratingBrackets: [
			{ label: '0~25', favoredWinRate: 51.2, expectedWinRate: 53.0, count: 24 },
			{ label: '25~50', favoredWinRate: 55.8, expectedWinRate: 57.2, count: 31 },
			{ label: '50~75', favoredWinRate: 60.3, expectedWinRate: 62.1, count: 18 },
			{ label: '75~100', favoredWinRate: 64.7, expectedWinRate: 67.4, count: 12 },
			{ label: '100+', favoredWinRate: 71.4, expectedWinRate: 73.9, count: 8 }
		],
		monthlyTrend: [
			{ month: '2026-01', favoredWinRate: 54.1, avgPerPlayerDiff: 12.3, matchCount: 38 },
			{ month: '2026-02', favoredWinRate: 57.2, avgPerPlayerDiff: 14.1, matchCount: 42 },
			{ month: '2026-03', favoredWinRate: 55.8, avgPerPlayerDiff: 11.7, matchCount: 47 },
			{ month: '2026-04', favoredWinRate: 58.3, avgPerPlayerDiff: 13.5, matchCount: 51 }
		],
		tierSpread: [
			{ label: '0~50', count: 22, favoredWinRate: 52.1 },
			{ label: '50~100', count: 28, favoredWinRate: 56.4 },
			{ label: '100~150', count: 14, favoredWinRate: 61.2 },
			{ label: '150+', count: 8, favoredWinRate: 68.5 }
		]
	};
}

export function getSampleBalanceReportData() {
	return getSampleData('balanceReport') || getDefaultBalanceReportData();
}

// ============================================================
// 업적 대시보드 데이터 (그룹 전체 업적 현황)
// ============================================================
const ACH_DASH_CATEGORIES = [
	{ key: 'match', total: 4 },
	{ key: 'games', total: 5 },
	{ key: 'win_streak', total: 4 },
	{ key: 'sweep_win', total: 3 },
	{ key: 'underdog', total: 3 },
	{ key: 'tier', total: 9 },
	{ key: 'honor_received', total: 4 },
	{ key: 'night_owl', total: 3 }
];

const ACH_CAT_LABEL = {
	match: '첫걸음',
	games: '판수',
	win_streak: '연승',
	sweep_win: '완승 스윕',
	underdog: '언더독',
	tier: '티어 달성',
	honor_received: '명예왕',
	night_owl: '밤새기'
};

const ACH_CAT_EMOJI = {
	match: '🏆',
	games: '📊',
	win_streak: '🔥',
	sweep_win: '🧹',
	underdog: '💪',
	tier: '👑',
	honor_received: '🎖️',
	night_owl: '🦉'
};

function achTopUnlockers(seedIdx, n) {
	const out = [];
	for (let i = 0; i < n; i++) {
		const p = PLAYERS[(seedIdx + i) % PLAYERS.length];
		const d = new Date(2026, 3, 20);
		d.setDate(d.getDate() - (seedIdx + i));
		out.push({ puuid: p.puuid, name: p.name, rank: i + 1, profileIconId: null, unlockedAt: d.toISOString() });
	}
	return out;
}

function getDefaultAchievementDashboardData() {
	const totalAchievements = ACH_DASH_CATEGORIES.reduce((s, c) => s + c.total, 0);
	const categoryStats = ACH_DASH_CATEGORIES.map((c, i) => {
		const unlocked = Math.max(1, c.total - (i % 3));
		return {
			category: c.key,
			unlockedAchievements: unlocked,
			totalAchievements: c.total,
			totalUnlocks: 20 + i * 7,
			unlockRate: Math.round((unlocked / c.total) * 1000) / 10
		};
	});
	const unlockedAchievements = categoryStats.reduce((s, c) => s + c.unlockedAchievements, 0);
	const totalUnlocks = categoryStats.reduce((s, c) => s + c.totalUnlocks, 0);
	return {
		summary: {
			totalAchievements,
			unlockedAchievements,
			unlockRate: Math.round((unlockedAchievements / totalAchievements) * 1000) / 10,
			newUnlocksThisWeek: 7,
			totalUnlocks,
			totalActiveUsers: PLAYERS.length
		},
		topUsers: PLAYERS.slice(0, 3).map((p, i) => ({ puuid: p.puuid, name: p.name, unlockCount: 28 - i * 4 })),
		categoryStats
	};
}

export function getSampleAchievementDashboardData() {
	return getSampleData('achievementDashboard') || getDefaultAchievementDashboardData();
}

function getDefaultAchievementCategoryData(category) {
	const isTier = category === 'tier';
	const TIER_SEQ = ['GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER'];
	const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
	const count = isTier ? 5 : 3;
	const achievements = [];
	for (let i = 0; i < count; i += 1) {
		const tier = TIER_SEQ[i % TIER_SEQ.length];
		const unlockedCount = Math.max(1, 12 - i * 3);
		const top = achTopUnlockers(i * 2, Math.min(3, unlockedCount));
		const id = isTier ? `TIER_${tier}` : `${category.toUpperCase()}_${i + 1}`;
		achievements.push({
			id,
			name: isTier ? `${tier} 달성` : `${ACH_CAT_LABEL[category] || category} ${ROMAN[i] || i + 1}`,
			tier,
			emoji: ACH_CAT_EMOJI[category] || '🏆',
			category,
			goal: (i + 1) * 5,
			unlockedCount,
			unlockRate: Math.round((unlockedCount / PLAYERS.length) * 1000) / 10,
			topUnlockers: top,
			latestUnlocker: top[0] ? { unlockedAt: top[0].unlockedAt } : null
		});
	}
	return { achievements };
}

export function getSampleAchievementCategoryData(category) {
	return getSampleData(`achievementCategory_${category}`) || getDefaultAchievementCategoryData(category);
}

function getDefaultAchievementUserRankingData() {
	const rankings = PLAYERS.map((p, i) => ({
		rank: i + 1,
		puuid: p.puuid,
		name: p.name,
		unlockCount: Math.max(0, 30 - i),
		profileIconId: null
	}));
	return {
		totalActiveUsers: PLAYERS.length,
		totalRanked: rankings.filter(r => r.unlockCount > 0).length,
		rankings
	};
}

export function getSampleAchievementUserRankingData() {
	return getSampleData('achievementUserRanking') || getDefaultAchievementUserRankingData();
}

// ============================================================
// 그룹 설정 데이터
// ============================================================
function getDefaultGroupInfoData() {
	return {
		discordGuildIcon: null,
		discordGuildName: 'Sample Guild',
		groupName: 'Sample Group',
		totalMatches: 387,
		createdAt: '2025-08-01T00:00:00Z',
		members: {
			total: PLAYERS.length,
			active: PLAYERS.length - 2,
			blacklisted: 1,
			leftGuild: 1
		},
		settings: {
			onboardingEnabled: true,
			matchVoteMode: 'normal',
			seasonEndMonth: null
		}
	};
}

export function getSampleGroupInfoData() {
	return getSampleData('groupInfo') || getDefaultGroupInfoData();
}

function getDefaultGroupMembersData() {
	return PLAYERS.map((p, i) => {
		const rating = RANKING_RATINGS[i] != null ? RANKING_RATINGS[i] : 500;
		const defaultRating = Math.round(rating * 0.6);
		return {
			puuid: p.puuid,
			name: p.name,
			discordNickname: i % 4 === 0 ? null : p.name,
			role: i === 0 ? 'admin' : i === PLAYERS.length - 1 ? 'outsider' : 'member',
			leftGuildAt: null,
			subAccounts: i % 6 === 0 ? [{ name: `${p.name} 부캐` }] : [],
			win: RANKING_WINS[i] != null ? RANKING_WINS[i] : 20,
			lose: RANKING_LOSSES[i] != null ? RANKING_LOSSES[i] : 20,
			defaultRating,
			additionalRating: rating - defaultRating,
			createdAt: '2025-08-01T00:00:00Z',
			latestMatchDate: '2026-04-10T19:00:00Z',
			lastVoiceJoinedAt: '2026-04-10T20:30:00Z'
		};
	});
}

export function getSampleGroupMembersData() {
	return getSampleData('groupMembers') || getDefaultGroupMembersData();
}

export function getSampleDiscordRolesData() {
	return [
		{ id: 'role-everyone', name: '@everyone' },
		{ id: 'role-member', name: '내전러' },
		{ id: 'role-admin', name: '관리자' },
		{ id: 'role-newbie', name: '뉴비' }
	];
}

function getDefaultAuditLogsData() {
	const logs = [];
	const templates = [
		(i, d) => ({ source: 'web', actorName: '페이커', action: 'match.create', details: { gameId: `sample-match-${String(i).padStart(3, '0')}` } }),
		(i, d) => ({ source: 'discord', actorName: 'Graves Bot', action: 'user.blacklist', details: { puuid: PLAYERS[(i + 5) % PLAYERS.length].puuid, previousRole: 'member' } }),
		(i, d) => ({ source: 'web', actorName: '쵸비', action: 'generator.create', details: { channelName: '연습방', defaultName: '{username}의 채널', defaultUserLimit: 5 } })
	];
	for (let i = 0; i < 12; i += 1) {
		const d = new Date(2026, 3, 11);
		d.setHours(d.getHours() - i * 5);
		const t = templates[i % templates.length](i + 1, d);
		logs.push({ id: `log-${i + 1}`, createdAt: d.toISOString(), ...t });
	}
	return { logs, total: logs.length, page: 1, limit: 50 };
}

export function getSampleAuditLogsData() {
	return getSampleData('auditLogs') || getDefaultAuditLogsData();
}

export function getSampleVoiceChannelsData() {
	return [
		{ id: 'vc-1', name: '내전 대기실', categoryName: '내전' },
		{ id: 'vc-2', name: '1팀', categoryName: '내전' },
		{ id: 'vc-3', name: '2팀', categoryName: '내전' },
		{ id: 'vc-4', name: '자유 음성', categoryName: '일반' },
		{ id: 'vc-5', name: 'AFK', categoryName: null }
	];
}

export function getSampleGeneratorsData() {
	return [
		{ channelId: 'vc-1', defaultName: '{username}의 채널', defaultUserLimit: 0 },
		{ channelId: 'vc-4', defaultName: '연습방 - {count}', defaultUserLimit: 5 }
	];
}

// ============================================================
// 토너먼트 데이터
// ============================================================
const TOURNEY_POS = ['top', 'jungle', 'mid', 'adc', 'support'];

function tourneyTeamMembers(startIdx) {
	return TOURNEY_POS.map((pos, j) => {
		const p = PLAYERS[(startIdx + j) % PLAYERS.length];
		return {
			name: p.name,
			puuid: p.puuid,
			position: pos,
			rating: RANKING_RATINGS[(startIdx + j) % RANKING_RATINGS.length],
			profileIconId: null,
			bidAmount: null
		};
	});
}

const TOURNEY_TEAM_DEFS = [
	{ id: 1, name: '미정이가 누구야?', startIdx: 0 },
	{ id: 2, name: '챙공불이', startIdx: 5 },
	{ id: 3, name: '슈퍼알치라메', startIdx: 10 },
	{ id: 4, name: '송혜원졌다고', startIdx: 15 }
];

function buildTourneyTeams() {
	return TOURNEY_TEAM_DEFS.map(t => {
		const members = tourneyTeamMembers(t.startIdx);
		const avgRating = Math.round(members.reduce((s, m) => s + m.rating, 0) / members.length);
		return {
			id: t.id,
			name: t.name,
			captainPuuid: PLAYERS[t.startIdx].puuid,
			avgRating,
			remainingBudget: null,
			members,
			scrimRecord: null
		};
	});
}

function buildTourneyMatches() {
	const mk = (id, round, slot, t1, t2, win, s1, s2, bestOf) => ({
		id,
		round,
		bracketSlot: slot,
		team1Id: t1,
		team2Id: t2,
		winnerTeamId: win,
		team1Score: s1,
		team2Score: s2,
		bestOf,
		scheduledAt: null,
		predictions: [],
		team1PredictionCount: 0,
		team2PredictionCount: 0,
		team1PredictionPct: null,
		team2PredictionPct: null,
		predictionsActive: false,
		team1WinProb: null,
		team2WinProb: null,
		headToHeadScrim: null
	});
	return [
		// 4강
		mk(1, 1, 0, 1, 4, 1, 2, 0, 3),
		mk(2, 1, 1, 2, 3, 2, 2, 1, 3),
		// 결승
		mk(3, 2, 0, 1, 2, 1, 3, 1, 5)
	];
}

function getDefaultTournamentDetailData(tournamentId) {
	const teams = buildTourneyTeams();
	return {
		tournament: {
			id: Number(tournamentId) || 1,
			groupId: 'sample-group',
			name: '2026 봄 내전 토너먼트',
			status: 'finished',
			type: 'normal',
			trophyType: 'worlds',
			championTeamId: 1,
			allowSingleTeam: false,
			bracketSize: 4,
			teamCount: 4,
			defaultBestOf: 3,
			finalBestOf: 5,
			auctionConfig: null,
			predictionsLocked: true
		},
		teams,
		matches: buildTourneyMatches(),
		scrims: [],
		roundLabels: { 1: '4강', 2: '결승' },
		leaderboard: PLAYERS.slice(0, 5).map((p, i) => ({
			summonerName: p.name,
			userPuuid: p.puuid,
			correctCount: 3 - Math.min(i, 3),
			settledCount: 3
		})),
		currentCandidate: null
	};
}

export function getSampleTournamentDetailData(tournamentId) {
	return getSampleData(`tournamentDetail_${tournamentId}`) || getDefaultTournamentDetailData(tournamentId);
}

function getDefaultTournamentListData() {
	const champMembers = tourneyTeamMembers(0).map(m => ({
		name: m.name,
		puuid: m.puuid,
		position: m.position,
		profileIconId: null
	}));
	return [
		{
			id: 1,
			name: '2026 봄 내전 토너먼트',
			status: 'finished',
			trophyType: 'worlds',
			heldAt: '2026-04-05T00:00:00Z',
			teamCount: 4,
			bracketSize: 4,
			defaultBestOf: 3,
			finalBestOf: 5,
			championTeam: {
				id: 1,
				name: '미정이가 누구야?',
				captainPuuid: PLAYERS[0].puuid,
				members: champMembers
			}
		},
		{
			id: 2,
			name: '2026 여름 칼바람 컵',
			status: 'in_progress',
			trophyType: 'msi',
			heldAt: '2026-06-01T00:00:00Z',
			teamCount: 4,
			bracketSize: 4,
			defaultBestOf: 3,
			finalBestOf: 5
		}
	];
}

export function getSampleTournamentListData() {
	return getSampleData('tournamentList') || getDefaultTournamentListData();
}

export function getSampleTournamentActiveMembersData() {
	return PLAYERS.map((p, i) => ({
		name: p.name,
		puuid: p.puuid,
		position: TOURNEY_POS[i % TOURNEY_POS.length],
		rating: RANKING_RATINGS[i] != null ? RANKING_RATINGS[i] : 500,
		profileIconId: null
	}));
}

export { MY_PUUID, PLAYERS };
