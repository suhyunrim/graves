import * as Actions from '../actions';

const initialState = {
	scoreInfo: null,
	isRefreshingChampionScores: false
};

const myInfoReducer = (state = initialState, action) => {
	switch (action.type) {
		case Actions.GET_MYINFO: {
			return {
				...state,
				scoreInfo: action.payload.userInfo,
				// championScore: action.payload.championScore,
				summonerInfo: action.payload.summonerInfo
			};
		}
		case Actions.TRY_REFRESH_CHAMPION_SCORES: {
			return {
				...state,
				isRefreshingChampionScores: true
			};
		}
		case Actions.REFRESH_CHAMPION_SCORES: {
			return {
				...state,
				isRefreshingChampionScores: false
			};
		}
		default: {
			return state;
		}
	}
};

export default myInfoReducer;
