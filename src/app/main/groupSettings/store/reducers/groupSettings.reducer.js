import * as Actions from '../actions';

const initialState = {
	members: [],
	loading: false,
	searchText: ''
};

const groupSettingsReducer = (state = initialState, action) => {
	switch (action.type) {
		case Actions.GET_MEMBERS_LOADING: {
			return { ...state, loading: true };
		}
		case Actions.GET_MEMBERS: {
			return { ...state, members: action.payload, loading: false };
		}
		case Actions.SET_SEARCH_TEXT: {
			return { ...state, searchText: action.searchText };
		}
		default: {
			return state;
		}
	}
};

export default groupSettingsReducer;
