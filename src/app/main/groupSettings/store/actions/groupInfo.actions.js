import createCamilleAxios from 'app/utility/camilleAxios';
import { isSampleMode } from 'app/main/sample/sampleStorage';
import { getSampleGroupInfoData, getSampleDiscordRolesData } from 'app/main/sample/sampleData';

export const GET_GROUP_INFO = '[GROUP_INFO] GET INFO';
export const GET_GROUP_INFO_LOADING = '[GROUP_INFO] LOADING';
export const SET_GROUP_NAME = '[GROUP_INFO] SET NAME';
export const SET_GROUP_SETTINGS = '[GROUP_INFO] SET SETTINGS';
export const GET_DISCORD_ROLES = '[GROUP_INFO] GET DISCORD ROLES';

export function getGroupInfo(groupId) {
	if (isSampleMode()) {
		return dispatch => {
			dispatch({ type: GET_GROUP_INFO_LOADING });
			setTimeout(() => dispatch({ type: GET_GROUP_INFO, payload: getSampleGroupInfoData() }), 300);
		};
	}
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
	if (isSampleMode()) {
		return dispatch => {
			dispatch({ type: SET_GROUP_NAME, payload: groupName });
			return Promise.resolve();
		};
	}
	return dispatch => {
		dispatch({ type: SET_GROUP_NAME, payload: groupName });

		const request = createCamilleAxios().patch(`/api/group/${groupId}/name`, { groupName });

		return request.catch(err => {
			dispatch(getGroupInfo(groupId));
			throw err;
		});
	};
}

export function updateGroupSettings(groupId, settings) {
	if (isSampleMode()) {
		return dispatch => {
			dispatch({ type: SET_GROUP_SETTINGS, payload: settings });
			return Promise.resolve();
		};
	}
	return dispatch => {
		dispatch({ type: SET_GROUP_SETTINGS, payload: settings });

		const request = createCamilleAxios().patch(`/api/group/${groupId}/settings`, settings);

		return request.catch(err => {
			dispatch(getGroupInfo(groupId));
			throw err;
		});
	};
}

export function resetSeason(groupId) {
	if (isSampleMode()) {
		return () => Promise.resolve();
	}
	return dispatch => {
		const request = createCamilleAxios().post(`/api/group/${groupId}/season/reset`);

		return request.then(() => dispatch(getGroupInfo(groupId)));
	};
}

export function getDiscordRoles(groupId) {
	if (isSampleMode()) {
		return dispatch => {
			dispatch({ type: GET_DISCORD_ROLES, payload: getSampleDiscordRolesData() });
			return Promise.resolve();
		};
	}
	return dispatch => {
		const request = createCamilleAxios().get(`/api/group/${groupId}/discord-roles`);

		return request.then(response =>
			dispatch({
				type: GET_DISCORD_ROLES,
				payload: response.data
			})
		);
	};
}
