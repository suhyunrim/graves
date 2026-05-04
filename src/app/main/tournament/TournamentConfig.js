import React from 'react';

const TournamentConfig = {
	settings: {
		layout: {}
	},
	routes: [
		{
			path: '/tournament/:tournamentId',
			auth: null,
			component: React.lazy(() => import('./TournamentDetail'))
		},
		{
			path: '/tournament',
			auth: null,
			component: React.lazy(() => import('./TournamentList'))
		}
	]
};

export default TournamentConfig;
