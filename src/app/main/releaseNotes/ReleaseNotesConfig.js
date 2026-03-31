import React from 'react';

const ReleaseNotesConfig = {
	settings: {
		layout: {}
	},
	routes: [
		{
			path: '/release-notes',
			auth: null,
			component: React.lazy(() => import('./ReleaseNotes'))
		}
	]
};

export default ReleaseNotesConfig;
