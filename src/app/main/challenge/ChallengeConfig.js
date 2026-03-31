import React from 'react';

const ChallengeConfig = {
	settings: {
		layout: {}
	},
	routes: [
		{
			path: '/challenge/:challengeId/user/:puuid',
			auth: null,
			component: React.lazy(() => import('./ChallengeUserMatches'))
		},
		{
			path: '/challenge/:challengeId',
			auth: null,
			component: React.lazy(() => import('./ChallengeDetail'))
		},
		{
			path: '/challenge',
			auth: null,
			component: React.lazy(() => import('./ChallengeList'))
		}
	]
};

export default ChallengeConfig;
