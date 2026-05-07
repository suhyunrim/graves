export const STATUS = {
	PREPARING: 'preparing',
	IN_PROGRESS: 'in_progress',
	FINISHED: 'finished'
};

export const STATUS_LABELS = {
	[STATUS.PREPARING]: '준비 중',
	[STATUS.IN_PROGRESS]: '진행 중',
	[STATUS.FINISHED]: '종료'
};

export const STATUS_COLORS = {
	[STATUS.PREPARING]: '#ffd700',
	[STATUS.IN_PROGRESS]: '#00d4ff',
	[STATUS.FINISHED]: '#868e96'
};

export const POSITIONS = ['top', 'jungle', 'mid', 'adc', 'support'];

export const POSITION_LABELS = {
	top: '탑',
	jungle: '정글',
	mid: '미드',
	adc: '원딜',
	support: '서폿'
};

// 브래킷 connector 라인 색 — 진행 중은 cyan, 종료된 매치는 녹색
export const BRACKET_LINE_COLOR = 'rgba(0, 212, 255, 0.3)';
export const BRACKET_LINE_COLOR_FINISHED = 'rgba(0, 255, 127, 0.6)';

// RankingTable.js 의 tierNames 와 동일한 임계값. 둘이 어긋나면 같은 rating 이
// 페이지마다 다른 티어로 보이게 됨.
const TIER_BASES = [
	['CHALLENGER', 1150],
	['GRANDMASTER', 1000],
	['MASTER', 900],
	['DIAMOND', 800],
	['EMERALD', 700],
	['PLATINUM', 600],
	['GOLD', 500],
	['SILVER', 400],
	['BRONZE', 300],
	['IRON', 200]
];
const TIER_STEPS = ['IV', 'III', 'II', 'I'];

const TIER_INITIAL = {
	IRON: 'I',
	BRONZE: 'B',
	SILVER: 'S',
	GOLD: 'G',
	PLATINUM: 'P',
	EMERALD: 'E',
	DIAMOND: 'D',
	MASTER: 'M',
	GRANDMASTER: 'GM',
	CHALLENGER: 'C'
};

function isNonStepTier(name) {
	return name === 'MASTER' || name === 'GRANDMASTER' || name === 'CHALLENGER';
}

function tierStepIndex(rating, base) {
	return Math.min(3, Math.floor((rating - base) / 25));
}

export function getTierName(rating) {
	if (rating == null) return null;
	for (const [name, base] of TIER_BASES) {
		if (rating >= base) return name;
	}
	return 'IRON';
}

export function getTierLabel(rating) {
	if (rating == null) return null;
	for (const [name, base] of TIER_BASES) {
		if (rating >= base) {
			if (isNonStepTier(name)) return name;
			return `${name} ${TIER_STEPS[tierStepIndex(rating, base)]}`;
		}
	}
	return 'IRON IV';
}

// 'D2', 'GM', 'C' 같은 짧은 표기. 좁은 공간(멤버 행 등) 에서 쓴다.
export function getTierShortLabel(rating) {
	if (rating == null) return null;
	for (const [name, base] of TIER_BASES) {
		if (rating >= base) {
			const initial = TIER_INITIAL[name];
			if (isNonStepTier(name)) return initial;
			return `${initial}${4 - tierStepIndex(rating, base)}`;
		}
	}
	return 'I4';
}

export function getTierEmblemUrl(tierName) {
	if (!tierName) return null;
	return `/assets/images/ranked-emblems/Emblem_${tierName}.webp`;
}

// 백엔드 nextPow2 산정 로직과 일치시켜 slotMapping 길이를 맞춘다
export function bracketSizeForTeamCount(teamCount) {
	if (!teamCount || teamCount < 2) return 2;
	return 2 ** Math.ceil(Math.log2(teamCount));
}

// 시작 전 단계엔 백엔드 roundLabels 가 비어있어 클라이언트가 직접 라벨을 만든다
export function roundLabelFor(round, totalRounds) {
	const teamsThisRound = 2 ** (totalRounds - round + 1);
	if (teamsThisRound === 2) return '결승';
	return `${teamsThisRound}강`;
}

// scheduledAt(UTC ISO) → "5/10 (토) 19:00" 형태 (KST 기준).
// 백엔드는 UTC 저장, 사용자는 KST 로 보는 게 일관됨.
export function formatScheduledAt(iso) {
	if (!iso) return null;
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return null;
	const parts = new Intl.DateTimeFormat('ko-KR', {
		timeZone: 'Asia/Seoul',
		month: 'numeric',
		day: 'numeric',
		weekday: 'short',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	}).formatToParts(d);
	const get = (type) => {
		const p = parts.find(x => x.type === type);
		return p ? p.value : '';
	};
	return `${get('month')}/${get('day')} (${get('weekday')}) ${get('hour')}:${get('minute')}`;
}

// "BO5" → "5판 3선" 같은 한글 표기. BO1 은 단판으로 분기.
export function bestOfLabel(n) {
	if (!n) return '';
	if (n === 1) return '단판';
	return `${n}판 ${Math.ceil(n / 2)}선`;
}

export function groupMatchesByRound(matches) {
	const map = new Map();
	matches.forEach(m => {
		if (!map.has(m.round)) map.set(m.round, []);
		map.get(m.round).push(m);
	});
	[...map.values()].forEach(arr => arr.sort((a, b) => a.bracketSlot - b.bracketSlot));
	return [...map.entries()].sort(([a], [b]) => a - b);
}

export function isByeMatch(match) {
	return (match.team1Id == null) !== (match.team2Id == null);
}

// 1라운드의 BYE 매치는 자동 진출이라 트리에서 숨기고, 그 외 라운드는 BYE 도 effective propagate 로 픽 가능.
export function getVisibleMatches(round, roundMatches) {
	if (round === 1) return roundMatches.filter(m => !isByeMatch(m));
	return roundMatches;
}

export function isEmptyMatch(match) {
	return match.team1Id == null && match.team2Id == null;
}

// 두 팀이 모두 정해진 매치 (BYE/empty 제외). 승부의신 적중 카운트의 분모로 사용.
export function isValidMatch(match) {
	return Boolean(match && match.team1Id != null && match.team2Id != null);
}

export function validateMatchScore(team1Score, team2Score, bestOf) {
	if (typeof team1Score !== 'number' || typeof team2Score !== 'number') return '점수를 입력하세요.';
	if (team1Score < 0 || team2Score < 0) return '점수는 0 이상이어야 합니다.';
	if (team1Score === team2Score) return '동점은 허용되지 않습니다.';
	const winScore = Math.ceil(bestOf / 2);
	const winner = team1Score > team2Score ? team1Score : team2Score;
	const loser = team1Score > team2Score ? team2Score : team1Score;
	if (winner !== winScore) return `${bestOfLabel(bestOf)}는 승자 ${winScore}점이어야 합니다.`;
	if (loser >= winScore) return `${bestOfLabel(bestOf)}는 패자 ${winScore - 1}점 이하여야 합니다.`;
	return null;
}

export function checkIsAdmin(user) {
	return Boolean(user && user.reprGroup && user.reprGroup.isAdmin);
}

// 브래킷 트리 부모/자식 매치. 한 군데서만 라운드/슬롯 매핑을 정의해 다른 callsite 와 어긋나지 않게 한다.
export function getParentMatches(matches, m) {
	if (!m || m.round <= 1) return [null, null];
	const left = matches.find(x => x.round === m.round - 1 && x.bracketSlot === m.bracketSlot * 2) || null;
	const right = matches.find(x => x.round === m.round - 1 && x.bracketSlot === m.bracketSlot * 2 + 1) || null;
	return [left, right];
}

export function getChildMatch(matches, m) {
	if (!m) return null;
	return matches.find(x => x.round === m.round + 1 && x.bracketSlot === Math.floor(m.bracketSlot / 2)) || null;
}

// summonerName 폴백 — 정보가 비면 puuid 앞 8자만 잘라 보여준다.
export function displayNameForPuuid(name, puuid) {
	if (name) return name;
	if (puuid) return `${puuid.slice(0, 8)}…`;
	return '';
}

// 백엔드가 team.scrimRecord 로 누적 세트(won/lost) 와 played 를 내려준다.
// 정렬: 승률 → 승 → 패 적은 순.
export function computeScrimLeaderboard(teams) {
	return (teams || [])
		.map(t => {
			const r = t.scrimRecord || { won: 0, lost: 0, played: 0 };
			const total = r.won + r.lost;
			return {
				teamId: t.id,
				wins: r.won,
				losses: r.lost,
				played: r.played,
				winRate: total ? r.won / total : 0
			};
		})
		.sort((a, b) => (
			b.winRate - a.winRate
			|| b.wins - a.wins
			|| a.losses - b.losses
		));
}

// 특정 팀이 본 상대팀별 누적 세트 점수 (mySets:oppSets) + 매치 수
export function computeVsRecords(teamId, scrims, teams) {
	const records = new Map();
	teams.forEach(t => {
		if (t.id !== teamId) {
			records.set(t.id, { opponentId: t.id, mySets: 0, oppSets: 0, matches: 0 });
		}
	});
	(scrims || []).forEach(s => {
		let mine = 0;
		let opp = 0;
		let oppId = null;
		if (s.team1Id === teamId) {
			mine = s.team1Score;
			opp = s.team2Score;
			oppId = s.team2Id;
		} else if (s.team2Id === teamId) {
			mine = s.team2Score;
			opp = s.team1Score;
			oppId = s.team1Id;
		} else {
			return;
		}
		const r = records.get(oppId);
		if (!r) return;
		r.mySets += mine;
		r.oppSets += opp;
		r.matches += 1;
	});
	return [...records.values()]
		.filter(r => r.matches > 0)
		.sort((a, b) => (b.mySets - b.oppSets) - (a.mySets - a.oppSets));
}

export function canEditScrim(scrim, user, isAdmin) {
	if (isAdmin) return true;
	const myDiscordId = user && user.data && user.data.discordUser && user.data.discordUser.discordId;
	return Boolean(myDiscordId && scrim.recordedByDiscordId === myDiscordId);
}
