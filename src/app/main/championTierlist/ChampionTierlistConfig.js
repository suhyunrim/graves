import { authRoles } from 'app/auth';
import React from 'react';

const ChampionTierlistConfig = {
	settings: {
		layout: {}
	},
	routes: [
		{
			path: '/champion-tierlist',
			auth: authRoles.user,
			component: React.lazy(() => import('./ChampionTierlist'))
		}
	]
};

export default ChampionTierlistConfig;
