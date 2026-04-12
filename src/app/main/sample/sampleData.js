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

export function getSampleMatchHistoryData(page, limit) {
	const allMatches = getSampleData('matchHistory') || getDefaultMatchHistoryData();
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
			rankLose: l + 30
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
			ratingHistory
		},
		honorStats: {
			received: 30 - idx,
			title: idx < 5 ? { emoji: ['👑', '⚔️', '🎯', '🛡️', '🔥'][idx], title: ['내전의 신', '킬각장인', '정확한 샷', '든든한 방패', '불꽃캐리'][idx] } : null
		},
		subAccount: null
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
		{ id: 'streak_5', category: 'streak_win', name: '5연승', description: '5연승 달성', tier: 'SILVER', achievedAt: '2025-09-05T21:00:00Z', progress: 5, goal: 5 },
		{ id: 'streak_10', category: 'streak_win', name: '10연승', description: '10연승 달성', tier: 'GOLD', progress: 8, goal: 10 },
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

export { MY_PUUID, PLAYERS };
