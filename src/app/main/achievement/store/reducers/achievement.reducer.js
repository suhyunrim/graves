import * as Actions from '../actions';

const initialState = {
	achievements: [],
	loading: false
};

const achievementReducer = (state = initialState, action) => {
	switch (action.type) {
		case Actions.GET_ACHIEVEMENTS_LOADING: {
			return { ...state, loading: true };
		}
		case Actions.GET_ACHIEVEMENTS: {
			return { ...state, achievements: action.payload, loading: false };
		}
		default: {
			return state;
		}
	}
};

export default achievementReducer;
