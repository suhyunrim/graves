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

export function createScrim(tournamentId, body) {
	return createCamilleAxios().post(`/api/tournament/${tournamentId}/scrims`, body, { silentError: true });
}

export function updateScrim(tournamentId, scrimId, body) {
	return createCamilleAxios().patch(`/api/tournament/${tournamentId}/scrims/${scrimId}`, body, { silentError: true });
}

export function deleteScrim(tournamentId, scrimId) {
	return createCamilleAxios().delete(`/api/tournament/${tournamentId}/scrims/${scrimId}`, { silentError: true });
}
