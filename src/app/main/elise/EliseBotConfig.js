import React from 'react';

const EliseBotConfig = {
	settings: {
		layout: {}
	},
	routes: [
		{
			path: '/elise',
			auth: null,
			component: React.lazy(() => import('./EliseBot'))
		}
	]
};

export default EliseBotConfig;
