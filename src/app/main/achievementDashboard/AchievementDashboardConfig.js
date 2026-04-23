import { authRoles } from 'app/auth';
import React from 'react';

const AchievementDashboardConfig = {
	settings: {
		layout: {}
	},
	routes: [
		{
			path: '/achievement-dashboard',
			auth: authRoles.user,
			component: React.lazy(() => import('./AchievementDashboard'))
		},
		{
			path: '/achievement-dashboard/user-ranking',
			auth: authRoles.user,
			component: React.lazy(() => import('./AchievementUserRanking'))
		},
		{
			path: '/achievement-dashboard/ranking/:achievementId',
			auth: authRoles.user,
			component: React.lazy(() => import('./AchievementRanking'))
		}
	]
};

export default AchievementDashboardConfig;
