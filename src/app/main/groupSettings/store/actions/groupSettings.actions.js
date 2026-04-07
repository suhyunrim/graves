import createCamilleAxios from 'app/utility/camilleAxios';

export const GET_MEMBERS = '[GROUP_SETTINGS] GET MEMBERS';
export const GET_MEMBERS_LOADING = '[GROUP_SETTINGS] GET MEMBERS LOADING';
export const SET_SEARCH_TEXT = '[GROUP_SETTINGS] SET SEARCH TEXT';

export function getMembers(groupId) {
	return dispatch => {
		dispatch({ type: GET_MEMBERS_LOADING });

		const request = createCamilleAxios().get(`/api/group/${groupId}/members`);

		return request.then(response =>
			dispatch({
				type: GET_MEMBERS,
				payload: response.data.result
			})
		);
	};
}

export function addBlacklist(groupId, puuid) {
	return dispatch => {
		const request = createCamilleAxios().post(`/api/group/${groupId}/blacklist`, { puuid });

		return request.then(() => dispatch(getMembers(groupId)));
	};
}

export function removeBlacklist(groupId, puuid) {
	return dispatch => {
		const request = createCamilleAxios().delete(`/api/group/${groupId}/blacklist/${puuid}`);

		return request.then(() => dispatch(getMembers(groupId)));
	};
}

export function changeDefaultTier(groupId, puuid, tier) {
	return dispatch => {
		const request = createCamilleAxios().patch(`/api/group/${groupId}/members/${puuid}/rating`, { tier });

		return request.then(() => dispatch(getMembers(groupId)));
	};
}

export function setSearchText(event) {
	return {
		type: SET_SEARCH_TEXT,
		searchText: event.target.value
	};
}
