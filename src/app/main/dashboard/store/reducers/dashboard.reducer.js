import * as Actions from '../actions';

const initialState = {
	data: null,
	loading: false,
	error: null
};

const dashboardReducer = (state = initialState, action) => {
	switch (action.type) {
		case Actions.GET_DASHBOARD_LOADING: {
			return {
				...state,
				loading: true,
				error: null
			};
		}
		case Actions.GET_DASHBOARD: {
			return {
				...state,
				data: action.payload,
				loading: false,
				error: null
			};
		}
		case Actions.GET_DASHBOARD_ERROR: {
			return {
				...state,
				loading: false,
				error: action.payload
			};
		}
		default: {
			return state;
		}
	}
};

export default dashboardReducer;
