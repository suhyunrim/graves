import createCamilleAxios from 'app/utility/camilleAxios';
import { isSampleMode } from 'app/main/sample/sampleStorage';
import { getSampleBalanceReportData } from 'app/main/sample/sampleData';

export const LOADING_REPORT = '[BALANCE_REPORT] LOADING';
export const GET_REPORT = '[BALANCE_REPORT] GET REPORT';
export const REPORT_ERROR = '[BALANCE_REPORT] ERROR';

export function getBalanceReport(groupId, startDate, endDate) {
	if (isSampleMode()) {
		return dispatch => {
			dispatch({ type: LOADING_REPORT });
			setTimeout(() => dispatch({ type: GET_REPORT, payload: getSampleBalanceReportData() }), 300);
		};
	}

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
