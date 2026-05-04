import * as Actions from '../actions';

const initialState = {
	list: [],
	loadingList: false,
	detail: null,
	teams: [],
	matches: [],
	scrims: [],
	roundLabels: {},
	loadingDetail: false,
	activeMembers: []
};

const tournamentReducer = (state = initialState, action) => {
	switch (action.type) {
		case Actions.LOADING_LIST: {
			return { ...state, loadingList: true };
		}
		case Actions.GET_TOURNAMENT_LIST: {
			return { ...state, list: action.payload, loadingList: false };
		}
		case Actions.LOADING_DETAIL: {
			return { ...state, loadingDetail: true };
		}
		case Actions.GET_TOURNAMENT_DETAIL: {
			return {
				...state,
				detail: action.payload.tournament,
				teams: action.payload.teams || [],
				matches: action.payload.matches || [],
				scrims: action.payload.scrims || [],
				roundLabels: action.payload.roundLabels || {},
				loadingDetail: false
			};
		}
		case Actions.CLEAR_TOURNAMENT_DETAIL: {
			return {
				...state,
				detail: null,
				teams: [],
				matches: [],
				scrims: [],
				roundLabels: {},
				activeMembers: []
			};
		}
		case Actions.SET_ACTIVE_MEMBERS: {
			return { ...state, activeMembers: action.payload };
		}
		default: {
			return state;
		}
	}
};

export default tournamentReducer;
