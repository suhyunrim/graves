import createCamilleAxios from 'app/utility/camilleAxios';

export const GET_VOICE_CHANNELS = '[TEMP_VOICE] GET VOICE CHANNELS';
export const GET_GENERATORS = '[TEMP_VOICE] GET GENERATORS';
export const SET_LOADING = '[TEMP_VOICE] SET LOADING';

export function getVoiceChannels(groupId) {
	return dispatch => {
		dispatch({ type: SET_LOADING });

		const request = createCamilleAxios().get(`/api/temp-voice/${groupId}/voice-channels`);

		return request.then(response =>
			dispatch({
				type: GET_VOICE_CHANNELS,
				payload: response.data
			})
		);
	};
}

export function getGenerators(groupId) {
	return dispatch => {
		const request = createCamilleAxios().get(`/api/temp-voice/${groupId}/generators`);

		return request.then(response =>
			dispatch({
				type: GET_GENERATORS,
				payload: response.data
			})
		);
	};
}

export function saveGenerator(groupId, data) {
	return dispatch => {
		const request = createCamilleAxios().post(`/api/temp-voice/${groupId}/generators`, data);

		return request.then(() => {
			dispatch(getVoiceChannels(groupId));
			dispatch(getGenerators(groupId));
		});
	};
}

export function deleteGenerator(groupId, channelId) {
	return dispatch => {
		const request = createCamilleAxios().delete(`/api/temp-voice/${groupId}/generators/${channelId}`);

		return request.then(() => {
			dispatch(getVoiceChannels(groupId));
			dispatch(getGenerators(groupId));
		});
	};
}
