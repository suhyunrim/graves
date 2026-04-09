import createCamilleAxios from 'app/utility/camilleAxios';

export const GET_GROUP_INFO = '[GROUP_INFO] GET INFO';
export const GET_GROUP_INFO_LOADING = '[GROUP_INFO] LOADING';
export const UPDATE_GROUP_NAME = '[GROUP_INFO] UPDATE NAME';
export const UPDATE_SETTINGS = '[GROUP_INFO] UPDATE SETTINGS';

export function getGroupInfo(groupId) {
	return dispatch => {
		dispatch({ type: GET_GROUP_INFO_LOADING });

		const request = createCamilleAxios().get(`/api/group/${groupId}/info`);

		return request.then(response =>
			dispatch({
				type: GET_GROUP_INFO,
				payload: response.data
			})
		);
	};
}

export function updateGroupName(groupId, groupName) {
	return dispatch => {
		const request = createCamilleAxios().patch(`/api/group/${groupId}/name`, { groupName });

		return request.then(() => dispatch(getGroupInfo(groupId)));
	};
}

export function updateGroupSettings(groupId, settings) {
	return dispatch => {
		const request = createCamilleAxios().patch(`/api/group/${groupId}/settings`, settings);

		return request.then(response => {
			dispatch(getGroupInfo(groupId));
			return response;
		});
	};
}
