import * as Actions from '../actions/groupInfo.actions';

const initialState = {
	info: null,
	loading: false,
	discordRoles: [],
	discordChannels: []
};

const groupInfoReducer = (state = initialState, action) => {
	switch (action.type) {
		case Actions.GET_GROUP_INFO_LOADING: {
			return { ...state, loading: true };
		}
		case Actions.GET_GROUP_INFO: {
			return { ...state, info: action.payload, loading: false };
		}
		case Actions.SET_GROUP_NAME: {
			return { ...state, info: { ...state.info, groupName: action.payload } };
		}
		case Actions.SET_GROUP_SETTINGS: {
			return { ...state, info: { ...state.info, settings: { ...state.info.settings, ...action.payload } } };
		}
		case Actions.GET_DISCORD_ROLES: {
			return { ...state, discordRoles: action.payload };
		}
		case Actions.GET_DISCORD_CHANNELS: {
			return { ...state, discordChannels: action.payload };
		}
		default: {
			return state;
		}
	}
};

export default groupInfoReducer;
