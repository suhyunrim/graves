import * as Actions from '../actions/groupInfo.actions';

const initialState = {
	info: null,
	loading: false
};

const groupInfoReducer = (state = initialState, action) => {
	switch (action.type) {
		case Actions.GET_GROUP_INFO_LOADING: {
			return { ...state, loading: true };
		}
		case Actions.GET_GROUP_INFO: {
			return { ...state, info: action.payload, loading: false };
		}
		default: {
			return state;
		}
	}
};

export default groupInfoReducer;
