import * as Actions from '../actions/tempVoice.actions';

const initialState = {
	voiceChannels: [],
	generators: [],
	loading: false
};

const tempVoiceReducer = (state = initialState, action) => {
	switch (action.type) {
		case Actions.SET_LOADING: {
			return { ...state, loading: true };
		}
		case Actions.GET_VOICE_CHANNELS: {
			return { ...state, voiceChannels: action.payload, loading: false };
		}
		case Actions.GET_GENERATORS: {
			return { ...state, generators: action.payload };
		}
		default: {
			return state;
		}
	}
};

export default tempVoiceReducer;
