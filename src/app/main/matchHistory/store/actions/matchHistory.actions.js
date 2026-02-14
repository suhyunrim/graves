import createCamilleAxios from 'app/utility/camilleAxios';

export const GET_MATCH_HISTORY = '[MATCH_HISTORY] GET MATCH HISTORY';
export const SET_SEARCH_TEXT = '[MATCH_HISTORY] SET SEARCH TEXT';

export function setSearchText(event) {
	return {
		type: SET_SEARCH_TEXT,
		searchText: event.target.value
	};
}

export function getMatchHistory(groupId, page = 1, limit = 10, search = '') {
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
