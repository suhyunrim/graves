import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { useNavigate } from 'react-router-dom';
import TablePagination from '@mui/material/TablePagination';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getChampionIcon } from 'app/main/challenge/ddragonUtils';
import { getTierShortName, getTierIconName, getTierColor } from '../components/MatchList';
import PositionIcon from '../tournament/PositionIcon';

// 탑 → 정글 → 미드 → 원딜 → 서폿 고정 순서 (MatchList와 동일)
const POSITIONS = [
	{ key: 'TOP', icon: 'top' },
	{ key: 'JUNGLE', icon: 'jungle' },
	{ key: 'MIDDLE', icon: 'mid' },
	{ key: 'BOTTOM', icon: 'adc' },
	{ key: 'UTILITY', icon: 'support' }
];
const POSITION_ORDER = POSITIONS.reduce((acc, pos, i) => {
	acc[pos.key] = i;
	return acc;
}, {});
const POSITION_ICON_KEY = POSITIONS.reduce((acc, pos) => {
	acc[pos.key] = pos.icon;
	return acc;
}, {});

// 매치 데이터의 position이 없으면 수집 스탯의 position으로 폴백
const getPlayerPosition = player => player.position || (player.stat && player.stat.position) || null;

const sortPlayers = players =>
	[...players].sort((a, b) => {
		const ao = POSITION_ORDER[getPlayerPosition(a)];
		const bo = POSITION_ORDER[getPlayerPosition(b)];
		const aHas = ao !== undefined;
		const bHas = bo !== undefined;
		if (aHas && bHas) return ao - bo;
		if (aHas !== bHas) return aHas ? -1 : 1;
		return b.rating - a.rating;
	});

const formatDate = utcDateString => {
	const date = new Date(utcDateString);
	const year = String(date.getFullYear()).slice(-2);
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// KDA 배율 색상 (op.gg 관례: 높을수록 강조)
const kdaRatioColor = ratio => {
	if (ratio == null) return '#ffd700'; // Perfect
	if (ratio >= 4) return '#ffd700';
	if (ratio >= 3) return '#00d4ff';
	if (ratio >= 2) return 'rgba(255, 255, 255, 0.85)';
	return 'rgba(255, 255, 255, 0.5)';
};

const getKdaRatio = stat => (stat.deaths === 0 ? null : Math.round(((stat.kills + stat.assists) / stat.deaths) * 100) / 100);

const formatDamage = v => {
	if (v == null) return '-';
	return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v);
};

const useStyles = makeStyles()((theme) => ({
	wrapper: {
		display: 'flex',
		flexDirection: 'column',
		gap: 10
	},
	matchCard: {
		borderRadius: 12,
		overflow: 'hidden',
		cursor: 'pointer',
		border: '1px solid rgba(255, 255, 255, 0.08)',
		transition: 'border-color 0.2s ease',
		'&:hover': {
			borderColor: 'rgba(0, 212, 255, 0.35)'
		}
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
		gap: 18,
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
		minWidth: 92,
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
		minWidth: 0
	},
	champImg: {
		width: 48,
		height: 48,
		borderRadius: '50%',
		objectFit: 'cover',
		border: '2px solid rgba(255, 255, 255, 0.25)',
		flexShrink: 0,
		[theme.breakpoints.down('sm')]: {
			width: 40,
			height: 40
		}
	},
	kdaBlock: {
		display: 'flex',
		flexDirection: 'column',
		gap: 1
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
	csText: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.15rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.6)',
		whiteSpace: 'nowrap'
	},
	noDetail: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.3)'
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
		flexShrink: 0,
		marginLeft: 'auto'
	},
	expandIconOpen: {
		transform: 'rotate(180deg)'
	},
	// 펼침 상세
	detailWrap: {
		display: 'grid',
		gridTemplateColumns: '1fr 1fr',
		gap: 0,
		borderTop: '1px solid rgba(255, 255, 255, 0.08)',
		background: 'rgba(0, 0, 0, 0.25)',
		cursor: 'default',
		[theme.breakpoints.down('md')]: {
			gridTemplateColumns: '1fr'
		}
	},
	teamBlock: {
		padding: '12px 16px'
	},
	teamWin: {
		borderLeft: '3px solid rgba(0, 200, 83, 0.6)'
	},
	teamLose: {
		borderLeft: '3px solid rgba(255, 82, 82, 0.6)'
	},
	teamHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		marginBottom: 10
	},
	teamName: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.25rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.8)'
	},
	teamResultWin: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 700,
		color: '#00e676'
	},
	teamResultLose: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 700,
		color: '#ff5252'
	},
	playerRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		padding: '3px 0'
	},
	detailChampImg: {
		width: 26,
		height: 26,
		borderRadius: '50%',
		objectFit: 'cover',
		border: '1px solid rgba(255, 255, 255, 0.2)',
		flexShrink: 0
	},
	tierIcon: {
		width: 22,
		height: 22,
		flexShrink: 0
	},
	tierBadge: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.05rem',
		fontWeight: 700,
		minWidth: 32,
		flexShrink: 0,
		textAlign: 'center',
		padding: '1px 4px',
		borderRadius: 4,
		background: 'rgba(255, 255, 255, 0.1)'
	},
	playerName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: '#fff',
		cursor: 'pointer',
		minWidth: 0,
		flex: '1 1 auto',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	playerNameHighlight: {
		fontWeight: 700,
		color: '#00d4ff',
		background: 'rgba(0, 212, 255, 0.15)',
		padding: '1px 6px',
		borderRadius: 4
	},
	playerStat: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.65)',
		whiteSpace: 'nowrap',
		flexShrink: 0
	},
	playerStatSub: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.4)',
		whiteSpace: 'nowrap',
		flexShrink: 0,
		minWidth: 68,
		textAlign: 'right',
		[theme.breakpoints.down('sm')]: {
			display: 'none'
		}
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
 * - perspectivePuuid 기준 승(초록)/패(빨강) 행 배경
 * - 헬퍼 수집 매치는 내 챔피언/KDA/CS 표시, 미수집 매치는 "상세 미수집" 폴백
 * - 행 클릭 시 10인 상세(챔피언/티어/KDA/CS/딜량) 펼침
 * 그룹 매치기록 페이지의 MatchList와 별개 컴포넌트 (관점·챔피언 중심이라 구조가 다름).
 */
function InternalMatchList({ matches, total, page, rowsPerPage, onPageChange, perspectivePuuid }) {
	const { classes, cx } = useStyles();
	const navigate = useNavigate();
	const [expandedIds, setExpandedIds] = useState(() => new Set());

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
			myPosition: me ? getPlayerPosition(me) : null
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

	const renderTeamDetail = (match, teamNo) => {
		const team = teamNo === 1 ? match.team1 : match.team2;
		const won = match.winTeam === teamNo;
		return (
			<div className={cx(classes.teamBlock, won ? classes.teamWin : classes.teamLose)}>
				<div className={classes.teamHeader}>
					<span role="img" aria-label={teamNo === 1 ? 'dog' : 'cat'}>
						{teamNo === 1 ? '🐶' : '🐱'}
					</span>
					<span className={classes.teamName}>Team {teamNo}</span>
					<span className={won ? classes.teamResultWin : classes.teamResultLose}>{won ? 'WIN' : 'LOSE'}</span>
				</div>
				{sortPlayers(team.players).map(player => {
					const pos = getPlayerPosition(player);
					const posIconKey = POSITION_ICON_KEY[pos];
					const { stat } = player;
					const isMe = player.puuid === perspectivePuuid;
					return (
						<div key={player.puuid} className={classes.playerRow}>
							<span className={classes.posSlot}>
								{posIconKey && (
									<PositionIcon position={posIconKey} className={classes.posIcon} fallbackClassName={classes.posFallback} />
								)}
							</span>
							{stat && (
								<img
									className={classes.detailChampImg}
									src={getChampionIcon(stat.championName)}
									alt={stat.championKoName || stat.championName}
									title={stat.championKoName || stat.championName}
									onError={e => {
										e.currentTarget.style.visibility = 'hidden';
									}}
								/>
							)}
							<img
								className={classes.tierIcon}
								src={`/assets/images/ranked-emblems/Emblem_${getTierIconName(player.tier)}.webp`}
								alt={player.tier}
							/>
							<span className={classes.tierBadge} style={{ color: getTierColor(player.tier) }}>
								{getTierShortName(player.tier)}
							</span>
							<span
								className={cx(classes.playerName, isMe && classes.playerNameHighlight)}
								title={player.name}
								onClick={e => {
									e.stopPropagation();
									navigate(`/userinfo/${player.puuid}`);
								}}
							>
								{player.name}
							</span>
							{stat && (
								<>
									<span className={classes.playerStat}>
										{stat.kills} / {stat.deaths} / {stat.assists}
									</span>
									<span className={classes.playerStatSub}>
										CS {stat.cs} · {formatDamage(stat.damageToChampions)}
									</span>
								</>
							)}
						</div>
					);
				})}
			</div>
		);
	};

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
				const { won, myLp, myStat, myPosition } = ctx;
				const expanded = expandedIds.has(match.gameId);
				const durationSec = match.gameDurationSec || (myStat && myStat.gameDurationSec) || null;
				const kdaRatio = myStat ? getKdaRatio(myStat) : null;
				const csPerMin = myStat && durationSec ? (myStat.cs / (durationSec / 60)).toFixed(1) : null;
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
								<span className={classes.metaText}>{formatDate(match.createdAt)}</span>
								{durationSec != null && <span className={classes.metaText}>{Math.round(durationSec / 60)}분</span>}
							</div>
							<div className={classes.champCol}>
								{myStat ? (
									<>
										<img
											className={classes.champImg}
											src={getChampionIcon(myStat.championName)}
											alt={myStat.championKoName || myStat.championName}
											onError={e => {
												e.currentTarget.style.visibility = 'hidden';
											}}
										/>
										<div className={classes.kdaBlock}>
											<span className={classes.champNameSmall}>{myStat.championKoName || myStat.championName}</span>
											<span className={classes.kdaLine}>
												{myStat.kills} / <span className={classes.kdaDeath}>{myStat.deaths}</span> / {myStat.assists}
											</span>
											<span className={classes.kdaRatio} style={{ color: kdaRatioColor(kdaRatio) }}>
												{kdaRatio == null ? 'Perfect' : `${kdaRatio.toFixed(2)} 평점`}
											</span>
										</div>
										<span className={classes.csText}>
											CS {myStat.cs}
											{csPerMin != null ? ` (${csPerMin})` : ''}
										</span>
									</>
								) : (
									<span className={classes.noDetail}>상세 미수집</span>
								)}
							</div>
							{posIconKey && (
								<span className={classes.posSlot}>
									<PositionIcon position={posIconKey} className={classes.posIcon} fallbackClassName={classes.posFallback} />
								</span>
							)}
							<ExpandMoreIcon className={cx(classes.expandIcon, expanded && classes.expandIconOpen)} />
						</div>
						{expanded && (
							<div className={classes.detailWrap} onClick={e => e.stopPropagation()}>
								{renderTeamDetail(match, 1)}
								{renderTeamDetail(match, 2)}
							</div>
						)}
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
