import React from 'react';

const AboutConfig = {
	settings: {
		layout: {}
	},
	routes: [
		{
			path: '/about',
			auth: null,
			component: React.lazy(() => import('./About'))
		}
	]
};

export default AboutConfig;
