/**
 * 페이지 청크 idle prefetch
 * 브라우저가 한가할 때 주요 페이지 청크를 미리 다운로드한다.
 * 우선순위: 자주 방문하는 페이지부터.
 */
const routeImports = [
	// 1순위: 핵심 페이지
	() => import('app/main/dashboard/Dashboard'),
	() => import('app/main/myinfo/MyInfo'),
	() => import('app/main/ranking/Ranking'),
	// 2순위: 자주 사용
	() => import('app/main/matchHistory/MatchHistory'),
	() => import('app/main/honorRanking/HonorRanking'),
	() => import('app/main/challenge/ChallengeList'),
	() => import('app/main/challenge/ChallengeDetail'),
	// 3순위: 가끔
	() => import('app/main/balanceReport/BalanceReport'),
	() => import('app/main/challenge/ChallengeUserMatches'),
	() => import('app/main/achievement/Achievement'),
	() => import('app/main/achievementDashboard/AchievementDashboard'),
	// 4순위: 드물게
	() => import('app/main/groupSettings/GroupSettings'),
	() => import('app/main/releaseNotes/ReleaseNotes')
];

let prefetched = false;

export function prefetchRoutes() {
	if (prefetched) return;
	prefetched = true;

	const schedule = typeof requestIdleCallback === 'function'
		? requestIdleCallback
		: (cb) => setTimeout(cb, 200);

	routeImports.forEach((importFn, index) => {
		schedule(() => importFn(), { timeout: 3000 + index * 500 });
	});
}
