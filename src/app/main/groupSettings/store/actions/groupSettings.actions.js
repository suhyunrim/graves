import createCamilleAxios from 'app/utility/camilleAxios';

export const GET_MEMBERS = '[GROUP_SETTINGS] GET MEMBERS';
export const GET_MEMBERS_LOADING = '[GROUP_SETTINGS] GET MEMBERS LOADING';
export const SET_MEMBER_RATING = '[GROUP_SETTINGS] SET MEMBER RATING';
export const SET_MEMBER_ROLE = '[GROUP_SETTINGS] SET MEMBER ROLE';
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
		dispatch({ type: SET_MEMBER_ROLE, payload: { puuid, role: 'outsider' } });

		const request = createCamilleAxios().post(`/api/group/${groupId}/blacklist`, { puuid });

		return request.catch(err => {
			dispatch(getMembers(groupId));
			throw err;
		});
	};
}

export function removeBlacklist(groupId, puuid) {
	return dispatch => {
		dispatch({ type: SET_MEMBER_ROLE, payload: { puuid, role: 'member' } });

		const request = createCamilleAxios().delete(`/api/group/${groupId}/blacklist/${puuid}`);

		return request.catch(err => {
			dispatch(getMembers(groupId));
			throw err;
		});
	};
}

export function changeDefaultTier(groupId, puuid, tier, rating) {
	return dispatch => {
		dispatch({ type: SET_MEMBER_RATING, payload: { puuid, defaultRating: rating } });

		const request = createCamilleAxios().patch(`/api/group/${groupId}/members/${puuid}/rating`, { tier });

		return request.catch(err => {
			dispatch(getMembers(groupId));
			throw err;
		});
	};
}

export function setSearchText(searchText) {
	return {
		type: SET_SEARCH_TEXT,
		searchText
	};
}
