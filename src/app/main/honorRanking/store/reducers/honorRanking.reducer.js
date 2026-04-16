import * as Actions from '../actions';

const initialState = {
	data: null,
	searchText: '',
	period: 'all'
};

const honorRankingReducer = (state = initialState, action) => {
	switch (action.type) {
		case Actions.GET_HONOR_RANKING: {
			return { ...state, data: action.payload };
		}
		case Actions.SET_SEARCH_TEXT: {
			return { ...state, searchText: action.searchText };
		}
		case Actions.SET_PERIOD: {
			return { ...state, period: action.period };
		}
		default:
			return state;
	}
};

export default honorRankingReducer;
