import * as Actions from '../actions/auditLog.actions';

const initialState = {
	logs: [],
	total: 0,
	page: 1,
	limit: 50,
	loading: false
};

const auditLogReducer = (state = initialState, action) => {
	switch (action.type) {
		case Actions.GET_AUDIT_LOGS_LOADING: {
			return { ...state, loading: true };
		}
		case Actions.GET_AUDIT_LOGS: {
			return {
				...state,
				logs: action.payload.logs,
				total: action.payload.total,
				page: action.payload.page,
				limit: action.payload.limit,
				loading: false
			};
		}
		default: {
			return state;
		}
	}
};

export default auditLogReducer;
