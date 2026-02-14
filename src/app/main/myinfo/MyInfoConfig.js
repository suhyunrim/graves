import { authRoles } from 'app/auth';
import React from 'react';

const MyInfoConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/userinfo/:puuid',
			auth: authRoles.user,
			component: React.lazy(() => import('./MyInfo'))
		},
		{
			path: '/myinfo',
			auth: authRoles.user,
			component: React.lazy(() => import('./MyInfo'))
		}
	]
};

export default MyInfoConfig;
