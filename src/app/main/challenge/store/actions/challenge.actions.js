import createCamilleAxios from 'app/utility/camilleAxios';

export const LOADING_LIST = '[CHALLENGE] LOADING LIST';
export const LOADING_LEADERBOARD = '[CHALLENGE] LOADING LEADERBOARD';
export const GET_CHALLENGE_LIST = '[CHALLENGE] GET CHALLENGE LIST';
export const GET_CHALLENGE_DETAIL = '[CHALLENGE] GET CHALLENGE DETAIL';
export const GET_LEADERBOARD = '[CHALLENGE] GET LEADERBOARD';
export const GET_USER_MATCHES = '[CHALLENGE] GET USER MATCHES';
export const TRY_SYNC = '[CHALLENGE] TRY SYNC';
export const SYNC_DONE = '[CHALLENGE] SYNC DONE';
export const SYNC_ERROR = '[CHALLENGE] SYNC ERROR';
export const GET_SYNC_STATUS = '[CHALLENGE] GET SYNC STATUS';
export const CLEAR_CHALLENGE_DETAIL = '[CHALLENGE] CLEAR CHALLENGE DETAIL';

export function getChallengeList(groupId) {
	const request = createCamilleAxios().get(`/api/challenge/${groupId}/list`);

	return dispatch => {
		dispatch({ type: LOADING_LIST });
		return request.then(response =>
			dispatch({
				type: GET_CHALLENGE_LIST,
				payload: response.data.result
			})
		);
	};
}

export function getChallengeDetail(groupId, challengeId) {
	const request = createCamilleAxios().get(`/api/challenge/${groupId}/${challengeId}`);

	return dispatch =>
		request.then(response =>
			dispatch({
				type: GET_CHALLENGE_DETAIL,
				payload: response.data.result
			})
		);
}

export function getLeaderboard(groupId, challengeId) {
	const request = createCamilleAxios().get(`/api/challenge/${groupId}/${challengeId}/leaderboard`);

	return dispatch => {
		dispatch({ type: LOADING_LEADERBOARD });
		return request.then(response =>
			dispatch({
				type: GET_LEADERBOARD,
				payload: response.data.result
			})
		);
	};
}

export function getUserMatches(groupId, challengeId, puuid) {
	const request = createCamilleAxios().get(`/api/challenge/${groupId}/${challengeId}/user/${puuid}/matches`);

	return dispatch =>
		request.then(response =>
			dispatch({
				type: GET_USER_MATCHES,
				payload: response.data.result
			})
		);
}


export function syncChallenge(groupId, challengeId) {
	return dispatch => {
		dispatch({ type: TRY_SYNC });

		const request = createCamilleAxios().post(`/api/challenge/${groupId}/${challengeId}/sync`, null, { silentError: true });

		request
			.then(response => {
				dispatch({ type: SYNC_DONE, payload: response.data.result });
			})
			.catch(error => {
				const status = error.response && error.response.status;
				const message = error.response && error.response.data ? error.response.data.result : null;
				dispatch({ type: SYNC_ERROR, payload: { status, message } });
			});
	};
}

export function getSyncStatus(groupId, challengeId) {
	const request = createCamilleAxios().get(`/api/challenge/${groupId}/${challengeId}/sync-status`, { silentError: true });

	return dispatch =>
		request
			.then(response =>
				dispatch({
					type: GET_SYNC_STATUS,
					payload: response.data.result
				})
			)
			.catch(() => {});
}

export function createChallenge(groupId, data) {
	return createCamilleAxios().post(`/api/challenge/${groupId}`, data);
}

export function updateChallenge(groupId, challengeId, data) {
	return createCamilleAxios().put(`/api/challenge/${groupId}/${challengeId}`, data);
}

export function cancelChallenge(groupId, challengeId) {
	return createCamilleAxios().post(`/api/challenge/${groupId}/${challengeId}/cancel`);
}

export function clearChallengeDetail() {
	return { type: CLEAR_CHALLENGE_DETAIL };
}
