import createCamilleAxios from 'app/utility/camilleAxios';

export const GET_DASHBOARD = '[DASHBOARD] GET DASHBOARD';
export const GET_DASHBOARD_LOADING = '[DASHBOARD] GET DASHBOARD LOADING';
export const GET_DASHBOARD_ERROR = '[DASHBOARD] GET DASHBOARD ERROR';

export function getDashboard(groupId, month) {
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
