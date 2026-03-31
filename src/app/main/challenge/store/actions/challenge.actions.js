import createCamilleAxios from 'app/utility/camilleAxios';

export const GET_CHALLENGE_LIST = '[CHALLENGE] GET CHALLENGE LIST';
export const GET_CHALLENGE_DETAIL = '[CHALLENGE] GET CHALLENGE DETAIL';
export const GET_LEADERBOARD = '[CHALLENGE] GET LEADERBOARD';
export const GET_MY_STATS = '[CHALLENGE] GET MY STATS';
export const GET_USER_MATCHES = '[CHALLENGE] GET USER MATCHES';
export const TRY_SYNC = '[CHALLENGE] TRY SYNC';
export const SYNC_DONE = '[CHALLENGE] SYNC DONE';
export const SYNC_ERROR = '[CHALLENGE] SYNC ERROR';
export const CLEAR_CHALLENGE_DETAIL = '[CHALLENGE] CLEAR CHALLENGE DETAIL';

export function getChallengeList(groupId) {
	const request = createCamilleAxios().get(`/api/challenge/${groupId}/list`);

	return dispatch =>
		request.then(response =>
			dispatch({
				type: GET_CHALLENGE_LIST,
				payload: response.data.result
			})
		);
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

	return dispatch =>
		request.then(response =>
			dispatch({
				type: GET_LEADERBOARD,
				payload: response.data.result
			})
		);
}

export function getMyStats(groupId, challengeId) {
	const request = createCamilleAxios().get(`/api/challenge/${groupId}/${challengeId}/my-stats`);

	return dispatch =>
		request.then(response =>
			dispatch({
				type: GET_MY_STATS,
				payload: response.data.result
			})
		);
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

export function joinChallenge(groupId, challengeId) {
	const request = createCamilleAxios().post(`/api/challenge/${groupId}/${challengeId}/join`);

	return dispatch =>
		request.then(() => {
			dispatch(getChallengeDetail(groupId, challengeId));
			dispatch(getLeaderboard(groupId, challengeId));
		});
}

export function leaveChallenge(groupId, challengeId) {
	const request = createCamilleAxios().delete(`/api/challenge/${groupId}/${challengeId}/join`);

	return dispatch =>
		request.then(() => {
			dispatch(getChallengeDetail(groupId, challengeId));
			dispatch(getLeaderboard(groupId, challengeId));
		});
}

export function syncChallenge(groupId, challengeId) {
	return dispatch => {
		dispatch({ type: TRY_SYNC });

		const request = createCamilleAxios().post(`/api/challenge/${groupId}/${challengeId}/sync`);

		request
			.then(response => {
				dispatch({ type: SYNC_DONE, payload: response.data.result });
				dispatch(getLeaderboard(groupId, challengeId));
			})
			.catch(() => {
				dispatch({ type: SYNC_ERROR, payload: null });
			});
	};
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
