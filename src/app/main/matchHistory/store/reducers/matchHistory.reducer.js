import * as Actions from '../actions';

const initialState = {
	matches: []
};

const matchHistoryReducer = (state = initialState, action) => {
	switch (action.type) {
		case Actions.GET_MATCH_HISTORY: {
			return {
				...state,
				matches: action.payload
			};
		}
		default: {
			return state;
		}
	}
};

export default matchHistoryReducer;
