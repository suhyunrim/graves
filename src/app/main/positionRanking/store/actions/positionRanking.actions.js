import createCamilleAxios from 'app/utility/camilleAxios';
import { isSampleMode } from 'app/main/sample/sampleStorage';

export const GET_POSITION_RANKING = '[POSITION RANKING] GET POSITION RANKING';
export const GET_POSITION_RANKING_LOADING = '[POSITION RANKING] GET POSITION RANKING LOADING';
export const SET_POSITION = '[POSITION RANKING] SET POSITION';

// 샘플(데모) 모드엔 포지션 기록이 없으므로 전부 빈 배열 → "포지션이 기록된 내전이 아직 없습니다" 상태로 표시
const EMPTY_RESULT = { TOP: [], JUNGLE: [], MIDDLE: [], BOTTOM: [], UTILITY: [] };

export function getPositionRanking(groupId) {
	if (isSampleMode()) {
		return dispatch => {
			dispatch({ type: GET_POSITION_RANKING_LOADING });
			setTimeout(() => dispatch({ type: GET_POSITION_RANKING, payload: EMPTY_RESULT, myRanking: null }), 300);
		};
	}

	const request = createCamilleAxios().get('/api/group/ranking/position', { params: { groupId } });

	return dispatch => {
		dispatch({ type: GET_POSITION_RANKING_LOADING });
		request.then(response =>
			dispatch({
				type: GET_POSITION_RANKING,
				payload: response.data.result,
				myRanking: response.data.myRanking || null
			})
		);
	};
}

export function setPosition(position) {
	return {
		type: SET_POSITION,
		position
	};
}
