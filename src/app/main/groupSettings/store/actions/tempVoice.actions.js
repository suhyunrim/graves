import createCamilleAxios from 'app/utility/camilleAxios';
import { isSampleMode } from 'app/main/sample/sampleStorage';
import { getSampleVoiceChannelsData, getSampleGeneratorsData } from 'app/main/sample/sampleData';

export const GET_VOICE_CHANNELS = '[TEMP_VOICE] GET VOICE CHANNELS';
export const GET_GENERATORS = '[TEMP_VOICE] GET GENERATORS';
export const UPSERT_GENERATOR = '[TEMP_VOICE] UPSERT GENERATOR';
export const REMOVE_GENERATOR = '[TEMP_VOICE] REMOVE GENERATOR';
export const SET_LOADING = '[TEMP_VOICE] SET LOADING';

export function getVoiceChannels(groupId) {
	if (isSampleMode()) {
		return dispatch => {
			dispatch({ type: SET_LOADING });
			setTimeout(() => dispatch({ type: GET_VOICE_CHANNELS, payload: getSampleVoiceChannelsData() }), 300);
		};
	}
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
	if (isSampleMode()) {
		return dispatch => {
			dispatch({ type: GET_GENERATORS, payload: getSampleGeneratorsData() });
			return Promise.resolve();
		};
	}
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
	if (isSampleMode()) {
		return dispatch => {
			dispatch({ type: UPSERT_GENERATOR, payload: data });
			return Promise.resolve();
		};
	}
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
	if (isSampleMode()) {
		return dispatch => {
			dispatch({ type: REMOVE_GENERATOR, payload: channelId });
			return Promise.resolve();
		};
	}
	return dispatch => {
		dispatch({ type: REMOVE_GENERATOR, payload: channelId });

		const request = createCamilleAxios().delete(`/api/temp-voice/${groupId}/generators/${channelId}`);

		return request.catch(err => {
			dispatch(getGenerators(groupId));
			throw err;
		});
	};
}
