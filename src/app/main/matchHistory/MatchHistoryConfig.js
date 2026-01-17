import { authRoles } from 'app/auth';
import React from 'react';

const MatchHistoryConfig = {
	settings: {
		layout: {}
	},
	routes: [
		{
			path: '/match-history',
			auth: authRoles.user,
			component: React.lazy(() => import('./MatchHistory'))
		}
	]
};

export default MatchHistoryConfig;
