import React from 'react';
import { Navigate } from 'react-router-dom';
import FuseUtils from '@fuse/utils';
import authRoleExamplesConfigs from 'app/main/auth/authRoleExamplesConfigs';
import DashboardConfig from 'app/main/dashboard/DashboardConfig';
import MyInfoConfig from 'app/main/myinfo/MyInfoConfig';
import RankingConfig from 'app/main/ranking/RankingConfig';
import MatchHistoryConfig from 'app/main/matchHistory/MatchHistoryConfig';
import HonorRankingConfig from 'app/main/honorRanking/HonorRankingConfig';
import GroupSettingsConfig from 'app/main/groupSettings/GroupSettingsConfig';
import ChallengeConfig from 'app/main/challenge/ChallengeConfig';
import ReleaseNotesConfig from 'app/main/releaseNotes/ReleaseNotesConfig';
import AchievementConfig from 'app/main/achievement/AchievementConfig';
import BalanceReportConfig from 'app/main/balanceReport/BalanceReportConfig';
import LoginPageConfig from 'app/main/login/LoginPageConfig';
import MaintenanceConfig from 'app/main/maintenance/MaintenanceConfig';
import SampleConfig from 'app/main/sample/SampleConfig';

const routeConfigs = [
	...authRoleExamplesConfigs,
	LoginPageConfig,
	SampleConfig,
	DashboardConfig,
	MyInfoConfig,
	RankingConfig,
	MatchHistoryConfig,
	HonorRankingConfig,
	GroupSettingsConfig,
	ChallengeConfig,
	ReleaseNotesConfig,
	AchievementConfig,
	BalanceReportConfig,
	MaintenanceConfig
];

const routes = [
	...FuseUtils.generateRoutesFromConfigs(routeConfigs),
	{
		path: '/',
		component: () => <Navigate to="/dashboard" replace />
	},
	{
		path: '*',
		component: () => <Navigate to="/pages/errors/error-404" replace />
	}
];

export default routes;
