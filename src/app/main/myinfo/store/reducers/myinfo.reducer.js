import * as Actions from '../actions';

const initialState = {
	scoreInfo: null,
	isRefreshingChampionScores: false
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
				bestTeammate: stats.bestTeammate || null,
				recentGames: stats.recentGames || 0,
				recentWins: stats.recentWins || 0,
				recentWinRate: stats.recentWinRate || 0,
				maxWinStreak: stats.maxWinStreak || 0,
				maxLoseStreak: stats.maxLoseStreak || 0,
				bestOpponent: stats.bestOpponent || null,
				worstOpponent: stats.worstOpponent || null,
				ratingHistory: stats.ratingHistory || [],
				honorStats: action.payload.honorStats || null,
				subAccount: action.payload.subAccount || null
			};
		}
		case Actions.SET_SUB_ACCOUNT: {
			return {
				...state,
				subAccount: action.payload
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
