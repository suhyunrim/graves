import createCamilleAxios from 'app/utility/camilleAxios';
import { isSampleMode } from 'app/main/sample/sampleStorage';
import { getSampleRankingData } from 'app/main/sample/sampleData';


export const GET_RANKING = '[RANKING] GET RANKING';
export const GET_RANKING_LOADING = '[RANKING] GET RANKING LOADING';
export const SET_SEARCH_TEXT = '[RANKING] SET SEARCH TEXT';
export const SET_PERIOD = '[RANKING] SET PERIOD';
export const SET_POSITION = '[RANKING] SET POSITION';
export const TRY_REFRESH_GROUP_RATING = '[RANKING] TRY REFRESH GROUP RATING';
export const REFRESH_GROUP_RATING = '[RANKING] REFRESH GROUP RATING';

export function getRanking(groupName, position) {
	if (isSampleMode()) {
		return dispatch => {
			dispatch({ type: GET_RANKING_LOADING });
			// 샘플 데이터엔 포지션 기록이 없으므로 필터 시 빈 결과
			const payload = position ? [] : getSampleRankingData();
			setTimeout(() => dispatch({ type: GET_RANKING, payload }), 300);
		};
	}

	const request = createCamilleAxios().get('/api/group/ranking', {
		params: position ? { groupName, position } : { groupName }
	});

	return dispatch => {
		dispatch({ type: GET_RANKING_LOADING });
		request.then(response =>
			dispatch({
				type: GET_RANKING,
				payload: response.data.result,
				myRanking: response.data.myRanking || null,
				// 포지션 판정 기준(그룹 방설정). 백엔드 배포 전엔 필드가 없을 수 있으므로 solo 폴백
				positionSource: response.data.positionSource ?? 'solo'
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

// position: 'TOP' | 'JUNGLE' | 'MIDDLE' | 'BOTTOM' | 'UTILITY' | null(전체)
export function setPosition(position) {
	return {
		type: SET_POSITION,
		position
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
