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

// DDragon 엔 포지션 아이콘이 없어서 CommunityDragon 의 SVG 를 쓴다.
const POSITION_CDN_KEY = {
	top: 'top',
	jungle: 'jungle',
	mid: 'middle',
	adc: 'bottom',
	support: 'utility'
};

export function getPositionIconUrl(position) {
	const key = POSITION_CDN_KEY[position];
	if (!key) return null;
	return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/lol-positions/position-${key}.svg`;
}

// 흑백 SVG 를 cyan 톤으로 칠하는 필터 — 포지션 아이콘 컬러 통일용
export const CYAN_ICON_FILTER = 'invert(70%) sepia(80%) saturate(500%) hue-rotate(160deg) brightness(105%) contrast(95%)';

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

function isNonStepTier(name) {
	return name === 'MASTER' || name === 'GRANDMASTER' || name === 'CHALLENGER';
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
			return `${name} ${TIER_STEPS[Math.min(3, Math.floor((rating - base) / 25))]}`;
		}
	}
	return 'IRON IV';
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

export function isEmptyMatch(match) {
	return match.team1Id == null && match.team2Id == null;
}

export function validateMatchScore(team1Score, team2Score, bestOf) {
	if (typeof team1Score !== 'number' || typeof team2Score !== 'number') return '점수를 입력하세요.';
	if (team1Score < 0 || team2Score < 0) return '점수는 0 이상이어야 합니다.';
	if (team1Score === team2Score) return '동점은 허용되지 않습니다.';
	const winScore = Math.ceil(bestOf / 2);
	const winner = team1Score > team2Score ? team1Score : team2Score;
	const loser = team1Score > team2Score ? team2Score : team1Score;
	if (winner !== winScore) return `BO${bestOf}는 승자 ${winScore}점이어야 합니다.`;
	if (loser >= winScore) return `BO${bestOf}는 패자 ${winScore - 1}점 이하여야 합니다.`;
	return null;
}

export function checkIsAdmin(user) {
	return Boolean(user && user.reprGroup && user.reprGroup.isAdmin);
}
