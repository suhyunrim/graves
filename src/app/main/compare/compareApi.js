import createCamilleAxios from 'app/utility/camilleAxios';

// 유저 A vs B 비교. 인증 불필요 API지만 createCamilleAxios가 헤더를 붙여도 무방하다.
// silentError로 5xx 자동 리다이렉트를 끄고, 400(파라미터 누락/동일 puuid)·404(그룹에 없는 유저)를
// 호출부에서 err.response.status 로 분기한다.
export function fetchCompare(groupId, puuidA, puuidB) {
	return createCamilleAxios()
		.get('/api/user/compare', {
			params: { groupId, puuidA, puuidB },
			silentError: true
		})
		.then(res => res.data.result);
}

// 두 유저가 얽힌 경기 히스토리 페이징 + 양 팀 10명 로스터.
// page: 0-based, size: 기본 20 / 최대 50. 400(누락·동일)·404(그룹 밖)는 status로 분기.
export function fetchEntangledMatches(groupId, puuidA, puuidB, page, size) {
	return createCamilleAxios()
		.get('/api/user/compare/matches', {
			params: { groupId, puuidA, puuidB, page, size },
			silentError: true
		})
		.then(res => res.data.result);
}

export default fetchCompare;
