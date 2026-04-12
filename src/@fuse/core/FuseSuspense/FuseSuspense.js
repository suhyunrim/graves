import React from 'react';
import {
	DashboardSkeleton,
	RankingTableSkeleton,
	MatchHistorySkeleton,
	MyInfoSkeleton,
	AchievementSkeleton,
	SettingsSkeleton,
	ChallengeListSkeleton,
	ChallengeDetailSkeleton
} from 'app/main/components/SkeletonLoaders';

function getSkeletonForPath(pathname) {
	if (pathname.startsWith('/dashboard')) return <DashboardSkeleton />;
	if (pathname.startsWith('/ranking')) return <RankingTableSkeleton />;
	if (pathname.startsWith('/match-history')) return <MatchHistorySkeleton />;
	if (pathname.startsWith('/myinfo') || pathname.startsWith('/userinfo')) return <MyInfoSkeleton />;
	if (pathname.startsWith('/achievement')) return <AchievementSkeleton />;
	if (pathname.startsWith('/group-settings')) return <SettingsSkeleton />;
	if (pathname === '/challenge') return <ChallengeListSkeleton />;
	if (pathname.startsWith('/challenge/')) return <ChallengeDetailSkeleton />;
	return <div />;
}

function SuspenseFallback() {
	return getSkeletonForPath(window.location.pathname);
}

/**
 * React Suspense defaults
 * For to Avoid Repetition
 */ function FuseSuspense(props) {
	return <React.Suspense fallback={<SuspenseFallback />}>{props.children}</React.Suspense>;
}

export default FuseSuspense;
