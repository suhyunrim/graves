import { authRoles } from 'app/auth';
import React from 'react';

const HonorRankingConfig = {
	settings: {
		layout: {}
	},
	routes: [
		{
			path: '/honor-ranking',
			auth: authRoles.user,
			component: React.lazy(() => import('./HonorRanking'))
		}
	]
};

export default HonorRankingConfig;
