import React from 'react';

const BalanceReportConfig = {
	settings: {
		layout: {}
	},
	routes: [
		{
			path: '/balance-report',
			auth: null,
			component: React.lazy(() => import('./BalanceReport'))
		}
	]
};

export default BalanceReportConfig;
