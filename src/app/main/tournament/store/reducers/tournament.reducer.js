import * as Actions from '../actions';

const initialState = {
	list: [],
	loadingList: false,
	detail: null,
	teams: [],
	matches: [],
	scrims: [],
	roundLabels: {},
	leaderboard: [],
	currentCandidate: null,
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
			const { tournament } = action.payload;
			// predictionsLocked / leaderboard 가 top-level 로 올지 tournament 안에 묻혀있을지
			// 명세에 명시 안 되어 있어 양쪽 다 받아서 detail / leaderboard 로 정규화한다.
			const predictionsLocked = (tournament && tournament.predictionsLocked != null)
				? tournament.predictionsLocked
				: action.payload.predictionsLocked;
			const leaderboard = action.payload.leaderboard
				|| (tournament && tournament.leaderboard)
				|| [];
			return {
				...state,
				detail: tournament ? { ...tournament, predictionsLocked: Boolean(predictionsLocked) } : null,
				teams: action.payload.teams || [],
				matches: action.payload.matches || [],
				scrims: action.payload.scrims || [],
				roundLabels: action.payload.roundLabels || {},
				leaderboard,
				currentCandidate: action.payload.currentCandidate || null,
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
				leaderboard: [],
				currentCandidate: null,
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
