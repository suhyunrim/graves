import createCamilleAxios from 'app/utility/camilleAxios';

export const GET_AUDIT_LOGS = '[AUDIT_LOG] GET LOGS';
export const GET_AUDIT_LOGS_LOADING = '[AUDIT_LOG] LOADING';

export function getAuditLogs(groupId, params = {}) {
	return dispatch => {
		dispatch({ type: GET_AUDIT_LOGS_LOADING });

		const query = {};
		if (params.startDate) query.startDate = params.startDate;
		if (params.endDate) query.endDate = params.endDate;
		if (params.action) query.action = params.action;
		if (params.page) query.page = params.page;
		if (params.limit) query.limit = params.limit;

		const request = createCamilleAxios().get(`/api/audit-log/${groupId}`, { params: query });

		return request.then(response =>
			dispatch({
				type: GET_AUDIT_LOGS,
				payload: response.data
			})
		);
	};
}
