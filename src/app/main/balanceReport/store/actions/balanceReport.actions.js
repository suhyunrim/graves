import createCamilleAxios from 'app/utility/camilleAxios';

export const LOADING_REPORT = '[BALANCE_REPORT] LOADING';
export const GET_REPORT = '[BALANCE_REPORT] GET REPORT';
export const REPORT_ERROR = '[BALANCE_REPORT] ERROR';

export function getBalanceReport(groupId, startDate, endDate) {
	const request = createCamilleAxios().get(`/api/balance-report/${groupId}`, {
		params: { startDate, endDate }
	});

	return dispatch => {
		dispatch({ type: LOADING_REPORT });
		return request
			.then(response =>
				dispatch({
					type: GET_REPORT,
					payload: response.data
				})
			)
			.catch(() => dispatch({ type: REPORT_ERROR }));
	};
}
