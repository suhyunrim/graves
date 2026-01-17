import * as Actions from '../actions';

const initialState = {
	matches: [],
	searchText: ''
};

const matchHistoryReducer = (state = initialState, action) => {
	switch (action.type) {
		case Actions.GET_MATCH_HISTORY: {
			return {
				...state,
				matches: action.payload
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
