import * as Actions from '../actions';

const initialState = {
	list: [],
	loadingList: false,
	detail: null,
	teams: [],
	matches: [],
	scrims: [],
	autoScrimEnabled: false,
	roundLabels: {},
	leaderboard: [],
	currentCandidate: null,
	loadingDetail: false,
	activeMembers: [],
	// 경매 강제 0원 자동 낙찰 연출용 transient 이벤트 + 중복 재생 방지(재생한 puuid 기록).
	autoAssign: null,
	autoAssignSeen: {}
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
				autoScrimEnabled: Boolean(action.payload.autoScrimEnabled),
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
				autoScrimEnabled: false,
				roundLabels: {},
				leaderboard: [],
				currentCandidate: null,
				activeMembers: [],
				autoAssign: null,
				autoAssignSeen: {}
			};
		}
		case Actions.SET_ACTIVE_MEMBERS: {
			return { ...state, activeMembers: action.payload };
		}
		case Actions.SET_AUTO_ASSIGN: {
			const puuid = action.payload && action.payload.puuid;
			// puuid 없거나 이미 재생한 후보면 무시 (어드민 API 응답 + 소켓 이중 트리거 dedup).
			if (!puuid || state.autoAssignSeen[puuid]) return state;
			return {
				...state,
				autoAssign: action.payload,
				autoAssignSeen: { ...state.autoAssignSeen, [puuid]: true }
			};
		}
		case Actions.CLEAR_AUTO_ASSIGN: {
			return { ...state, autoAssign: null };
		}
		default: {
			return state;
		}
	}
};

export default tournamentReducer;
