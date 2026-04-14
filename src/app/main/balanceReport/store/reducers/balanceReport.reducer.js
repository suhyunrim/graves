import * as Actions from '../actions';

const initialState = {
	report: null,
	loading: false,
	error: false
};

const balanceReportReducer = (state = initialState, action) => {
	switch (action.type) {
		case Actions.LOADING_REPORT: {
			return { ...state, loading: true, error: false };
		}
		case Actions.GET_REPORT: {
			return { ...state, report: action.payload, loading: false, error: false };
		}
		case Actions.REPORT_ERROR: {
			return { ...state, loading: false, error: true };
		}
		default: {
			return state;
		}
	}
};

export default balanceReportReducer;
