import createCamilleAxios from 'app/utility/camilleAxios';
import { isSampleMode } from 'app/main/sample/sampleStorage';
import { getSampleMatchHistoryData } from 'app/main/sample/sampleData';

export const GET_MATCH_HISTORY = '[MATCH_HISTORY] GET MATCH HISTORY';
export const SET_SEARCH_TEXT = '[MATCH_HISTORY] SET SEARCH TEXT';
export const DUPLICATE_MATCH = '[MATCH_HISTORY] DUPLICATE MATCH';
export const CANCEL_MATCH = '[MATCH_HISTORY] CANCEL MATCH';

export function setSearchText(event) {
	return {
		type: SET_SEARCH_TEXT,
		searchText: event.target.value
	};
}

export function getMatchHistory(groupId, page = 1, limit = 10, search = '') {
	if (isSampleMode()) {
		return dispatch => {
			setTimeout(() => {
				dispatch({
					type: GET_MATCH_HISTORY,
					payload: getSampleMatchHistoryData(page, limit)
				});
			}, 300);
		};
	}

	const params = { page, limit };
	if (search) params.search = search;

	const request = createCamilleAxios().get(`/api/match/history/${groupId}`, { params });

	return dispatch =>
		request.then(response => {
			if (response.status !== 200) return;

			dispatch({
				type: GET_MATCH_HISTORY,
				payload: response.data
			});
		});
}

export function duplicateMatch(groupId, matchId, date, winTeam) {
	if (isSampleMode()) {
		return () => Promise.resolve({ success: true });
	}

	const request = createCamilleAxios().post(`/api/match/${groupId}/duplicate`, { matchId, date, winTeam });

	return dispatch =>
		request.then(response => {
			dispatch({
				type: DUPLICATE_MATCH,
				payload: response.data
			});
			return response.data;
		});
}

export function cancelMatch(groupId, matchId) {
	if (isSampleMode()) {
		return () => Promise.resolve({ success: true });
	}

	return dispatch => {
		dispatch({ type: CANCEL_MATCH, payload: { matchId } });

		return createCamilleAxios().post(`/api/match/${groupId}/cancel`, { matchId });
	};
}
