import createCamilleAxios from 'app/utility/camilleAxios';

// 즐겨찾기 — 로그인 유저별 + 그룹별 서버 저장. 대시보드/유저 프로필 양쪽에서 사용.

export function fetchFavorites(groupId) {
	return createCamilleAxios()
		.get('/api/favorites', { params: { groupId }, silentError: true })
		.then(res => res.data.result || []);
}

export function addFavorite(groupId, puuid) {
	return createCamilleAxios().post('/api/favorites', { groupId, puuid }, { silentError: true });
}

export function removeFavorite(groupId, puuid) {
	return createCamilleAxios().delete(`/api/favorites/${puuid}`, { params: { groupId }, silentError: true });
}
