import * as Actions from '../actions';

const initialState = {
	list: [],
	loadingList: false,
	detail: null,
	leaderboard: [],
	loadingLeaderboard: false,
	myStats: null,
	userMatches: null,
	isSyncing: false,
	syncMessage: null,
	syncStatus: null,
	syncProgress: null
};

const challengeReducer = (state = initialState, action) => {
	switch (action.type) {
		case Actions.LOADING_LIST: {
			return { ...state, loadingList: true };
		}
		case Actions.LOADING_LEADERBOARD: {
			return { ...state, loadingLeaderboard: true };
		}
		case Actions.GET_CHALLENGE_LIST: {
			return { ...state, list: action.payload, loadingList: false };
		}
		case Actions.GET_CHALLENGE_DETAIL: {
			return {
				...state,
				detail: action.payload,
				syncStatus: action.payload.syncStatus || state.syncStatus,
				syncProgress: action.payload.syncProgress || state.syncProgress
			};
		}
		case Actions.GET_LEADERBOARD: {
			return { ...state, leaderboard: action.payload, loadingLeaderboard: false };
		}
		case Actions.GET_MY_STATS: {
			return { ...state, myStats: action.payload };
		}
		case Actions.GET_USER_MATCHES: {
			return { ...state, userMatches: action.payload };
		}
		case Actions.TRY_SYNC: {
			return { ...state, isSyncing: true, syncMessage: null };
		}
		case Actions.SYNC_DONE: {
			return { ...state, isSyncing: false, syncMessage: { type: 'success', data: action.payload }, syncStatus: 'syncing' };
		}
		case Actions.SYNC_ERROR: {
			return { ...state, isSyncing: false, syncMessage: { type: 'error', data: action.payload } };
		}
		case Actions.GET_SYNC_STATUS: {
			return {
				...state,
				syncStatus: action.payload.syncStatus,
				syncProgress: action.payload.syncProgress
			};
		}
		case Actions.CLEAR_CHALLENGE_DETAIL: {
			return { ...state, detail: null, leaderboard: [], myStats: null, userMatches: null, syncMessage: null, syncStatus: null, syncProgress: null };
		}
		default: {
			return state;
		}
	}
};

export default challengeReducer;
