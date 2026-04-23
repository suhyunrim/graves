import * as Actions from '../actions';

const initialState = {
	dashboard: null,
	dashboardLoading: false,
	categories: {},
	ranking: null,
	rankingLoading: false,
	userRanking: null,
	userRankingLoading: false
};

const achievementDashboardReducer = (state = initialState, action) => {
	switch (action.type) {
		case Actions.GET_DASHBOARD_LOADING: {
			return { ...state, dashboardLoading: true };
		}
		case Actions.GET_DASHBOARD: {
			return { ...state, dashboard: action.payload, dashboardLoading: false };
		}
		case Actions.GET_DASHBOARD_ERROR: {
			return { ...state, dashboardLoading: false };
		}
		case Actions.GET_CATEGORY_LOADING: {
			return {
				...state,
				categories: {
					...state.categories,
					[action.payload.category]: {
						...(state.categories[action.payload.category] || {}),
						loading: true
					}
				}
			};
		}
		case Actions.GET_CATEGORY: {
			return {
				...state,
				categories: {
					...state.categories,
					[action.payload.category]: {
						data: action.payload.data,
						loading: false
					}
				}
			};
		}
		case Actions.GET_CATEGORY_ERROR: {
			return {
				...state,
				categories: {
					...state.categories,
					[action.payload.category]: {
						data: null,
						loading: false,
						error: action.payload.error
					}
				}
			};
		}
		case Actions.GET_RANKING_LOADING: {
			return { ...state, rankingLoading: true };
		}
		case Actions.GET_RANKING: {
			return { ...state, ranking: action.payload, rankingLoading: false };
		}
		case Actions.GET_RANKING_ERROR: {
			return { ...state, rankingLoading: false };
		}
		case Actions.GET_USER_RANKING_LOADING: {
			return { ...state, userRankingLoading: true };
		}
		case Actions.GET_USER_RANKING: {
			return { ...state, userRanking: action.payload, userRankingLoading: false };
		}
		case Actions.GET_USER_RANKING_ERROR: {
			return { ...state, userRankingLoading: false };
		}
		case Actions.INVALIDATE_CACHE: {
			return initialState;
		}
		default: {
			return state;
		}
	}
};

export default achievementDashboardReducer;
