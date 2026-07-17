export const STATUS = {
	PREPARING: 'preparing',
	AUCTION: 'auction',
	IN_PROGRESS: 'in_progress',
	FINISHED: 'finished'
};

export const STATUS_LABELS = {
	[STATUS.PREPARING]: '준비 중',
	[STATUS.AUCTION]: '경매 중',
	[STATUS.IN_PROGRESS]: '진행 중',
	[STATUS.FINISHED]: '종료'
};

export const STATUS_COLORS = {
	[STATUS.PREPARING]: '#ffd700',
	[STATUS.AUCTION]: '#ff8c00',
	[STATUS.IN_PROGRESS]: '#00d4ff',
	[STATUS.FINISHED]: '#868e96'
};

export const TOURNAMENT_TYPE = {
	NORMAL: 'normal',
	AUCTION: 'auction'
};

export function isAuctionTournament(detail) {
	return detail && detail.type === TOURNAMENT_TYPE.AUCTION;
}

// 토너먼트 트로피 종류. 백엔드 enum 그대로 id 사용. 한국어 라벨/아이콘은 프론트 매핑.
// trophyType 이 null 이면 일반 우승 표시 (트로피 미지정).
export const TROPHY_TYPES = {
	worlds: { ko: '롤드컵', icon: '/assets/images/trophies/worlds.svg' },
	msi: { ko: 'MSI', icon: '/assets/images/trophies/msi.svg' },
	first_stand: { ko: 'First Stand', icon: '/assets/images/trophies/first_stand.svg' },
	ewc: { ko: 'EWC', icon: '/assets/images/trophies/ewc.svg' },
	lck: { ko: 'LCK', icon: '/assets/images/trophies/lck.svg' },
	kespa: { ko: 'KeSPA Cup', icon: '/assets/images/trophies/kespa.svg' }
};

// 트로피 등급. 인덱스가 곧 등급 (낮을수록 낮은 등급).
// T1 kespa(이벤트급) → T6 worlds(최상위/Summoner's Cup급).
// 토너먼트 생성/수정 그리드는 이 순서(낮음→높음) 그대로, 내정보 캐비닛은 역순(높음→낮음) 정렬.
export const TROPHY_TYPE_ORDER = ['kespa', 'first_stand', 'lck', 'ewc', 'msi', 'worlds'];

export function getTrophyLabel(type) {
	return type && TROPHY_TYPES[type] ? TROPHY_TYPES[type].ko : null;
}

export function getTrophyIcon(type) {
	return type && TROPHY_TYPES[type] ? TROPHY_TYPES[type].icon : null;
}

// 트로피 미지정(null) 은 -1 로 떨어져 정렬에서 가장 낮은 등급으로 처리됨.
export function getTrophyTier(type) {
	return type ? TROPHY_TYPE_ORDER.indexOf(type) : -1;
}

export const POSITIONS = ['top', 'jungle', 'mid', 'adc', 'support'];

export const POSITION_LABELS = {
	top: '탑',
	jungle: '정글',
	mid: '미드',
	adc: '원딜',
	support: '서폿'
};

// 팀 멤버를 탑→정글→미드→원딜→서폿 순으로 정렬. 포지션 미상(null 등)은 뒤로.
export function sortByPosition(members) {
	const rank = pos => {
		const i = POSITIONS.indexOf(pos);
		return i === -1 ? POSITIONS.length : i;
	};
	return [...(members || [])].sort((a, b) => rank(a.position) - rank(b.position));
}

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

// 내전 레이팅의 티어 내 LP (레이팅 1 = 4LP). 마스터+ 는 마스터 베이스 기준 누적 LP.
// RankingTable.getTierPoint / RatingChart 와 동일 규칙.
export function getTierPoint(rating) {
	if (rating == null) return null;
	const masterBase = TIER_BASES.find(([name]) => name === 'MASTER')[1];
	for (const [name, base] of TIER_BASES) {
		if (rating >= base) {
			if (isNonStepTier(name)) return Math.floor((rating - masterBase) * 4);
			return Math.floor(((rating - base) % 25) * 4);
		}
	}
	return 0;
}

export function getTierEmblemUrl(tierName) {
	if (!tierName) return null;
	return `/assets/images/ranked-emblems/Emblem_${tierName}.webp`;
}

// "GOLD II" → { tier: 'GOLD', short: 'G2', emblem: url }
// MASTER/GRANDMASTER/CHALLENGER 는 division 없이 약자만.
const RANK_DIV_NUM = { I: '1', II: '2', III: '3', IV: '4' };

export function parseRankTier(rankTier) {
	if (!rankTier) return null;
	const parts = String(rankTier).trim().split(/\s+/);
	const tier = (parts[0] || '').toUpperCase();
	const initial = TIER_INITIAL[tier];
	// 알 수 없는 티어 (예: "UNRANKED") 는 null 로 폴백해 호출부에서 "-" 처리.
	if (!initial) return null;
	if (isNonStepTier(tier)) {
		return { tier, short: initial, emblem: getTierEmblemUrl(tier) };
	}
	const divNum = parts[1] ? (RANK_DIV_NUM[parts[1].toUpperCase()] || '') : '';
	return { tier, short: `${initial}${divNum}`, emblem: getTierEmblemUrl(tier) };
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

// 수집기 자동 기록 세트 행. id가 대표값이라 단건 수정/삭제 API와 1:1 대응이 아님 → 프론트에서 관리 불가.
export function isCollectorScrim(scrim) {
	return scrim.recordedByDiscordId === 'collector';
}

export function canEditScrim(scrim, user, isAdmin) {
	if (isCollectorScrim(scrim)) return false;
	if (isAdmin) return true;
	const myDiscordId = user && user.data && user.data.discordUser && user.data.discordUser.discordId;
	return Boolean(myDiscordId && scrim.recordedByDiscordId === myDiscordId);
}

// 토너먼트 전체 라운드 수. 매치가 비면 null (preparing 단계).
export function getTotalRoundsFromMatches(matches) {
	if (!matches || matches.length === 0) return null;
	return matches.reduce((mx, x) => Math.max(mx, x.round || 0), 0);
}

// 팀의 토너먼트 진척 상태.
// status: 'champion' | 'runnerup' | 'eliminated' | 'alive' | 'notStarted'
// reachedRound: 도달한 가장 깊은 라운드 (이긴 다음 라운드 또는 탈락 라운드)
// eliminatedRound: 탈락한 라운드 (champion/alive 일 땐 null)
export function getTeamStanding(teamId, matches, championTeamId, totalRoundsArg) {
	const totalRounds = totalRoundsArg != null ? totalRoundsArg : getTotalRoundsFromMatches(matches);
	if (!teamId || !totalRounds) {
		return { status: 'notStarted', reachedRound: 0, eliminatedRound: null, totalRounds };
	}
	if (championTeamId && championTeamId === teamId) {
		return { status: 'champion', reachedRound: totalRounds + 1, eliminatedRound: null, totalRounds };
	}
	const teamMatches = (matches || [])
		.filter(m => m.team1Id === teamId || m.team2Id === teamId)
		.sort((a, b) => b.round - a.round);
	if (teamMatches.length === 0) {
		return { status: 'notStarted', reachedRound: 0, eliminatedRound: null, totalRounds };
	}
	const lostMatch = teamMatches.find(m => m.winnerTeamId != null && m.winnerTeamId !== teamId);
	if (lostMatch) {
		if (lostMatch.round === totalRounds) {
			return { status: 'runnerup', reachedRound: totalRounds, eliminatedRound: totalRounds, totalRounds };
		}
		return { status: 'eliminated', reachedRound: lostMatch.round, eliminatedRound: lostMatch.round, totalRounds };
	}
	// 패배 없음 → 진행중. 가장 높은 라운드 매치를 이긴 적 있으면 다음 라운드로 reach.
	const lastMatch = teamMatches[0];
	const wonLast = lastMatch.winnerTeamId === teamId;
	const reached = wonLast ? Math.min(lastMatch.round + 1, totalRounds) : lastMatch.round;
	return { status: 'alive', reachedRound: reached, eliminatedRound: null, totalRounds };
}

// 라운드 라벨 — 백엔드 roundLabels 가 있으면 우선, 없으면 계산 폴백.
// 9팀 토너먼트 같은 케이스에서 백엔드는 R1="예선" 이라 부르는데 계산은 "16강" 으로 어긋나는 걸 막음.
function stageLabel(round, totalRounds, roundLabels) {
	if (roundLabels && roundLabels[round]) return roundLabels[round];
	return roundLabelFor(round, totalRounds);
}

// 카드 배지 라벨. notStarted/null 이면 null 반환.
export function getStandingBadgeLabel(standing, roundLabels) {
	if (!standing || !standing.totalRounds) return null;
	const { status, eliminatedRound, reachedRound, totalRounds } = standing;
	if (status === 'champion') return '우승';
	if (status === 'runnerup') return '준우승';
	if (status === 'eliminated') {
		return `${stageLabel(eliminatedRound, totalRounds, roundLabels)} 탈락`;
	}
	if (status === 'alive') {
		if (reachedRound > totalRounds) return '결승 진출';
		return `${stageLabel(reachedRound, totalRounds, roundLabels)} 진출`;
	}
	return null;
}

// 카드 정렬 키 — 클수록 좋은 성적.
// champion > runnerup > 더 깊이 진출한 alive > 결승 가까이서 탈락 > notStarted
export function getStandingSortKey(standing) {
	if (!standing) return 0;
	const { status, reachedRound = 0, eliminatedRound = 0, totalRounds = 0 } = standing;
	if (status === 'champion') return 100000 + totalRounds;
	if (status === 'runnerup') return 90000 + totalRounds;
	if (status === 'alive') return 50000 + reachedRound;
	if (status === 'eliminated') return 10000 + eliminatedRound;
	return 0;
}

// 브래킷 매치 안에서 패배팀 옆에 붙는 인라인 라벨.
// 결승 패자 → '준우승', 그 외 → '{컬럼 라벨} 탈락'. 백엔드 roundLabels 우선 사용.
export function getMatchLoserLabel(round, totalRounds, roundLabels) {
	if (!round || !totalRounds) return null;
	if (round === totalRounds) return '준우승';
	return `${stageLabel(round, totalRounds, roundLabels)} 탈락`;
}

// 외부 호출용 라운드 라벨 (백엔드 roundLabels 우선, 폴백은 계산).
export function getStageLabel(round, totalRounds, roundLabels) {
	return stageLabel(round, totalRounds, roundLabels);
}
