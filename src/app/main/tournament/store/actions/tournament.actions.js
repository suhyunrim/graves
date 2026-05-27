import createCamilleAxios from 'app/utility/camilleAxios';

export const LOADING_LIST = '[TOURNAMENT] LOADING LIST';
export const GET_TOURNAMENT_LIST = '[TOURNAMENT] GET TOURNAMENT LIST';
export const LOADING_DETAIL = '[TOURNAMENT] LOADING DETAIL';
export const GET_TOURNAMENT_DETAIL = '[TOURNAMENT] GET TOURNAMENT DETAIL';
export const CLEAR_TOURNAMENT_DETAIL = '[TOURNAMENT] CLEAR TOURNAMENT DETAIL';
export const SET_ACTIVE_MEMBERS = '[TOURNAMENT] SET ACTIVE MEMBERS';

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

// 토너먼트 팀원/후보 선택기는 현역 + outsider(과거 우승자) 전원이 필요하므로 all-members 사용.
// (멘션/태그 자동완성 등 다른 곳은 active-members 유지 — profileApi 참고.)
export function getActiveMembers(groupId) {
	return dispatch =>
		createCamilleAxios()
			.get(`/api/group/${groupId}/all-members`, { silentError: true })
			.then(response => {
				dispatch({ type: SET_ACTIVE_MEMBERS, payload: response.data.result || [] });
				return response.data.result;
			})
			.catch(() => {
				dispatch({ type: SET_ACTIVE_MEMBERS, payload: [] });
				return [];
			});
}

// === Mutations (return promise; caller handles success/error) ===

export function createTournament(body) {
	return createCamilleAxios().post('/api/tournament', body, { silentError: true });
}

export function deleteTournament(tournamentId) {
	return createCamilleAxios().delete(`/api/tournament/${tournamentId}`, { silentError: true });
}

export function updateTournament(tournamentId, body) {
	return createCamilleAxios().patch(`/api/tournament/${tournamentId}`, body, { silentError: true });
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

export function startTournament(tournamentId, slotMapping, allowSingleTeam) {
	const body = allowSingleTeam ? { allowSingleTeam: true } : { slotMapping };
	return createCamilleAxios().post(
		`/api/tournament/${tournamentId}/start`,
		body,
		{ silentError: true }
	);
}

export function startAuction(tournamentId) {
	return createCamilleAxios().post(
		`/api/tournament/${tournamentId}/start-auction`,
		{},
		{ silentError: true }
	);
}

export function nextAuctionCandidate(tournamentId) {
	return createCamilleAxios().post(
		`/api/tournament/${tournamentId}/auction/next-candidate`,
		{},
		{ silentError: true }
	);
}

export function startAuctionBid(tournamentId) {
	return createCamilleAxios().post(
		`/api/tournament/${tournamentId}/auction/start-bid`,
		{},
		{ silentError: true }
	);
}

export function extendAuctionTime(tournamentId) {
	return createCamilleAxios().post(
		`/api/tournament/${tournamentId}/auction/extend-time`,
		{},
		{ silentError: true }
	);
}

export function endAuctionBid(tournamentId) {
	return createCamilleAxios().post(
		`/api/tournament/${tournamentId}/auction/end-bid`,
		{},
		{ silentError: true }
	);
}

export function placeAuctionBid(tournamentId, teamId, puuid, amount) {
	return createCamilleAxios().post(
		`/api/tournament/${tournamentId}/auction/bid`,
		{ teamId, puuid, amount },
		{ silentError: true }
	);
}

export function undoAuctionBid(tournamentId, teamId, puuid) {
	return createCamilleAxios().delete(
		`/api/tournament/${tournamentId}/auction/bid`,
		{ data: { teamId, puuid }, silentError: true }
	);
}

export function completeAuction(tournamentId) {
	return createCamilleAxios().post(
		`/api/tournament/${tournamentId}/auction/complete`,
		{},
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

export function updateMatchSchedule(matchId, scheduledAt) {
	return createCamilleAxios().patch(
		`/api/tournament/matches/${matchId}/schedule`,
		{ scheduledAt },
		{ silentError: true }
	);
}

export function createScrim(tournamentId, body) {
	return createCamilleAxios().post(`/api/tournament/${tournamentId}/scrims`, body, { silentError: true });
}

export function updateScrim(tournamentId, scrimId, body) {
	return createCamilleAxios().patch(`/api/tournament/${tournamentId}/scrims/${scrimId}`, body, { silentError: true });
}

export function deleteScrim(tournamentId, scrimId) {
	return createCamilleAxios().delete(`/api/tournament/${tournamentId}/scrims/${scrimId}`, { silentError: true });
}

export function putPredictions(tournamentId, predictions) {
	return createCamilleAxios().put(
		`/api/tournament/${tournamentId}/predictions`,
		{ predictions },
		{ silentError: true }
	);
}
