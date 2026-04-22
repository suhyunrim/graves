import createCamilleAxios from 'app/utility/camilleAxios';
import { isSampleMode } from 'app/main/sample/sampleStorage';
import { getSampleRankingData } from 'app/main/sample/sampleData';


export const GET_RANKING = '[RANKING] GET RANKING';
export const GET_RANKING_LOADING = '[RANKING] GET RANKING LOADING';
export const SET_SEARCH_TEXT = '[RANKING] SET SEARCH TEXT';
export const SET_PERIOD = '[RANKING] SET PERIOD';
export const TRY_REFRESH_GROUP_RATING = '[RANKING] TRY REFRESH GROUP RATING';
export const REFRESH_GROUP_RATING = '[RANKING] REFRESH GROUP RATING';

export function getRanking(groupName) {
	if (isSampleMode()) {
		return dispatch => {
			dispatch({ type: GET_RANKING_LOADING });
			setTimeout(() => dispatch({ type: GET_RANKING, payload: getSampleRankingData() }), 300);
		};
	}

	const request = createCamilleAxios().get('/api/group/ranking', { params: { groupName } });

	return dispatch => {
		dispatch({ type: GET_RANKING_LOADING });
		request.then(response =>
			dispatch({
				type: GET_RANKING,
				payload: response.data.result,
				myRanking: response.data.myRanking || null
			})
		);
	};
}

export function getPeriodRanking(groupId, startDate, endDate) {
	if (isSampleMode()) {
		return dispatch => {
			dispatch({ type: GET_RANKING_LOADING });
			setTimeout(() => dispatch({ type: GET_RANKING, payload: getSampleRankingData() }), 300);
		};
	}

	const request = createCamilleAxios().get('/api/group/ranking/period', { params: { groupId, startDate, endDate } });

	return dispatch => {
		dispatch({ type: GET_RANKING_LOADING });
		request.then(response =>
			dispatch({
				type: GET_RANKING,
				payload: response.data.result,
				myRanking: response.data.myRanking || null
			})
		);
	};
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
	if (isSampleMode()) {
		return dispatch => {
			dispatch({ type: TRY_REFRESH_GROUP_RATING });
			setTimeout(() => dispatch({ type: REFRESH_GROUP_RATING }), 500);
		};
	}

	return dispatch => {
		dispatch({
			type: TRY_REFRESH_GROUP_RATING
		});

		const request = createCamilleAxios().post('/api/group/refresh-rating', new URLSearchParams({ groupName }).toString());

		request.finally(() => {
			dispatch({
				type: REFRESH_GROUP_RATING
			});
		});
	};
}
