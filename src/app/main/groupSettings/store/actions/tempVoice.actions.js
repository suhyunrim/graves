import createCamilleAxios from 'app/utility/camilleAxios';

export const GET_VOICE_CHANNELS = '[TEMP_VOICE] GET VOICE CHANNELS';
export const GET_GENERATORS = '[TEMP_VOICE] GET GENERATORS';
export const UPSERT_GENERATOR = '[TEMP_VOICE] UPSERT GENERATOR';
export const REMOVE_GENERATOR = '[TEMP_VOICE] REMOVE GENERATOR';
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
		dispatch({ type: UPSERT_GENERATOR, payload: data });

		const request = createCamilleAxios().post(`/api/temp-voice/${groupId}/generators`, data);

		return request.catch(err => {
			dispatch(getGenerators(groupId));
			throw err;
		});
	};
}

export function deleteGenerator(groupId, channelId) {
	return dispatch => {
		dispatch({ type: REMOVE_GENERATOR, payload: channelId });

		const request = createCamilleAxios().delete(`/api/temp-voice/${groupId}/generators/${channelId}`);

		return request.catch(err => {
			dispatch(getGenerators(groupId));
			throw err;
		});
	};
}
