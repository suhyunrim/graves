import { authRoles } from 'app/auth';
import React from 'react';

const GroupSettingsConfig = {
	settings: {
		layout: {}
	},
	routes: [
		{
			path: '/group-settings',
			auth: authRoles.user,
			component: React.lazy(() => import('./GroupSettings'))
		}
	]
};

export default GroupSettingsConfig;
