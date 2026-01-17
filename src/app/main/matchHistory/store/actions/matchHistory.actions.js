import createCamilleAxios from 'app/utility/camilleAxios';

export const GET_MATCH_HISTORY = '[MATCH_HISTORY] GET MATCH HISTORY';

export function getMatchHistory(groupId) {
	const request = createCamilleAxios().get(`/api/match/history/${groupId}`);

	return dispatch =>
		request.then(response => {
			if (response.status !== 200) return;

			dispatch({
				type: GET_MATCH_HISTORY,
				payload: response.data
			});
		});
}
