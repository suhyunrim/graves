import * as Actions from '../actions';

const initialState = {
	data: [],
	loading: false,
	searchText: '',
	period: 'all',
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
