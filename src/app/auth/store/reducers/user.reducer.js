import * as Actions from '../actions';

const initialState = {
	role: [], // guest
	data: {
		displayName: '',
		photoURL: 'assets/images/avatars/Ahri.jpeg'
	}
};

const mergeAdminFlags = (groupList, discordGroups) => {
	if (!discordGroups || discordGroups.length === 0) return groupList;
	const adminMap = {};
	discordGroups.forEach(g => {
		adminMap[g.groupId] = g.isAdmin;
	});
	return groupList.map(g => ({
		...g,
		isAdmin: adminMap[g.groupId] || false
	}));
};

const generateReprGroupState = (groupList, reprGroup) => {
	return {
		...initialState,
		groupList,
		reprGroup,
		role: ['admin'], // 임시코드 (by ZeroBoom)
		data: {
			...initialState.data,
			displayName: reprGroup.groupName
		}
	};
};

const user = (state = initialState, action) => {
	switch (action.type) {
		case Actions.RETRIEVE_GROUP_LIST: {
			const rawGroupList = action.payload;
			if (rawGroupList.length === 0) return { ...initialState };

			const groupList = mergeAdminFlags(rawGroupList, state.discordGroups);
			const reprGroup = groupList[0];
			return generateReprGroupState(groupList, reprGroup);
		}
		case Actions.SET_DISCORD_USER_DATA: {
			const discordData = action.payload;
			return {
				...state,
				discordGroups: discordData.groups || [],
				data: {
					...state.data,
					photoURL: discordData.avatar
						? `https://cdn.discordapp.com/avatars/${discordData.discordId}/${discordData.avatar}.png`
						: `https://cdn.discordapp.com/embed/avatars/${Number(discordData.discordId) % 5}.png`,
					discordUser: {
						discordId: discordData.discordId,
						username: discordData.username,
						globalName: discordData.globalName
					}
				}
			};
		}
		case Actions.CHANGE_GROUP: {
			const { groupList } = state;
			if (groupList.length === 0) return { ...initialState };

			const idx = groupList.findIndex(elem => elem.groupId === action.groupId);
			if (idx === -1) return { ...initialState };

			const reprGroup = groupList[idx];
			return generateReprGroupState(groupList, reprGroup);
		}
		case Actions.REMOVE_USER_DATA: {
			return {
				...initialState
			};
		}
		case Actions.USER_LOGGED_OUT: {
			return initialState;
		}
		default: {
			return state;
		}
	}
};

export default user;
