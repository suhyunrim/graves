import { authRoles } from 'app/auth';
import React from 'react';

const CompareConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/compare',
			auth: authRoles.user,
			component: React.lazy(() => import('./Compare'))
		}
	]
};

export default CompareConfig;
