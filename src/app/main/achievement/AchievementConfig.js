import { authRoles } from 'app/auth';
import React from 'react';

const AchievementConfig = {
	settings: {
		layout: {}
	},
	routes: [
		{
			path: '/achievement/:puuid?',
			auth: authRoles.user,
			component: React.lazy(() => import('./Achievement'))
		}
	]
};

export default AchievementConfig;
