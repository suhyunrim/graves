import createCamilleAxios from 'app/utility/camilleAxios';

export const LOADING_LIST = '[TOURNAMENT] LOADING LIST';
export const GET_TOURNAMENT_LIST = '[TOURNAMENT] GET TOURNAMENT LIST';
export const LOADING_DETAIL = '[TOURNAMENT] LOADING DETAIL';
export const GET_TOURNAMENT_DETAIL = '[TOURNAMENT] GET TOURNAMENT DETAIL';
export const CLEAR_TOURNAMENT_DETAIL = '[TOURNAMENT] CLEAR TOURNAMENT DETAIL';
export const SET_ACTIVE_MEMBERS = '[TOURNAMENT] SET ACTIVE MEMBERS';
export const SET_RATING_MAP = '[TOURNAMENT] SET RATING MAP';

export function getTournamentList(groupId) {
	const request = createCamilleAxios().get(`/api/tournament/group/${groupId}`);
	return dispatch => {
		dispatch({ type: LOADING_LIST });
		return request.then(response =>
			dispatch({
				type: GET_TOURNAMENT_LIST,
				payload: response.data.tournaments || []
			})
		);
	};
}

export function getTournamentDetail(tournamentId) {
	const request = createCamilleAxios().get(`/api/tournament/${tournamentId}`);
	return dispatch => {
		dispatch({ type: LOADING_DETAIL });
		return request.then(response =>
			dispatch({
				type: GET_TOURNAMENT_DETAIL,
				payload: response.data
			})
		);
	};
}

export function clearTournamentDetail() {
	return { type: CLEAR_TOURNAMENT_DETAIL };
}

export function getActiveMembers(groupId) {
	return dispatch =>
		createCamilleAxios()
			.get(`/api/group/${groupId}/active-members`, { silentError: true })
			.then(response => {
				dispatch({ type: SET_ACTIVE_MEMBERS, payload: response.data.result || [] });
				return response.data.result;
			})
			.catch(() => {
				dispatch({ type: SET_ACTIVE_MEMBERS, payload: [] });
				return [];
			});
}

// puuid → rating 맵을 채워둔다. 토너먼트 detail 의 매치 승률/팀 평균 티어 계산용.
// 비로그인이거나 다른 그룹 사용자는 401/권한이 다를 수 있으니 silentError 로 흡수.
export function getGroupRatings(groupName) {
	return dispatch => {
		if (!groupName) {
			dispatch({ type: SET_RATING_MAP, payload: {} });
			return;
		}
		createCamilleAxios()
			.get('/api/group/ranking', { params: { groupName }, silentError: true })
			.then(response => {
				const list = response.data.result || [];
				const map = {};
				list.forEach(r => {
					if (r.puuid != null && typeof r.rating === 'number') map[r.puuid] = r.rating;
				});
				dispatch({ type: SET_RATING_MAP, payload: map });
			})
			.catch(() => {
				dispatch({ type: SET_RATING_MAP, payload: {} });
			});
	};
}

// === Mutations (return promise; caller handles success/error) ===

export function createTournament(body) {
	return createCamilleAxios().post('/api/tournament', body, { silentError: true });
}

export function deleteTournament(tournamentId) {
	return createCamilleAxios().delete(`/api/tournament/${tournamentId}`, { silentError: true });
}

export function createTeam(tournamentId, body) {
	return createCamilleAxios().post(`/api/tournament/${tournamentId}/teams`, body, { silentError: true });
}

export function updateTeam(tournamentId, teamId, body) {
	return createCamilleAxios().patch(`/api/tournament/${tournamentId}/teams/${teamId}`, body, { silentError: true });
}

export function deleteTeam(tournamentId, teamId) {
	return createCamilleAxios().delete(`/api/tournament/${tournamentId}/teams/${teamId}`, { silentError: true });
}

export function startTournament(tournamentId, slotMapping) {
	return createCamilleAxios().post(
		`/api/tournament/${tournamentId}/start`,
		{ slotMapping },
		{ silentError: true }
	);
}

export function updateMatchResult(matchId, team1Score, team2Score) {
	return createCamilleAxios().patch(
		`/api/tournament/matches/${matchId}`,
		{ team1Score, team2Score },
		{ silentError: true }
	);
}
