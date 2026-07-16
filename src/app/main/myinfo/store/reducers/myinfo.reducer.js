import * as Actions from '../actions';

const initialState = {
	scoreInfo: null,
	isRefreshingChampionScores: false,
	statusMessage: null,
	internalStats: null
};

const myInfoReducer = (state = initialState, action) => {
	switch (action.type) {
		case Actions.GET_MYINFO: {
			const stats = action.payload.detailedStats || {};
			return {
				...state,
				scoreInfo: action.payload.userInfo,
				// championScore: action.payload.championScore,
				summonerInfo: action.payload.summonerInfo,
				topTeammates: stats.topTeammates || [],
				topOpponents: stats.topOpponents || [],
				bestTeammates: stats.bestTeammates || [],
				recentGames: stats.recentGames || 0,
				recentWins: stats.recentWins || 0,
				recentWinRate: stats.recentWinRate || 0,
				// 최근 최대 10판 승패 boolean 배열 (시간순 — 마지막 원소가 가장 최근)
				recentResults: stats.recentResults || [],
				maxWinStreak: stats.maxWinStreak || 0,
				maxLoseStreak: stats.maxLoseStreak || 0,
				bestOpponents: stats.bestOpponents || [],
				worstOpponents: stats.worstOpponents || [],
				ratingHistory: stats.ratingHistory || [],
				// 그룹에 따라 없을 수 있음: detailedStats가 null이거나(완료 내전 없음)
				// 10인 전원 포지션 지정 매치가 없으면 positionStats 자체가 null로 내려옴.
				positionStats: stats.positionStats || null,
				honorStats: action.payload.honorStats || null,
				subAccount: action.payload.subAccount || null,
				statusMessage: action.payload.statusMessage || null,
				tournamentChampionships: action.payload.tournamentChampionships || [],
				mostChampions: action.payload.mostChampions || []
			};
		}
		case Actions.GET_INTERNAL_STATS: {
			return {
				...state,
				internalStats: action.payload
			};
		}
		case Actions.SET_SUB_ACCOUNT: {
			return {
				...state,
				subAccount: action.payload
			};
		}
		case Actions.SET_STATUS_MESSAGE: {
			return {
				...state,
				statusMessage: action.payload
			};
		}
		case Actions.TRY_REFRESH_CHAMPION_SCORES: {
			return {
				...state,
				isRefreshingChampionScores: true
			};
		}
		case Actions.REFRESH_CHAMPION_SCORES: {
			return {
				...state,
				isRefreshingChampionScores: false
			};
		}
		default: {
			return state;
		}
	}
};

export default myInfoReducer;
