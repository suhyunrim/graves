import * as Actions from '../actions';

const initialState = {
	data: [],
	myRanking: null,
	loading: false,
	searchText: '',
	period: 'all',
	position: null,
	isRefreshingGroupRating: false
};

const rankingReducer = (state = initialState, action) => {
	switch (action.type) {
		case Actions.GET_RANKING_LOADING: {
			return {
				...state,
				loading: true
			};
		}
		case Actions.GET_RANKING: {
			return {
				...state,
				data: action.payload,
				myRanking: action.myRanking !== undefined ? action.myRanking : state.myRanking,
				loading: false
			};
		}
		case Actions.SET_SEARCH_TEXT: {
			return {
				...state,
				searchText: action.searchText
			};
		}
		case Actions.SET_PERIOD: {
			return {
				...state,
				period: action.period
			};
		}
		case Actions.SET_POSITION: {
			return {
				...state,
				position: action.position
			};
		}
		case Actions.TRY_REFRESH_GROUP_RATING: {
			return {
				...state,
				isRefreshingGroupRating: true
			};
		}
		case Actions.REFRESH_GROUP_RATING: {
			return {
				...state,
				isRefreshingGroupRating: false
			};
		}
		default: {
			return state;
		}
	}
};

export default rankingReducer;
