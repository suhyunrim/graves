// 내전 챔피언 뱃지 판정 (카드/다이얼로그 공용)
// - 장인: 10판 이상 & 승률 60% 이상
// - 원챔: 5판 이상 & 수집 판수의 절반 이상을 한 챔피언으로 플레이 (소표본 남발 방지)
export const getChampBadges = (champ, totalGames) => {
	const badges = [];
	if (champ.games >= 10 && champ.winRate >= 60) {
		badges.push({ key: 'master', label: '장인', color: '#ffd700' });
	}
	if (champ.games >= 5 && totalGames > 0 && champ.games / totalGames >= 0.5) {
		badges.push({ key: 'onetrick', label: '원챔', color: '#00d4ff' });
	}
	return badges;
};

export default getChampBadges;
