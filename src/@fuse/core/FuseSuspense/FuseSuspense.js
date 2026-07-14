import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { canAutoReload, markAutoReload } from 'app/utility/chunkReload';
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

// 정상적인 lazy 청크 로드는 느린 모바일에서도 수 초면 끝난다. 이 시간을 넘기면
// fetch가 reject 없이 얼어붙은 것(모바일 백그라운드 복귀 등)으로 간주한다.
const STALL_MS = 12000;
// 워치독 자동 리로드는 "성공한 로드" 전까지 1회만. 시간 기반 쿨다운(10초)만 쓰면
// 스톨(12초)마다 쿨다운이 풀려 있어 리로드가 무한 반복된다.
const STALL_KEY = 'suspenseStallReloaded';

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
	const [stalled, setStalled] = useState(false);

	// lazy 청크 fetch가 영원히 pending이면(reject가 없어 chunkReload로 감지 불가)
	// 이 fallback이 무한 로딩으로 남는다. 일정 시간 넘게 유지되면 1회 자동 리로드로
	// 복구하고, 쿨다운(방금 리로드했는데 또 멈춤) 중이면 수동 새로고침 버튼을 띄운다.
	useEffect(() => {
		const timer = setTimeout(() => {
			if (!sessionStorage.getItem(STALL_KEY) && canAutoReload()) {
				sessionStorage.setItem(STALL_KEY, '1');
				markAutoReload();
				window.location.reload();
			} else {
				setStalled(true);
			}
		}, STALL_MS);
		return () => {
			clearTimeout(timer);
			// cleanup까지 왔다는 건 fallback이 정상 해제(청크 로드 성공)됐다는 뜻.
			// (리로드로 떠난 경우엔 cleanup이 돌지 않아 플래그가 유지된다.)
			sessionStorage.removeItem(STALL_KEY);
		};
	}, []);

	if (stalled) {
		return (
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					minHeight: '60vh',
					padding: 24,
					textAlign: 'center'
				}}
			>
				<h2 style={{ marginBottom: 12 }}>페이지 로딩이 지연되고 있습니다</h2>
				<p style={{ marginBottom: 24, color: 'rgba(255,255,255,0.6)' }}>
					네트워크 상태를 확인한 뒤 새로고침해주세요.
				</p>
				<Button variant="contained" color="primary" onClick={() => window.location.reload()}>
					새로고침
				</Button>
			</div>
		);
	}

	return getSkeletonForPath(window.location.pathname);
}

/**
 * React Suspense defaults
 * For to Avoid Repetition
 */ function FuseSuspense(props) {
	return <React.Suspense fallback={<SuspenseFallback />}>{props.children}</React.Suspense>;
}

export default FuseSuspense;
