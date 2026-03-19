import createCamilleAxios from 'app/utility/camilleAxios';

export const GET_HONOR_RANKING = '[HONOR RANKING] GET HONOR RANKING';
export const SET_SEARCH_TEXT = '[HONOR RANKING] SET SEARCH TEXT';
export const SET_PERIOD = '[HONOR RANKING] SET PERIOD';

export function getHonorRanking(groupId, since, until) {
	const params = { limit: 50 };
	if (since) {
		params.since = since;
	}
	if (until) {
		params.until = until;
	}

	const request = createCamilleAxios().get(`/api/honor/ranking/${groupId}`, { params });

	return dispatch =>
		request.then(response =>
			dispatch({
				type: GET_HONOR_RANKING,
				payload: response.data
			})
		);
}

export function setSearchText(event) {
	return {
		type: SET_SEARCH_TEXT,
		searchText: event.target.value
	};
}

export function setPeriod(period) {
	return {
		type: SET_PERIOD,
		period
	};
}
