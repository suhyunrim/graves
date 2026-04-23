import createCamilleAxios from 'app/utility/camilleAxios';

export const GET_DASHBOARD_LOADING = '[ACHIEVEMENT_DASHBOARD] GET DASHBOARD LOADING';
export const GET_DASHBOARD = '[ACHIEVEMENT_DASHBOARD] GET DASHBOARD';
export const GET_DASHBOARD_ERROR = '[ACHIEVEMENT_DASHBOARD] GET DASHBOARD ERROR';

export const GET_CATEGORY_LOADING = '[ACHIEVEMENT_DASHBOARD] GET CATEGORY LOADING';
export const GET_CATEGORY = '[ACHIEVEMENT_DASHBOARD] GET CATEGORY';
export const GET_CATEGORY_ERROR = '[ACHIEVEMENT_DASHBOARD] GET CATEGORY ERROR';

export const GET_RANKING_LOADING = '[ACHIEVEMENT_DASHBOARD] GET RANKING LOADING';
export const GET_RANKING = '[ACHIEVEMENT_DASHBOARD] GET RANKING';
export const GET_RANKING_ERROR = '[ACHIEVEMENT_DASHBOARD] GET RANKING ERROR';

export const GET_USER_RANKING_LOADING = '[ACHIEVEMENT_DASHBOARD] GET USER RANKING LOADING';
export const GET_USER_RANKING = '[ACHIEVEMENT_DASHBOARD] GET USER RANKING';
export const GET_USER_RANKING_ERROR = '[ACHIEVEMENT_DASHBOARD] GET USER RANKING ERROR';

export const INVALIDATE_CACHE = '[ACHIEVEMENT_DASHBOARD] INVALIDATE CACHE';

export function getDashboard(groupId) {
	return dispatch => {
		dispatch({ type: GET_DASHBOARD_LOADING });
		return createCamilleAxios()
			.get(`/api/achievement/${groupId}/dashboard`)
			.then(response => dispatch({ type: GET_DASHBOARD, payload: response.data.result }))
			.catch(err => dispatch({ type: GET_DASHBOARD_ERROR, payload: err?.message || 'error' }));
	};
}

export function getCategory(groupId, category) {
	return (dispatch, getState) => {
		const cached = getState().AchievementDashboard?.achievementDashboard?.categories?.[category];
		if (cached && cached.data) {
			return Promise.resolve();
		}
		dispatch({ type: GET_CATEGORY_LOADING, payload: { category } });
		return createCamilleAxios()
			.get(`/api/achievement/${groupId}/category/${category}`)
			.then(response => dispatch({ type: GET_CATEGORY, payload: { category, data: response.data.result } }))
			.catch(err => dispatch({ type: GET_CATEGORY_ERROR, payload: { category, error: err?.message || 'error' } }));
	};
}

export function getAchievementRanking(groupId, achievementId) {
	return dispatch => {
		dispatch({ type: GET_RANKING_LOADING });
		return createCamilleAxios()
			.get(`/api/achievement/${groupId}/ranking/${achievementId}`)
			.then(response => dispatch({ type: GET_RANKING, payload: response.data.result }))
			.catch(err => dispatch({ type: GET_RANKING_ERROR, payload: err?.message || 'error' }));
	};
}

export function getUserRanking(groupId) {
	return dispatch => {
		dispatch({ type: GET_USER_RANKING_LOADING });
		return createCamilleAxios()
			.get(`/api/achievement/${groupId}/user-ranking`)
			.then(response => dispatch({ type: GET_USER_RANKING, payload: response.data.result }))
			.catch(err => dispatch({ type: GET_USER_RANKING_ERROR, payload: err?.message || 'error' }));
	};
}

export function invalidateCache() {
	return { type: INVALIDATE_CACHE };
}
