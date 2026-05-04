export const STATUS_LABELS = {
	preparing: '준비 중',
	in_progress: '진행 중',
	finished: '종료'
};

export const STATUS_COLORS = {
	preparing: '#ffd700',
	in_progress: '#00d4ff',
	finished: '#868e96'
};

export const POSITIONS = ['top', 'jungle', 'mid', 'adc', 'support'];

export const POSITION_LABELS = {
	top: '탑',
	jungle: '정글',
	mid: '미드',
	adc: '원딜',
	support: '서폿'
};

// 등록된 팀 수 → 브래킷 사이즈 (다음 2의 거듭제곱, 최소 2)
// 백엔드 nextPow2 산정 로직과 일치시켜 slotMapping 길이를 맞춘다.
export function bracketSizeForTeamCount(teamCount) {
	if (!teamCount || teamCount < 2) return 2;
	return 2 ** Math.ceil(Math.log2(teamCount));
}

// 라운드 → 한국어 라벨. 시작 전(슬롯 배치 단계)엔 백엔드 roundLabels 가 비어있어
// 클라이언트가 직접 라벨을 만든다. ("4강", "8강", "결승" ...)
export function roundLabelFor(round, totalRounds) {
	const teamsThisRound = 2 ** (totalRounds - round + 1);
	if (teamsThisRound === 2) return '결승';
	return `${teamsThisRound}강`;
}

// 매치 그룹핑: round 별로 매치 정렬
export function groupMatchesByRound(matches) {
	const map = new Map();
	matches.forEach(m => {
		if (!map.has(m.round)) map.set(m.round, []);
		map.get(m.round).push(m);
	});
	[...map.values()].forEach(arr => arr.sort((a, b) => a.bracketSlot - b.bracketSlot));
	return [...map.entries()].sort(([a], [b]) => a - b);
}

// 매치가 BYE 인지 (한쪽만 비어있고 다른쪽이 있는 경우)
export function isByeMatch(match) {
	const oneEmpty = (match.team1Id == null) !== (match.team2Id == null);
	return oneEmpty;
}

// 빈 매치 (양쪽 다 비어있음 — 미정 슬롯)
export function isEmptyMatch(match) {
	return match.team1Id == null && match.team2Id == null;
}

// BO 점수 검증: 승자 점수가 정확히 ceil(bestOf/2), 패자는 0..그-1
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

// 어드민 여부 (CLAUDE.md: state.auth.user.reprGroup.isAdmin)
export function checkIsAdmin(user) {
	return Boolean(user && user.reprGroup && user.reprGroup.isAdmin);
}
