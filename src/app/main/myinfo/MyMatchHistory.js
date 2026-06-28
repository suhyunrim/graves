import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import createCamilleAxios from 'app/utility/camilleAxios';
import { isSampleMode } from 'app/main/sample/sampleStorage';
import { getSampleMatchHistoryData } from 'app/main/sample/sampleData';
import { MatchHistorySkeleton } from '../components/SkeletonLoaders';
import MatchList from '../components/MatchList';

const ROWS_PER_PAGE = 10;

// 내정보 "내전 기록" 탭 본체.
// 대상 프로필(puuid)이 참가한 완료 매치만 최신순/페이지네이션으로 보여준다.
// matchHistory Redux 슬라이스를 공유하면 매치기록 페이지와 상태가 충돌하므로 로컬 state로 직접 조회한다.
// 프로필 전환 시 page 초기화는 부모에서 key={puuid}로 remount 처리.
function MyMatchHistory({ puuid }) {
	const user = useSelector(state => state.auth.user);
	const groupId = user?.reprGroup?.groupId;

	const [data, setData] = useState(null); // { matches, total, page, totalPages }
	const [page, setPage] = useState(1);

	useEffect(() => {
		if (!puuid) return undefined;

		if (isSampleMode()) {
			setData(getSampleMatchHistoryData(page, ROWS_PER_PAGE, puuid));
			return undefined;
		}

		// 모바일 쿠키 세션 복원 중엔 groupId가 아직 없을 수 있다. 준비되면 deps 변경으로 재실행.
		if (!groupId) return undefined;

		let cancelled = false;
		setData(null);
		createCamilleAxios()
			.get(`/api/match/history/${groupId}`, { params: { page, limit: ROWS_PER_PAGE, puuid } })
			.then(response => {
				if (cancelled || response.status !== 200) return;
				setData(response.data);
			})
			.catch(() => {
				if (cancelled) return;
				setData({ matches: [], total: 0, page: 1, totalPages: 0 });
			});

		return () => {
			cancelled = true;
		};
	}, [groupId, puuid, page]);

	if (!data) {
		return <MatchHistorySkeleton />;
	}

	return (
		<MatchList
			matches={data.matches}
			total={data.total}
			page={page}
			rowsPerPage={ROWS_PER_PAGE}
			onPageChange={setPage}
			perspectivePuuid={puuid}
		/>
	);
}

export default MyMatchHistory;
