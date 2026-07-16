import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import TablePagination from '@mui/material/TablePagination';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getChampionIcon, getMultiKillBadge } from 'app/main/challenge/ddragonUtils';
import { formatRelativeTime, formatFullDateTime } from 'app/utility/formatRelativeTime';
import {
	getTierShortName,
	getTierIconName,
	getTierColor,
	POSITION_ICON_KEY,
	getPlayerPosition,
	sortPlayers,
	kdaRatioColor,
	getKdaRatio,
	formatK,
	getKillParticipation,
	usePerkIcons,
	SpellRuneGrid,
	ItemsRow
} from '../components/matchStatUtils';
import MatchDetail from '../components/MatchDetail';
import PositionIcon from '../tournament/PositionIcon';

const formatDuration = sec => {
	if (sec == null) return null;
	const m = Math.floor(sec / 60);
	const s = sec % 60;
	return `${m}분 ${String(s).padStart(2, '0')}초`;
};

// 맞라인 대비 골드 지분 (op.gg "라인전 48:52" 스타일). goldDiff = 본인 - 상대.
const getLaneShare = stat => {
	if (stat.goldDiff == null || stat.goldEarned == null) return null;
	const oppGold = stat.goldEarned - stat.goldDiff;
	if (oppGold <= 0 || stat.goldEarned + oppGold <= 0) return null;
	return Math.round((stat.goldEarned / (stat.goldEarned + oppGold)) * 100);
};

const useStyles = makeStyles()((theme) => ({
	wrapper: {
		display: 'flex',
		flexDirection: 'column',
		gap: 10
	},
	matchCard: {
		position: 'relative',
		borderRadius: 12,
		overflow: 'hidden',
		cursor: 'pointer',
		border: '1px solid rgba(255, 255, 255, 0.08)',
		transition: 'border-color 0.2s ease',
		'&:hover': {
			borderColor: 'rgba(0, 212, 255, 0.35)'
		}
	},
	// 멀티킬/퍼블 뱃지: 우측 정렬된 로스터 그룹 왼쪽에 세로 스택 — 다른 컬럼을 밀지 않음
	badgeCol: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-end',
		justifyContent: 'center',
		gap: 5,
		marginRight: 12,
		flexShrink: 0
	},
	matchWin: {
		background: 'rgba(0, 200, 83, 0.10)',
		borderLeft: '5px solid #00c853'
	},
	matchLose: {
		background: 'rgba(255, 82, 82, 0.09)',
		borderLeft: '5px solid #ff5252'
	},
	rowMain: {
		display: 'flex',
		alignItems: 'center',
		gap: 16,
		padding: '12px 16px',
		[theme.breakpoints.down('sm')]: {
			gap: 12,
			padding: '10px 12px',
			flexWrap: 'wrap'
		}
	},
	resultCol: {
		display: 'flex',
		flexDirection: 'column',
		gap: 2,
		minWidth: 96,
		flexShrink: 0
	},
	resultWin: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 700,
		color: '#00e676'
	},
	resultLose: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 700,
		color: '#ff5252'
	},
	lpText: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600
	},
	lpUp: { color: '#00e676' },
	lpDown: { color: '#ff5252' },
	lpNeutral: { color: 'rgba(255, 255, 255, 0.5)' },
	metaText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.45)',
		whiteSpace: 'nowrap'
	},
	champCol: {
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		flex: '1 1 auto',
		minWidth: 0,
		// 모바일: 지표 블록들이 줄바꿈되어 행이 뷰포트보다 넓어지지 않게
		[theme.breakpoints.down('sm')]: {
			flexWrap: 'wrap',
			rowGap: 8
		}
	},
	champImg: {
		width: 52,
		height: 52,
		borderRadius: '50%',
		objectFit: 'cover',
		border: '2px solid rgba(255, 255, 255, 0.25)',
		flexShrink: 0,
		[theme.breakpoints.down('sm')]: {
			width: 42,
			height: 42
		}
	},
	champWrap: {
		position: 'relative',
		flexShrink: 0,
		display: 'inline-flex'
	},
	champLevel: {
		position: 'absolute',
		right: -3,
		bottom: -3,
		minWidth: 19,
		height: 19,
		borderRadius: 10,
		background: 'rgba(0, 0, 0, 0.85)',
		border: '1px solid rgba(255, 255, 255, 0.25)',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 700,
		color: '#fff',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '0 3px'
	},
	champColInner: {
		display: 'flex',
		flexDirection: 'column',
		gap: 7,
		minWidth: 0
	},
	champTopRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 10
	},
	champBottomRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		flexWrap: 'wrap'
	},
	spellRuneGrid: {
		display: 'grid',
		gridTemplateColumns: '20px 20px',
		gridAutoRows: 20,
		gap: 2,
		flexShrink: 0
	},
	spellRuneIcon: {
		width: 20,
		height: 20,
		borderRadius: 4,
		objectFit: 'cover',
		background: 'rgba(0, 0, 0, 0.4)'
	},
	spellRuneEmpty: {
		width: 20,
		height: 20,
		borderRadius: 4,
		background: 'rgba(255, 255, 255, 0.06)'
	},
	itemsRow: {
		display: 'flex',
		gap: 3,
		alignItems: 'center'
	},
	itemImg: {
		width: 22,
		height: 22,
		borderRadius: 4,
		objectFit: 'cover',
		border: '1px solid rgba(255, 255, 255, 0.12)'
	},
	itemEmpty: {
		width: 22,
		height: 22,
		borderRadius: 4,
		background: 'rgba(255, 255, 255, 0.06)',
		border: '1px solid rgba(255, 255, 255, 0.06)'
	},
	trinketGap: {
		marginLeft: 4
	},
	killBadge: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 700,
		color: '#fff',
		background: 'linear-gradient(135deg, #ff5252 0%, #ff1744 100%)',
		borderRadius: 10,
		padding: '2px 9px',
		whiteSpace: 'nowrap'
	},
	fbBadge: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 700,
		color: '#ffd700',
		border: '1px solid rgba(255, 215, 0, 0.5)',
		borderRadius: 10,
		padding: '1px 8px',
		whiteSpace: 'nowrap'
	},
	kdaBlock: {
		display: 'flex',
		flexDirection: 'column',
		gap: 1,
		flexShrink: 0
	},
	champNameSmall: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.55)',
		whiteSpace: 'nowrap'
	},
	kdaLine: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.9)',
		whiteSpace: 'nowrap'
	},
	kdaDeath: {
		color: '#ff5252'
	},
	kdaRatio: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 700
	},
	// 킬관여/CS/라인전, 딜량/골드/시야 미니 지표 (op.gg 가운데 블록)
	miniStats: {
		display: 'flex',
		flexDirection: 'column',
		gap: 2,
		paddingLeft: 14,
		borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
		flexShrink: 0,
		minWidth: 112,
		// 모바일: 접힌 행 높이 압축 — 상세 지표는 펼침 뷰에서 확인
		[theme.breakpoints.down('sm')]: {
			display: 'none'
		}
	},
	// 그 경기 시점의 내전 티어
	myTierCol: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: 1,
		minWidth: 58,
		flexShrink: 0,
		[theme.breakpoints.down('sm')]: {
			display: 'none'
		}
	},
	myTierEmblem: {
		width: 34,
		height: 34
	},
	myTierLabel: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 700
	},
	myTierCaption: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.85rem',
		color: 'rgba(255, 255, 255, 0.35)'
	},
	miniStatLine: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.02rem',
		color: 'rgba(255, 255, 255, 0.55)',
		whiteSpace: 'nowrap'
	},
	miniStatValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.8)'
	},
	laneWin: { color: '#00e676' },
	laneLose: { color: '#ff5252' },
	noDetail: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.3)'
	},
	// 접힌 행 우측 미니 로스터 (5+5) — md 미만은 JS에서 렌더 자체를 생략
	miniRosters: {
		display: 'flex',
		gap: 14,
		marginLeft: 'auto',
		flexShrink: 0
	},
	miniRosterCol: {
		display: 'flex',
		flexDirection: 'column',
		gap: 2
	},
	miniPlayer: {
		display: 'flex',
		alignItems: 'center',
		gap: 5
	},
	miniChampImg: {
		width: 16,
		height: 16,
		borderRadius: 4,
		objectFit: 'cover',
		flexShrink: 0
	},
	miniChampSlot: {
		width: 16,
		height: 16,
		flexShrink: 0,
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	miniPosIcon: {
		width: 16,
		height: 16,
		objectFit: 'contain'
	},
	miniName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.55)',
		maxWidth: 84,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	miniNameMe: {
		color: '#00d4ff',
		fontWeight: 700
	},
	posSlot: {
		width: 22,
		height: 22,
		flexShrink: 0,
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	posIcon: {
		width: 22,
		height: 22,
		objectFit: 'contain'
	},
	posFallback: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.55)'
	},
	expandIcon: {
		color: 'rgba(255, 255, 255, 0.35)',
		transition: 'transform 0.25s ease',
		flexShrink: 0
	},
	expandIconOpen: {
		transform: 'rotate(180deg)'
	},
	pagination: {
		color: 'rgba(255, 255, 255, 0.7)',
		'& .MuiIconButton-root': {
			color: 'rgba(255, 255, 255, 0.5)'
		},
		'& .MuiIconButton-root.Mui-disabled': {
			color: 'rgba(255, 255, 255, 0.2)'
		}
	},
	emptyState: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		padding: '60px 20px',
		textAlign: 'center',
		gap: 12
	},
	emptyIcon: {
		fontSize: '4rem',
		opacity: 0.5
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.5rem',
		color: 'rgba(255, 255, 255, 0.4)'
	}
}));

/**
 * 내정보 전용 내전 기록 리스트 (op.gg 스타일).
 * - perspectivePuuid 기준 승(초록)/패(빨강) 행 + 내 챔피언/KDA/킬관여/CS/라인전 골드 지분
 * - 우측 미니 로스터(데스크톱), 행 클릭 시 팀별 상세 테이블(KDA/피해량 바/시야/CS/골드) + 팀 합계
 * - 헬퍼(elise) 미수집 매치는 "상세 미수집" + 단순 로스터 폴백
 * 그룹 매치기록 페이지의 MatchList와 별개 컴포넌트 (관점·챔피언 중심이라 구조가 다름).
 */
function InternalMatchList({ matches, total, page, rowsPerPage, onPageChange, perspectivePuuid }) {
	const { classes, cx } = useStyles();
	const navigate = useNavigate();
	const [expandedIds, setExpandedIds] = useState(() => new Set());
	const getPerkIcon = usePerkIcons();
	// 미니 로스터는 md 미만에서 숨겨지므로 아예 렌더하지 않음 (숨겨진 챔프 아이콘 ~100장 다운로드 방지)
	const isDesktop = useMediaQuery(theme => theme.breakpoints.up('md'));

	const toggleExpand = gameId => {
		setExpandedIds(prev => {
			const next = new Set(prev);
			if (next.has(gameId)) next.delete(gameId);
			else next.add(gameId);
			return next;
		});
	};

	const getMyContext = match => {
		const inT1 = match.team1.players.some(p => p.puuid === perspectivePuuid);
		const inT2 = !inT1 && match.team2.players.some(p => p.puuid === perspectivePuuid);
		const myTeamNo = inT1 ? 1 : inT2 ? 2 : null;
		if (!myTeamNo) return null;
		const myTeam = myTeamNo === 1 ? match.team1 : match.team2;
		const me = myTeam.players.find(p => p.puuid === perspectivePuuid);
		return {
			won: match.winTeam === myTeamNo,
			myLp: myTeam.ratingChange == null ? null : myTeam.ratingChange * 4,
			myStat: me && me.stat ? me.stat : null,
			myTeamPlayers: myTeam.players,
			myPosition: me ? getPlayerPosition(me) : null,
			myTier: me ? me.tier : null
		};
	};

	const renderLp = lp => {
		if (lp == null) return null;
		const cls = lp > 0 ? classes.lpUp : lp < 0 ? classes.lpDown : classes.lpNeutral;
		return (
			<span className={`${classes.lpText} ${cls}`}>
				{lp > 0 ? `+${lp}` : lp} LP
			</span>
		);
	};

	const goUser = (e, p) => {
		e.stopPropagation();
		navigate(`/userinfo/${p.puuid}`);
	};

	// 접힌 행 우측 미니 로스터 (팀별 5명: 챔프 아이콘 + 이름, 스탯 없으면 포지션 아이콘 폴백)
	const renderMiniRoster = team => (
		<div className={classes.miniRosterCol}>
			{sortPlayers(team.players).map(p => {
				const posIconKey = POSITION_ICON_KEY[getPlayerPosition(p)];
				return (
					<div key={p.puuid} className={classes.miniPlayer}>
						{p.stat ? (
							<img
								className={classes.miniChampImg}
								src={getChampionIcon(p.stat.championName)}
								alt={p.stat.championKoName || p.stat.championName}
								onError={e => {
									e.currentTarget.style.visibility = 'hidden';
								}}
							/>
						) : (
							<span className={classes.miniChampSlot}>
								{posIconKey && (
									<PositionIcon
										position={posIconKey}
										className={classes.miniPosIcon}
										fallbackClassName={classes.posFallback}
									/>
								)}
							</span>
						)}
						<span
							className={cx(classes.miniName, p.puuid === perspectivePuuid && classes.miniNameMe)}
							title={p.name}
							onClick={e => goUser(e, p)}
						>
							{p.name}
						</span>
					</div>
				);
			})}
		</div>
	);

	if (!matches || matches.length === 0) {
		return (
			<div className={classes.emptyState}>
				<div className={classes.emptyIcon}>
					<span role="img" aria-label="scroll">
						📜
					</span>
				</div>
				<div className={classes.emptyText}>내전 기록이 없습니다</div>
			</div>
		);
	}

	return (
		<div className={classes.wrapper}>
			{matches.map(match => {
				const ctx = getMyContext(match);
				if (!ctx) return null;
				const { won, myLp, myStat, myTeamPlayers, myPosition, myTier } = ctx;
				const expanded = expandedIds.has(match.gameId);
				const durationSec = match.gameDurationSec || (myStat && myStat.gameDurationSec) || null;
				const kdaRatio = myStat ? getKdaRatio(myStat) : null;
				const csPerMin = myStat && durationSec ? (myStat.cs / (durationSec / 60)).toFixed(1) : null;
				const kp = myStat ? getKillParticipation(myStat, myTeamPlayers) : null;
				const laneShare = myStat ? getLaneShare(myStat) : null;
				const multiKill = myStat ? getMultiKillBadge(myStat) : null;
				const patch = match.gameVersion ? match.gameVersion.split('.').slice(0, 2).join('.') : null;
				const posIconKey = POSITION_ICON_KEY[myPosition];
				return (
					<div
						key={match.gameId}
						className={cx(classes.matchCard, won ? classes.matchWin : classes.matchLose)}
						onClick={() => toggleExpand(match.gameId)}
					>
						<div className={classes.rowMain}>
							<div className={classes.resultCol}>
								<span className={won ? classes.resultWin : classes.resultLose}>{won ? '승리' : '패배'}</span>
								{renderLp(myLp)}
								<span className={classes.metaText} title={formatFullDateTime(match.createdAt)}>
									{formatRelativeTime(match.createdAt)}
								</span>
								{durationSec != null && <span className={classes.metaText}>{formatDuration(durationSec)}</span>}
								{patch && <span className={classes.metaText}>패치 {patch}</span>}
							</div>
							{myTier && (
								<div className={classes.myTierCol}>
									<img
										className={classes.myTierEmblem}
										src={`/assets/images/ranked-emblems/Emblem_${getTierIconName(myTier)}.webp`}
										alt={myTier}
									/>
									<span className={classes.myTierLabel} style={{ color: getTierColor(myTier) }}>
										{getTierShortName(myTier)}
									</span>
									<span className={classes.myTierCaption}>당시 티어</span>
								</div>
							)}
							<div className={classes.champCol}>
								{posIconKey && (
									<span className={classes.posSlot}>
										<PositionIcon
											position={posIconKey}
											className={classes.posIcon}
											fallbackClassName={classes.posFallback}
										/>
									</span>
								)}
								{myStat ? (
									<>
										<div className={classes.champColInner}>
											<div className={classes.champTopRow}>
												<span className={classes.champWrap}>
													<img
														className={classes.champImg}
														src={getChampionIcon(myStat.championName)}
														alt={myStat.championKoName || myStat.championName}
														onError={e => {
															e.currentTarget.style.visibility = 'hidden';
														}}
													/>
													{myStat.champLevel != null && (
														<span className={classes.champLevel}>{myStat.champLevel}</span>
													)}
												</span>
												<SpellRuneGrid
													stat={myStat}
													getPerkIcon={getPerkIcon}
													gridClass={classes.spellRuneGrid}
													iconClass={classes.spellRuneIcon}
													emptyClass={classes.spellRuneEmpty}
												/>
												<div className={classes.kdaBlock}>
													<span className={classes.champNameSmall}>
														{myStat.championKoName || myStat.championName}
													</span>
													<span className={classes.kdaLine}>
														{myStat.kills} / <span className={classes.kdaDeath}>{myStat.deaths}</span> /{' '}
														{myStat.assists}
													</span>
													<span className={classes.kdaRatio} style={{ color: kdaRatioColor(kdaRatio) }}>
														{kdaRatio == null ? 'Perfect' : `${kdaRatio.toFixed(2)}:1 평점`}
													</span>
												</div>
											</div>
											{myStat.items && (
												<div className={classes.champBottomRow}>
													<ItemsRow
													stat={myStat}
													rowClass={classes.itemsRow}
													imgClass={classes.itemImg}
													emptyClass={classes.itemEmpty}
													gapClass={classes.trinketGap}
												/>
												</div>
											)}
										</div>
										<div className={classes.miniStats}>
											{kp != null && (
												<span className={classes.miniStatLine}>
													킬관여 <span className={classes.miniStatValue}>{kp}%</span>
												</span>
											)}
											<span className={classes.miniStatLine}>
												CS{' '}
												<span className={classes.miniStatValue}>
													{myStat.cs}
													{csPerMin != null ? ` (${csPerMin})` : ''}
												</span>
											</span>
											{laneShare != null && (
												<span
													className={classes.miniStatLine}
													title="게임 전체 최종 골드 기준, 맞라인 상대와의 지분"
												>
													맞라인{' '}
													<span
														className={cx(
															classes.miniStatValue,
															laneShare > 50 && classes.laneWin,
															laneShare < 50 && classes.laneLose
														)}
													>
														{laneShare}
													</span>{' '}
													: {100 - laneShare}
												</span>
											)}
										</div>
										<div className={classes.miniStats}>
											<span className={classes.miniStatLine}>
												딜량 <span className={classes.miniStatValue}>{formatK(myStat.damageToChampions)}</span>
											</span>
											<span className={classes.miniStatLine}>
												골드 <span className={classes.miniStatValue}>{formatK(myStat.goldEarned)}</span>
											</span>
											{myStat.visionScore != null && (
												<span className={classes.miniStatLine}>
													시야 <span className={classes.miniStatValue}>{myStat.visionScore}</span>
													{myStat.wardsPlaced != null &&
														` · 와드 ${myStat.wardsPlaced}/${myStat.wardsKilled != null ? myStat.wardsKilled : 0}`}
												</span>
											)}
										</div>
									</>
								) : (
									<span className={classes.noDetail}>상세 미수집</span>
								)}
							</div>
							{isDesktop && (
							<div className={classes.miniRosters}>
								{(multiKill || (myStat && myStat.firstBloodKill)) && (
									<div className={classes.badgeCol}>
										{multiKill && <span className={classes.killBadge}>{multiKill}</span>}
										{myStat.firstBloodKill && <span className={classes.fbBadge}>퍼블</span>}
									</div>
								)}
								{renderMiniRoster(match.team1)}
								{renderMiniRoster(match.team2)}
							</div>
							)}
							<ExpandMoreIcon className={cx(classes.expandIcon, expanded && classes.expandIconOpen)} />
						</div>
						{expanded && <MatchDetail match={match} perspectivePuuid={perspectivePuuid} />}
					</div>
				);
			})}
			<TablePagination
				className={classes.pagination}
				component="div"
				count={total}
				rowsPerPage={rowsPerPage}
				rowsPerPageOptions={[]}
				page={page - 1}
				backIconButtonProps={{ 'aria-label': 'Previous Page' }}
				nextIconButtonProps={{ 'aria-label': 'Next Page' }}
				onPageChange={(event, newPage) => onPageChange(newPage + 1)}
			/>
		</div>
	);
}

export default InternalMatchList;
