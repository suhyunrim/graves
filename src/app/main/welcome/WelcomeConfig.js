import React from 'react';

const WelcomeConfig = {
	settings: {
		layout: {
			config: {
				navbar: { display: false },
				toolbar: { display: false },
				footer: { display: false },
				leftSidePanel: { display: false },
				rightSidePanel: { display: false }
			}
		}
	},
	routes: [
		{
			path: '/welcome',
			auth: null,
			component: React.lazy(() => import('./Welcome'))
		},
		{
			path: '/welcome2',
			auth: null,
			component: React.lazy(() => import('./WelcomeEmbed'))
		}
	]
};

export default WelcomeConfig;
