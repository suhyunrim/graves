import createCamilleAxios from 'app/utility/camilleAxios';
import { isSampleMode } from 'app/main/sample/sampleStorage';
import { getSampleDashboardData } from 'app/main/sample/sampleData';

export const GET_DASHBOARD = '[DASHBOARD] GET DASHBOARD';
export const GET_DASHBOARD_LOADING = '[DASHBOARD] GET DASHBOARD LOADING';
export const GET_DASHBOARD_ERROR = '[DASHBOARD] GET DASHBOARD ERROR';

export function getDashboard(groupId, month) {
	if (isSampleMode()) {
		return dispatch => {
			dispatch({ type: GET_DASHBOARD_LOADING });
			setTimeout(() => dispatch({ type: GET_DASHBOARD, payload: getSampleDashboardData(month) }), 300);
		};
	}

	return dispatch => {
		dispatch({ type: GET_DASHBOARD_LOADING });

		const request = createCamilleAxios().get(`/api/dashboard/${groupId}`, {
			params: { month }
		});

		return request
			.then(response =>
				dispatch({
					type: GET_DASHBOARD,
					payload: response.data
				})
			)
			.catch(error =>
				dispatch({
					type: GET_DASHBOARD_ERROR,
					payload: error
				})
			);
	};
}
