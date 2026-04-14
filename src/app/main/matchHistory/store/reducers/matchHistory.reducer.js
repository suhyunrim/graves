import * as Actions from '../actions';

const initialState = {
	matches: null,
	total: 0,
	page: 1,
	totalPages: 0,
	searchText: ''
};

const matchHistoryReducer = (state = initialState, action) => {
	switch (action.type) {
		case Actions.GET_MATCH_HISTORY: {
			return {
				...state,
				matches: action.payload.matches,
				total: action.payload.total,
				page: action.payload.page,
				totalPages: action.payload.totalPages
			};
		}
		case Actions.SET_SEARCH_TEXT: {
			return {
				...state,
				searchText: action.searchText
			};
		}
		default: {
			return state;
		}
	}
};

export default matchHistoryReducer;
