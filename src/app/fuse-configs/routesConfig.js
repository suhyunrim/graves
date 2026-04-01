import React from 'react';
import { Redirect } from 'react-router-dom';
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
import LoginPageConfig from 'app/main/login/LoginPageConfig';

const routeConfigs = [
	...authRoleExamplesConfigs,
	LoginPageConfig,
	DashboardConfig,
	MyInfoConfig,
	RankingConfig,
	MatchHistoryConfig,
	HonorRankingConfig,
	GroupSettingsConfig,
	ChallengeConfig,
	ReleaseNotesConfig
];

const routes = [
	...FuseUtils.generateRoutesFromConfigs(routeConfigs),
	{
		path: '/',
		component: () => <Redirect to="/dashboard" />
	},
	{
		component: () => <Redirect to="/pages/errors/error-404" />
	}
];

export default routes;
