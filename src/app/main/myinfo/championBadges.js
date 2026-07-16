// 지표별 성과 구간 → 색상 (KDA 평점 색상 체계와 동일: 골드/시안/흰색/회색)
// 내전(혼성 실력대) 기준 컷. [최상, 상, 보통] 순.
const METRIC_TIERS = {
	dpm: [900, 700, 500],
	visionPerMin: [2.5, 2.0, 1.5],
	killParticipation: [70, 60, 50],
	objectiveShare: [65, 55, 45]
};

export const getMetricColor = (metricKey, value) => {
	const tiers = METRIC_TIERS[metricKey];
	if (!tiers || value == null) return undefined;
	if (value >= tiers[0]) return '#ffd700';
	if (value >= tiers[1]) return '#00d4ff';
	if (value >= tiers[2]) return 'rgba(255, 255, 255, 0.85)';
	return 'rgba(255, 255, 255, 0.5)';
};

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
