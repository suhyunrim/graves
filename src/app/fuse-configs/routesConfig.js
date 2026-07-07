import React from 'react';
import { Navigate } from 'react-router-dom';
import FuseUtils from '@fuse/utils';
import authRoleExamplesConfigs from 'app/main/auth/authRoleExamplesConfigs';
import DashboardConfig from 'app/main/dashboard/DashboardConfig';
import MyInfoConfig from 'app/main/myinfo/MyInfoConfig';
import RankingConfig from 'app/main/ranking/RankingConfig';
import PositionRankingConfig from 'app/main/positionRanking/PositionRankingConfig';
import MatchHistoryConfig from 'app/main/matchHistory/MatchHistoryConfig';
import HonorRankingConfig from 'app/main/honorRanking/HonorRankingConfig';
import GroupSettingsConfig from 'app/main/groupSettings/GroupSettingsConfig';
import ChallengeConfig from 'app/main/challenge/ChallengeConfig';
import TournamentConfig from 'app/main/tournament/TournamentConfig';
import ReleaseNotesConfig from 'app/main/releaseNotes/ReleaseNotesConfig';
import AchievementConfig from 'app/main/achievement/AchievementConfig';
import AchievementDashboardConfig from 'app/main/achievementDashboard/AchievementDashboardConfig';
import BalanceReportConfig from 'app/main/balanceReport/BalanceReportConfig';
import AiAssistantConfig from 'app/main/ai/AiAssistantConfig';
import LoginPageConfig from 'app/main/login/LoginPageConfig';
import MaintenanceConfig from 'app/main/maintenance/MaintenanceConfig';
import SampleConfig from 'app/main/sample/SampleConfig';
import WelcomeConfig from 'app/main/welcome/WelcomeConfig';

const routeConfigs = [
	...authRoleExamplesConfigs,
	LoginPageConfig,
	WelcomeConfig,
	SampleConfig,
	DashboardConfig,
	MyInfoConfig,
	RankingConfig,
	PositionRankingConfig,
	MatchHistoryConfig,
	HonorRankingConfig,
	GroupSettingsConfig,
	ChallengeConfig,
	TournamentConfig,
	ReleaseNotesConfig,
	AchievementConfig,
	AchievementDashboardConfig,
	BalanceReportConfig,
	AiAssistantConfig,
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
