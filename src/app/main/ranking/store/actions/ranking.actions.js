import createCamilleAxios from 'app/utility/camilleAxios';

const qs = require('querystring');

export const GET_RANKING = '[RANKING] GET RANKING';
export const SET_SEARCH_TEXT = '[RANKING] SET SEARCH TEXT';
export const SET_PERIOD = '[RANKING] SET PERIOD';
export const TRY_REFRESH_GROUP_RATING = '[RANKING] TRY REFRESH GROUP RATING';
export const REFRESH_GROUP_RATING = '[RANKING] REFRESH GROUP RATING';

export function getRanking(groupName) {
	const request = createCamilleAxios().get('/api/group/ranking', { params: { groupName } });

	return dispatch =>
		request.then(response =>
			dispatch({
				type: GET_RANKING,
				payload: response.data.result
			})
		);
}

export function getPeriodRanking(groupId, startDate, endDate) {
	const request = createCamilleAxios().get('/api/group/ranking/period', { params: { groupId, startDate, endDate } });

	return dispatch =>
		request.then(response =>
			dispatch({
				type: GET_RANKING,
				payload: response.data.result
			})
		);
}

export function setPeriod(period) {
	return {
		type: SET_PERIOD,
		period
	};
}

export function setSearchText(event) {
	return {
		type: SET_SEARCH_TEXT,
		searchText: event.target.value
	};
}

export function refreshGroupRating(groupName) {
	return dispatch => {
		dispatch({
			type: TRY_REFRESH_GROUP_RATING
		});

		const request = createCamilleAxios().post('/api/group/refresh-rating', qs.stringify({ groupName }));

		request.finally(() => {
			dispatch({
				type: REFRESH_GROUP_RATING
			});
		});
	};
}
