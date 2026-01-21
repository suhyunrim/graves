import { authRoles } from 'app/auth';
import React from 'react';

const DashboardConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/dashboard',
			auth: authRoles.user,
			component: React.lazy(() => import('./Dashboard'))
		}
	]
};

export default DashboardConfig;
