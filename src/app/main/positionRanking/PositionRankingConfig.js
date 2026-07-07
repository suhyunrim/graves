import { authRoles } from 'app/auth';
import React from 'react';

const PositionRankingConfig = {
	settings: {
		layout: {}
	},
	routes: [
		{
			path: '/position-ranking',
			auth: authRoles.user,
			component: React.lazy(() => import('./PositionRanking'))
		}
	]
};

export default PositionRankingConfig;
